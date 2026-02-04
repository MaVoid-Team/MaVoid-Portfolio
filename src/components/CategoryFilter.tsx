import { motion } from 'motion/react';
import { LayoutGrid, ShoppingCart, Building2, Heart, Utensils, Home, Folder, Trophy } from 'lucide-react';
import { useLanguage } from '../i18n/context';
import type { Project } from '../types/project';

interface Category {
  value: string;
  labelEn: string;
  labelAr: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  allProjects: Project[];
}

const iconMap: Record<string, any> = {
  LayoutGrid,
  ShoppingCart,
  Building2,
  Heart,
  Utensils,
  Home,
  Trophy,
  Folder, // Default icon for custom categories
};

export function CategoryFilter({ categories, selectedCategory, onCategoryChange, allProjects }: CategoryFilterProps) {
  const { dir, locale } = useLanguage();
  
  return (
    <div id="categories" className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl mb-4" style={{ color: 'var(--text-main)' }}>{locale === 'ar' ? 'المشاريع' : 'Projects'}</h2>
        <p className="text-lg" style={{ color: 'var(--text-dim)' }}>
          {locale === 'ar' ? 'اختر فئة لتصفية المشاريع' : 'Choose a category to filter the projects'}
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3" dir={dir}>
        {categories.map((category, index) => {
          const Icon = iconMap[category.icon] || Folder; // Fallback to Folder icon
          const isSelected = selectedCategory === category.value;
          const categoryLabel = locale === 'ar' ? category.labelAr : category.labelEn;
          const projectCount = category.value === 'all' ? allProjects.length : allProjects.filter(p => p.categoryValue === category.value).length;

          return (
            <motion.button
              key={category.value}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCategoryChange(category.value)}
              className={`
                group relative px-6 py-3 rounded-full transition-all duration-300
                ${isSelected
                  ? 'text-white shadow-lg'
                  : 'hover:bg-opacity-80 border'
                }
              `}
              style={isSelected ? {
                background: 'linear-gradient(90deg, #0f6a7a 0%, #178aa0 50%, #5fb8c7 100%)',
                boxShadow: '0 10px 25px rgba(23, 138, 160, 0.4)'
              } : {
                background: 'var(--card)',
                color: 'var(--text-dim)',
                borderColor: 'var(--glass-border)'
              }}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{categoryLabel}</span>
                {projectCount > 0 && (
                  <span className="text-xs opacity-75">({projectCount})</span>
                )}
              </div>
              
              {isSelected && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 rounded-full -z-10"
                  style={{ background: 'linear-gradient(90deg, #0f6a7a 0%, #178aa0 50%, #5fb8c7 100%)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}