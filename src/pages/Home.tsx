import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Header } from '../components/Header';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProjectGrid } from '../components/ProjectGrid';
import { Footer } from '../components/Footer';
import { ProjectViewModal } from '../components/ProjectViewModal';
import { defaultCategoryIcons } from '../constants/defaultCategoryIcons';

import type { Project } from '../types/project';

interface HomeProps {
  readonly searchParams: URLSearchParams;
}

export default function Home({ searchParams }: Readonly<HomeProps>) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectViewModalOpen, setIsProjectViewModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [customCategories, setCustomCategories] = useState<{ value: string; labelEn: string; labelAr: string }[]>([]);

  // Handle URL parameter for project viewing
  useEffect(() => {
    const projectId = searchParams.get('project');
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project?.id !== selectedProject?.id) {
        setSelectedProject(project ?? null);
        setIsProjectViewModalOpen(!!project);
      }
    } else if (isProjectViewModalOpen) {
      setIsProjectViewModalOpen(false);
      setSelectedProject(null);
    }
  }, [searchParams, selectedProject?.id, isProjectViewModalOpen]);

  // Load custom categories from Firestore with real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'customCategories'),
      (snapshot) => {
        const categories = snapshot.docs.map(doc => ({
          value: doc.data().value,
          labelEn: doc.data().labelEn,
          labelAr: doc.data().labelAr,
        }));
        setCustomCategories(categories);
      },
      (error) => {
        console.error('Failed to load custom categories:', error);
        setCustomCategories([]);
      }
    );

    return () => unsubscribe();
  }, []);

  // Load projects from Firestore with real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        const firebaseProjects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Project));
        
        // Set projects from Firestore (may be empty until seeded)
        setProjects(firebaseProjects);
      },
      (error) => {
        console.error('Failed to load projects:', error);
        setProjects([]);
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen for custom category changes from event system
  useEffect(() => {
    const handleCustomUpdate = () => {
      // The Firestore listener above will automatically update customCategories
    };

    globalThis.addEventListener('customCategoriesUpdated', handleCustomUpdate);

    return () => {
      globalThis.removeEventListener('customCategoriesUpdated', handleCustomUpdate);
    };
  }, []);

  // Build categories from projects with bilingual support
  const buildCategories = () => {
    const uniqueCategories = new Map<string, { value: string; labelEn: string; labelAr: string; icon: string }>();
    
    // Add 'all' category
    uniqueCategories.set('all', { 
      value: 'all', 
      labelEn: 'All Projects', 
      labelAr: 'جميع المشاريع',
      icon: 'LayoutGrid'
    });
    
    // Extract categories from projects
    projects.forEach(project => {
      if (!uniqueCategories.has(project.categoryValue)) {
        uniqueCategories.set(project.categoryValue, {
          value: project.categoryValue,
          labelEn: project.categoryEn,
          labelAr: project.categoryAr,
          icon: defaultCategoryIcons[project.categoryValue] || 'Folder'
        });
      }
    });
    
    // Add custom categories from localStorage
    customCategories.forEach(cat => {
      if (!uniqueCategories.has(cat.value)) {
        uniqueCategories.set(cat.value, {
          value: cat.value,
          labelEn: cat.labelEn,
          labelAr: cat.labelAr || cat.labelEn,
          icon: 'Folder'
        });
      }
    });
    
    return Array.from(uniqueCategories.values());
  };
  
  const allCategories = buildCategories();

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(project => project.categoryValue === selectedCategory);

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsProjectViewModalOpen(true);
    // Update URL without reloading page
    globalThis.history.pushState({}, '', `/?project=${project.id}`);
    globalThis.dispatchEvent(new Event('navigate'));
  };

  const handleCloseProject = () => {
    setIsProjectViewModalOpen(false);
    setSelectedProject(null);
    // Remove project parameter from URL
    globalThis.history.pushState({}, '', '/');
    globalThis.dispatchEvent(new Event('navigate'));
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--main-page-bg)' }}>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <CategoryFilter
          categories={allCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          allProjects={projects}
        />
        <ProjectGrid projects={filteredProjects} onProjectClick={handleViewProject} />
      </div>
      <Footer />

      <ProjectViewModal
        isOpen={isProjectViewModalOpen}
        onClose={handleCloseProject}
        project={selectedProject}
      />
    </div>
  );
}