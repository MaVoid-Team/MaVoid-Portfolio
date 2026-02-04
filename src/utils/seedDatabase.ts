import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Seeding disabled: this project fetches projects from Firestore directly.
 * If you need to seed data, reintroduce a seeding script that reads from a
 * secure environment or explicit command — we avoid using local manual data.
 */
export async function seedProjectsIfEmpty(): Promise<boolean> {
  console.log('Seeding disabled: not using manual projects data.');
  return false;
}

/**
 * Seeds custom categories if they don't already exist
 */
export async function seedCategoriesIfEmpty(): Promise<boolean> {
  try {
    // Check if custom categories exist
    const categoriesSnapshot = await getDocs(collection(db, 'customCategories'));
    
    if (categoriesSnapshot.size > 0) {
      console.log('Custom categories already exist in Firestore. Skipping seed.');
      return false;
    }

    console.log('No custom categories to seed (they are created dynamically)');
    return true;
  } catch (error) {
    console.error('Failed to check categories:', error);
    return false;
  }
}
