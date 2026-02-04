import { motion, AnimatePresence } from 'motion/react';
import { ProjectCard } from './ProjectCard';
import type { Project } from '../types/project';
import { useLanguage } from '../i18n/context';

interface ProjectGridProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

export function ProjectGrid({ projects, onProjectClick }: ProjectGridProps) {
  const { t } = useLanguage();
  
  return (
    <div id="projects">
      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <p className="text-slate-400 text-xl">{t('noProjectsDesc')}</p>
        </motion.div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {projects.map((project, index) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                index={index}
                onClick={() => onProjectClick?.(project)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
