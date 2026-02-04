import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'sonner';
import { t } from '../i18n/i18n';

export interface Category {
  id?: string;
  value: string;
  labelEn: string;
  labelAr?: string;
}

const CATEGORIES_COLLECTION = 'customCategories';

/**
 * Fetch all custom categories from Firestore
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Category));
  } catch (error) {
    console.error('Failed to load categories:', error);
    toast.error(t('categoryLoadError'));
    return [];
  }
}

/**
 * Create a new category in Firestore
 */
export async function createCategory(data: {
  categoryValue: string;
  labelEn: string;
  labelAr: string;
}): Promise<Category> {
  try {
    // Check if category already exists
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where('value', '==', data.categoryValue)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      toast.error(t('categoryAlreadyExists'));
      throw new Error('Category already exists');
    }

    const newCategory: Omit<Category, 'id'> = {
      value: data.categoryValue,
      labelEn: data.labelEn,
      labelAr: data.labelAr,
    };

    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), newCategory);

    // Dispatch event to notify other components
    globalThis.dispatchEvent(new Event('customCategoriesUpdated'));

    return {
      id: docRef.id,
      ...newCategory,
    };
  } catch (error) {
    console.error('Failed to create category:', error);
    toast.error(t('categoryCreateError'));
    throw error;
  }
}

/**
 * Delete a category from Firestore
 */
export async function deleteCategory(categoryValue: string): Promise<void> {
  try {
    // Find the document with this value
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where('value', '==', categoryValue)
    );
    const querySnapshot = await getDocs(q);

    // Delete all matching documents
    for (const docSnapshot of querySnapshot.docs) {
      await deleteDoc(doc(db, CATEGORIES_COLLECTION, docSnapshot.id));
    }

    // Dispatch event to notify other components
    globalThis.dispatchEvent(new Event('customCategoriesUpdated'));
  } catch (error) {
    console.error('Failed to delete category:', error);
    toast.error(t('categoryDeleteError'));

    // Fallback for BloomFilterError or query issues: try mass-scan + delete by id
    // This helps if a where() query fails due to a client cache/index issue.
    try {
      const snapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
      const matches = snapshot.docs.filter(d => d.data().value === categoryValue);
      for (const m of matches) {
        await deleteDoc(doc(db, CATEGORIES_COLLECTION, m.id));
      }
      globalThis.dispatchEvent(new Event('customCategoriesUpdated'));
    } catch (fallbackError) {
      console.error('Fallback delete also failed:', fallbackError);
    }

    throw error;
  }
}
