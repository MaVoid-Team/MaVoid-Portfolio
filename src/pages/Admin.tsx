import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PasskeyModal } from '../components/PasskeyModal';
import { AddProjectModal } from '../components/AddProjectModal';
import { EditProjectModal } from '../components/EditProjectModal';
import * as projectApi from '../api/projects';
import type { Project } from '../types/project';
import { motion } from 'motion/react';
import { Lock, Edit, Plus, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../i18n/context';

export default function Admin() {
  const { t, locale } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);

  const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [passkeyAction, setPasskeyAction] = useState<'add' | 'edit'>('add');

  // Load projects from Firestore with real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        const firebaseProjects = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Project));
        
        // Set projects from Firestore (may be empty)
        setProjects(firebaseProjects);
      },
      (error) => {
        console.error('Failed to load projects:', error);
        setProjects([]);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddClick = () => {
    setPasskeyAction('add');
    setIsPasskeyModalOpen(true);
  };

  const handleEditClick = () => {
    setPasskeyAction('edit');
    setIsPasskeyModalOpen(true);
  };

  const handlePasskeySuccess = () => {
    setIsPasskeyModalOpen(false);
    if (passkeyAction === 'add') {
      setIsAddProjectModalOpen(true);
    } else {
      setIsEditProjectModalOpen(true);
    }
  };

  const handleAddProject = async (newProject: Omit<Project, 'id'>) => {
    try {
      await projectApi.createProject(newProject);
      // No need to manually update state - Firestore listener will do it
    } catch (error) {
      console.error('Failed to add project:', error);
    }
  };

  const handleEditProject = async (id: string, updatedProject: Omit<Project, 'id'>) => {
    try {
      await projectApi.updateProject(id, updatedProject);
      // No need to manually update state - Firestore listener will do it
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await projectApi.deleteProject(id);
      // No need to manually update state - Firestore listener will do it
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleBackToHome = () => {
    globalThis.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--main-page-bg)' }}>
      {/* Back Button */}
      <motion.button
        onClick={handleBackToHome}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-8 left-8 p-3 rounded-xl backdrop-blur-md transition-colors z-50"
        style={{
          background: 'var(--glass-bg)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--glass-border)',
          color: 'var(--text-main)'
        }}
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'var(--card)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'var(--glass-border)'
          }}
        >
          {/* Header */}
          <div className="relative p-8 text-center" style={{
            background: 'linear-gradient(135deg, rgba(23, 138, 160, 0.2), rgba(95, 184, 199, 0.2))'
          }}>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #178aa0, #5fb8c7)' }}
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl mb-2" style={{ color: 'var(--text-main)' }}>{t('adminPanel')}</h1>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              {t('manageProjects')}
            </p>
          </div>

          {/* Admin Actions */}
          <div className="p-8 space-y-4">
            {/* Add Project Button */}
            <motion.button
              onClick={handleAddClick}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              className="w-full p-4 rounded-xl transition-all flex items-center gap-4 group"
              style={{
                background: 'linear-gradient(90deg, #0f6a7a 0%, #178aa0 50%, #5fb8c7 100%)',
                boxShadow: '0 4px 20px rgba(23, 138, 160, 0.3)'
              }}
            >
              {locale === 'ar' && (
                <motion.div
                  animate={{ x: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowLeft className="w-5 h-5 text-white rotate-180" />
                </motion.div>
              )}
              {locale === 'en' && (<div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/10">
                <Plus className="w-6 h-6 text-white" />
              </div>)}
              <div className={`flex-1 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                <div className="font-medium text-white">{t('addNewProject')}</div>
                <div className="text-sm text-cyan-100">{t('createPortfolio')}</div>
              </div>
              {locale === 'ar' && (<div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/10">
                <Plus className="w-6 h-6 text-white" />
              </div>)}
              {locale !== 'ar' && (
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowLeft className="w-5 h-5 text-white rotate-180" />
                </motion.div>
              )}
            </motion.button>

            {/* Edit Project Button */}
            <motion.button
              onClick={handleEditClick}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              className="w-full p-4 rounded-xl transition-all flex items-center gap-4 group"
              style={{
                background: 'var(--secondary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--glass-border)'
              }}
            >
              {locale === 'ar' && (
                <motion.div
                  animate={{ x: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowLeft className="w-5 h-5 text-teal-300 rotate-180" />
                </motion.div>
              )}
              {locale === 'en' && (<div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(23, 138, 160, 0.2), rgba(95, 184, 199, 0.2))'
              }}>
                <Edit className="w-6 h-6 text-teal-300" />
              </div>)}
              <div className={`flex-1 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                <div className="font-medium" style={{ color: 'var(--text-main)' }}>{t('editProjects')}</div>
                <div className="text-sm" style={{ color: 'var(--text-dim)' }}>{t('modifyDelete')}</div>
              </div>
              {locale === 'ar' && (<div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, rgba(23, 138, 160, 0.2), rgba(95, 184, 199, 0.2))'
              }}>
                <Edit className="w-6 h-6 text-teal-300" />
              </div>)}
              {locale !== 'ar' && (
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowLeft className="w-5 h-5 text-teal-300 rotate-180" />
                </motion.div>
              )}
            </motion.button>

            {/* Stats */}
            <div className="pt-4 text-center" style={{ color: 'var(--text-dim)' }}>
              <p className="text-sm">
                {t('totalProjects')}: <span className="font-medium text-cyan-300">{projects.length}</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <PasskeyModal
        isOpen={isPasskeyModalOpen}
        onClose={() => setIsPasskeyModalOpen(false)}
        onSuccess={handlePasskeySuccess}
      />
      
      <AddProjectModal
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onAdd={handleAddProject}
      />

      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        projects={projects}
        onEdit={handleEditProject}
        onDelete={handleDeleteProject}
      />
    </div>
  );
}
