import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Project } from '../types/project';
import { toast } from 'sonner';
import { t } from '../i18n/i18n';

const PROJECTS_COLLECTION = 'projects';

/**
 * Create a new project in Firestore
 */
export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
    try {
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...project,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      id: docRef.id,
      ...project,
    } as Project;
  } catch (error) {
    console.error('Failed to create project:', error);
    toast.error(t('projectCreationFailed'));
    throw error;
  }
}

/**
 * Update an existing project in Firestore
 */
export async function updateProject(id: string, updates: Omit<Project, 'id'>): Promise<Project> {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, id);
    
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(projectRef, updatedData);

    return {
      id,
      ...updates,
    } as Project;
  } catch (error) {
    console.error('Failed to update project:', error);
    toast.error(t('projectUpdateError'));
    throw error;
  }
}

/**
 * Delete a project from Firestore
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    const projectRef = doc(db, PROJECTS_COLLECTION, id);
    await deleteDoc(projectRef);
  } catch (error) {
    console.error('Failed to delete project:', error);
    toast.error(t('projectDeletedError'));
    throw error;
  }
}

/**
 * Fetch all projects from Firestore
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const querySnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
    return querySnapshot.docs.map(docSnapshot => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    } as Project));
  } catch (error) {
    console.error('Failed to load projects:', error);
    return [];
  }
}
