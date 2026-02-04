import { motion } from 'motion/react';
import { ExternalLink, Monitor } from 'lucide-react';
import type { Project } from '../types/project';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { forwardRef } from 'react';
import { useLanguage } from '../i18n/context';

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick?: () => void;
}

// Default category-specific color themes (fallback if no custom colors)
const categoryThemes = {
  ecommerce: {
    primary: '#178aa0',
    secondary: '#0f6a7a',
    accent: '#5fb8c7',
  },
  corporate: {
    primary: '#178aa0',
    secondary: '#0c4a5a',
    accent: '#5fb8c7',
  },
  healthcare: {
    primary: '#0f6a7a',
    secondary: '#015670',
    accent: '#5fb8c7',
  },
  food: {
    primary: '#5fb8c7',
    secondary: '#178aa0',
    accent: '#7dd3e0',
  },
  realestate: {
    primary: '#015670',
    secondary: '#0c4a5a',
    accent: '#178aa0',
  },
};

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const ProjectCard = forwardRef<HTMLButtonElement, ProjectCardProps>(({ project, index, onClick }, ref) => {
  const { locale, dir, t } = useLanguage();
  
  // Use custom colors if available, otherwise fallback to category theme
  const defaultTheme = categoryThemes[project.categoryValue as keyof typeof categoryThemes] || categoryThemes.ecommerce;
  const colors = project.customColors || defaultTheme;

  // Get localized content
  const title = locale === 'ar' ? project.titleAr : project.title;
  const description = locale === 'ar' ? project.descriptionAr : project.description;

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      whileHover={{ y: -8 }}
      className="group relative bg-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300 w-full text-left cursor-pointer"
      style={{
        borderColor: hexToRgba(colors.primary, 0.6),
        boxShadow: `0 4px 20px ${hexToRgba(colors.primary, 0.15)}`,
      }}
      dir={dir}
    >
      {/* Category indicator bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 z-10"
        style={{
          background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent}, ${colors.primary})`,
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['0% 0', '200% 0'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={project.image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t to-transparent opacity-50 group-hover:opacity-30 transition-opacity"
          style={{
            backgroundImage: `linear-gradient(to top, ${hexToRgba(colors.secondary, 1)}, ${hexToRgba(colors.secondary, 0.4)}, transparent)`
          }}
        />
        
        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom right, ${hexToRgba(colors.primary, 0.2)}, ${hexToRgba(colors.accent, 0.2)})`
          }}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-sm p-4 rounded-full border border-white/20 scale-0 group-hover:scale-100 transition-transform duration-300"
            style={{
              boxShadow: `0 0 20px ${hexToRgba(colors.primary, 0.4)}`,
            }}
          >
            <Monitor className="w-8 h-8 text-white" />
          </motion.div>
        </div>

        {/* Category badge */}
        <motion.div
          initial={{ x: dir === 'rtl' ? 100 : -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.03 + 0.1, duration: 0.3 }}
          className={`absolute top-4 ${dir === 'rtl' ? 'right-4' : 'left-4'} px-3 py-1 backdrop-blur-md rounded-full border`}
          style={{
            backgroundColor: hexToRgba(colors.secondary, 0.3),
            borderColor: hexToRgba(colors.accent, 0.5),
          }}
        >
          <span 
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: colors.accent }}
          >
            {locale === 'ar' && project.categoryAr ? project.categoryAr : project.categoryEn}
          </span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 
          className="text-2xl text-white mb-2 transition-colors"
          style={{
            '--hover-color': colors.accent,
            textAlign: dir === 'rtl' ? 'right' : 'left',
          } as React.CSSProperties}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.accent}
          onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
        >
          {title}
        </h3>
        <p 
          className="text-slate-400 mb-4 line-clamp-2"
          style={{
            textAlign: dir === 'rtl' ? 'right' : 'left',
          }}
        >
          {description}
        </p>
      </div>

      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${hexToRgba(colors.primary, 0.4)}, transparent)`,
          backgroundSize: '200% 100%',
        }}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Corner accent */}
      <motion.div
        className={`absolute bottom-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-24 h-24 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none`}
        style={{
          background: `radial-gradient(circle at bottom ${dir === 'rtl' ? 'left' : 'right'}, ${colors.primary}, transparent)`,
        }}
      />
    </motion.button>
  );
});

ProjectCard.displayName = 'ProjectCard';