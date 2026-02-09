import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Folder, FileText, Image as ImageIcon, Palette, Plus, Trash2, ChevronDown, Link as LinkIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '../i18n/context';
import type { Project } from '../types/project';
import * as categoryApi from '../api/categories';

interface AddProjectModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onAdd: (project: Omit<Project, 'id'>) => Promise<void>;
}

const defaultCategories: { value: string; label: string; labelAr?: string }[] = [
  { value: 'ecommerce', label: 'E-Commerce', labelAr: 'التجارة الإلكترونية' },
  { value: 'corporate', label: 'Corporate', labelAr: 'الشركات' },
  { value: 'healthcare', label: 'Healthcare', labelAr: 'الرعاية الصحية' },
  { value: 'food', label: 'Food & Beverage', labelAr: 'الطعام والمشروبات' },
  { value: 'realestate', label: 'Real Estate', labelAr: 'العقارات' },
];

const initialFormData = {
  title: '',
  titleAr: '',
  selectedCategoryValue: defaultCategories[0].value,
  categoryEn: defaultCategories[0].label,
  categoryAr: defaultCategories[0].labelAr || '',
  description: '',
  descriptionAr: '',
  image: '',
  link: '',
  primaryColor: '#178aa0',
  secondaryColor: '#0f6a7a',
  accentColor: '#5fb8c7',
};

// Reusable form field component
function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  primaryColor,
  locale,
  required = false,
  dir,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  primaryColor: string;
  locale: string;
  required?: boolean;
  dir?: string;
  icon?: any;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-slate-300 mb-2 text-sm">
        {Icon && (
          <Icon 
            className="w-4 h-4 transition-all duration-300"
            style={{ color: primaryColor }}
          />
        )}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none transition-all duration-300"
        style={{
          '--tw-ring-color': primaryColor,
        } as React.CSSProperties}
        onFocus={(e) => e.target.style.borderColor = primaryColor}
        onBlur={(e) => e.target.style.borderColor = ''}
        placeholder={placeholder}
        dir={dir}
        required={required}
      />
    </div>
  );
}

// Reusable textarea component
function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  primaryColor,
  required = false,
  dir,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  primaryColor: string;
  required?: boolean;
  dir?: string;
  icon?: any;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-slate-300 mb-2 text-sm">
        {Icon && (
          <Icon 
            className="w-4 h-4 transition-all duration-300"
            style={{ color: primaryColor }}
          />
        )}
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none transition-all duration-300 min-h-[100px] resize-none"
        onFocus={(e) => e.target.style.borderColor = primaryColor}
        onBlur={(e) => e.target.style.borderColor = ''}
        placeholder={placeholder}
        dir={dir}
        required={required}
      />
    </div>
  );
}

// Reusable color input component
function ColorInput({
  label,
  value,
  onChange,
  primaryColor,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  primaryColor: string;
}) {
  return (
    <div>
      <label className="block text-slate-400 text-xs mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-700 bg-slate-900"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-2 w-full bg-slate-900/50 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export function AddProjectModal({ isOpen, onClose, onAdd }: AddProjectModalProps) {
  const { t, locale } = useLanguage();
  const [formData, setFormData] = useState(initialFormData);

  const [customCategories, setCustomCategories] = useState<categoryApi.Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryNameAr, setNewCategoryNameAr] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load custom categories from API on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await categoryApi.getCategories();
        setCustomCategories(categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Listen for custom categories updates from API
  useEffect(() => {
    const handleCustomUpdate = async () => {
      try {
        const categories = await categoryApi.getCategories();
        setCustomCategories(categories);
      } catch (error) {
        console.error('Failed to refresh categories:', error);
      }
    };

    globalThis.addEventListener('customCategoriesUpdated', handleCustomUpdate);
    return () => {
      globalThis.removeEventListener('customCategoriesUpdated', handleCustomUpdate);
    };
  }, []);

  const allCategories = [...defaultCategories, ...customCategories];

  const handleAddCategory = async () => {
    if (newCategoryName.trim() && newCategoryNameAr.trim()) {
      try {
        const categoryValue = newCategoryName.toLowerCase().split(/\s+/).join('');
        
        // Check if category already exists
        if (allCategories.some(cat => cat.value === categoryValue)) {
          console.warn('Category already exists');
          return;
        }

        await categoryApi.createCategory({
          categoryValue,
          labelEn: newCategoryName.trim(),
          labelAr: newCategoryNameAr.trim(),
        });
        
        setFormData({ 
          ...formData, 
          selectedCategoryValue: categoryValue,
          categoryEn: newCategoryName.trim(),
          categoryAr: newCategoryNameAr.trim()
        });
        
        setNewCategoryName('');
        setNewCategoryNameAr('');
        setShowCategoryInput(false);
      } catch (error) {
        console.error('Failed to add category:', error);
      }
    }
  };

  const handleDeleteCategory = async (categoryValue: string) => {
    try {
      await categoryApi.deleteCategory(categoryValue);
      
      if (formData.selectedCategoryValue === categoryValue) {
        const defaultCategory = defaultCategories[0];
        setFormData({ 
          ...formData, 
          selectedCategoryValue: 'ecommerce',
          categoryEn: defaultCategory.label,
          categoryAr: ''
        });
      }
      toast.success(t('categoryDeletedSuccess'));
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const newProject: Omit<Project, 'id'> = {
        title: formData.title,
        titleAr: formData.titleAr,
        categoryValue: formData.selectedCategoryValue,
        categoryEn: formData.categoryEn,
        categoryAr: formData.categoryAr,
        description: formData.description,
        descriptionAr: formData.descriptionAr,
        image: formData.image || 'https://images.unsplash.com/photo-1677469684112-5dfb3aa4d3df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
        link: formData.link,
        customColors: {
          primary: formData.primaryColor,
          secondary: formData.secondaryColor,
          accent: formData.accentColor,
        },
      };

      // Call the parent's onAdd handler which handles the API call
      await onAdd(newProject);
      
      // Show success toast
      toast.success(t('projectCreatedSuccess'), {
        description: t('projectAddedDescription', { title: formData.title }),
      });
      
      // Reset form
      setFormData(initialFormData);
      
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error(t('projectCreationFailed') || 'Failed to create project');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 p-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
              {/* Header */}
              <div 
                className="relative p-6 border-b border-slate-700/50 transition-all duration-500"
                style={{
                  background: `linear-gradient(to right, ${formData.primaryColor}20, ${formData.accentColor}20)`
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="p-3 rounded-xl transition-all duration-500"
                    style={{
                      backgroundColor: `${formData.primaryColor}33`
                    }}
                  >
                    <Upload 
                      className="w-6 h-6 transition-all duration-500"
                      style={{ color: formData.primaryColor }}
                    />
                  </motion.div>
                  <h2 className="text-2xl text-white">{t('addNewProject')}</h2>
                </div>
                <p className="text-slate-400 text-sm">
                  {t('addProjectDescription')}
                </p>
                
                <button
                  onClick={onClose}
                  className={"absolute top-4" + (locale === 'ar' ? " left-4" : " right-4") + " p-2 hover:bg-slate-700/50 rounded-lg transition-colors"}
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Title */}
                <FormField
                  label={`${t('projectTitle')} (English)*`}
                  value={formData.title}
                  onChange={(value) => setFormData({ ...formData, title: value })}
                  placeholder={t('projectTitlePlaceholder')}
                  primaryColor={formData.primaryColor}
                  locale={locale}
                  required
                  icon={FileText}
                />

                {/* Title Arabic */}
                <FormField
                  label={`${t('projectTitleAr')}*`}
                  value={formData.titleAr}
                  onChange={(value) => setFormData({ ...formData, titleAr: value })}
                  placeholder={t('projectTitleArPlaceholder')}
                  primaryColor={formData.primaryColor}
                  locale={locale}
                  required
                  dir="rtl"
                  icon={FileText}
                />

                {/* Category - Custom Dropdown */}
                <div>
                  <label className="flex items-center gap-2 text-slate-300 mb-2 text-sm">
                    <Folder 
                      className="w-4 h-4 transition-all duration-300"
                      style={{ color: formData.primaryColor }}
                    />
                    {t('category')}*
                  </label>
                  
                  {/* Custom Styled Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none transition-all duration-300 flex items-center justify-between group"
                      onFocus={(e) => e.currentTarget.style.borderColor = formData.primaryColor}
                      onBlur={(e) => e.currentTarget.style.borderColor = ''}
                      style={{
                        borderColor: isDropdownOpen ? formData.primaryColor : ''
                      }}
                    >
                      <span className="text-left">
                        {formData.categoryEn} {formData.categoryAr && `(${formData.categoryAr})`}
                      </span>
                      <ChevronDown 
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        style={{ color: isDropdownOpen ? formData.primaryColor : '' }}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto"
                        >
                          {/* Default Categories */}
                          <div className="p-2">
                            <div className="text-xs text-slate-500 px-3 py-2 font-semibold uppercase tracking-wider">
                              {t('defaultCategories')}
                            </div>
                            {defaultCategories.map((cat) => (
                              <motion.button
                                key={cat.value}
                                type="button"
                                onClick={() => {
                                  setFormData({ 
                                    ...formData, 
                                    selectedCategoryValue: cat.value,
                                    categoryEn: cat.label,
                                    categoryAr: cat.labelAr || ''
                                  });
                                  setIsDropdownOpen(false);
                                }}
                                whileHover={{ x: 4 }}
                                className={`w-full text-${locale === 'ar' ? 'right' : 'left'} px-3 py-2 rounded-lg transition-colors ${
                                  formData.selectedCategoryValue === cat.value
                                    ? 'bg-slate-700 text-white'
                                    : 'text-slate-300 hover:bg-slate-700/50'
                                }`}
                                style={{
                                  backgroundColor: formData.selectedCategoryValue === cat.value ? `${formData.primaryColor}40` : ''
                                }}
                              >
                                {t(cat.value)}
                              </motion.button>
                            ))}
                          </div>

                          {/* Custom Categories */}
                          {customCategories.length > 0 && (
                            <div className="p-2 border-t border-slate-700/50">
                              <div className="text-xs text-slate-500 px-3 py-2 font-semibold uppercase tracking-wider">
                                {t('customCategories')}
                              </div>
                              {customCategories.map((cat) => (
                                <div key={cat.value} className="flex items-center gap-1">
                                  <motion.button
                                    type="button"
                                    onClick={() => {
                                      setFormData({ 
                                        ...formData, 
                                        selectedCategoryValue: cat.value,
                                        categoryEn: cat.labelEn,
                                        categoryAr: cat.labelAr || ''
                                      });
                                      setIsDropdownOpen(false);
                                    }}
                                    whileHover={{ x: 4 }}
                                    className={`flex-1 text-left px-3 py-2 rounded-lg transition-colors ${
                                      formData.selectedCategoryValue === cat.value
                                        ? 'bg-slate-700 text-white'
                                        : 'text-slate-300 hover:bg-slate-700/50'
                                    }`}
                                    style={{
                                      backgroundColor: formData.selectedCategoryValue === cat.value ? `${formData.primaryColor}40` : ''
                                    }}
                                  >
                                    {cat.labelAr ? `${cat.labelEn} (${cat.labelAr})` : cat.labelEn}
                                  </motion.button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCategory(cat.value)}
                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add New Category */}
                          <div className="p-2 border-t border-slate-700/50">
                            {showCategoryInput ? (
                              <div className="space-y-2 p-1">
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddCategory();
                                      }
                                      if (e.key === 'Escape') {
                                        setShowCategoryInput(false);
                                        setNewCategoryName('');
                                        setNewCategoryNameAr('');
                                      }
                                    }}
                                    placeholder={t('categoryNamePlaceholder') + ' (English)'}
                                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                                    autoFocus
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newCategoryNameAr}
                                    onChange={(e) => setNewCategoryNameAr(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddCategory();
                                      }
                                      if (e.key === 'Escape') {
                                        setShowCategoryInput(false);
                                        setNewCategoryName('');
                                        setNewCategoryNameAr('');
                                      }
                                    }}
                                    placeholder={t('categoryNamePlaceholder') + ' (عربي)'}
                                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                                    dir="rtl"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowCategoryInput(true)}
                                className="w-full px-3 py-2 text-left text-purple-400 hover:bg-slate-700/50 rounded-lg transition-colors flex items-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                {t('addNewCategory')}
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <p className="text-slate-500 text-xs mt-2">
                    {t('categoryHelpText')}
                  </p>
                </div>

                {/* Description */}
                <TextAreaField
                  label={`${t('description')} (English)*`}
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  placeholder={t('descriptionPlaceholder')}
                  primaryColor={formData.primaryColor}
                  required
                  icon={FileText}
                />

                {/* Description Arabic */}
                <TextAreaField
                  label={`${t('descriptionAr')}*`}
                  value={formData.descriptionAr}
                  onChange={(value) => setFormData({ ...formData, descriptionAr: value })}
                  placeholder={t('descriptionArPlaceholder')}
                  primaryColor={formData.primaryColor}
                  required
                  dir="rtl"
                  icon={FileText}
                />

                {/* Custom Colors Section */}
                <div className="border border-slate-700/50 rounded-xl p-4 bg-slate-900/30">
                  <label className="flex items-center gap-2 text-slate-300 mb-3 text-sm">
                    <Palette className="w-4 h-4 text-purple-400" />
                    {t('customColors')}
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                    <ColorInput
                      label={t('primaryColor')}
                      value={formData.primaryColor}
                      onChange={(value) => setFormData({ ...formData, primaryColor: value })}
                      primaryColor={formData.primaryColor}
                    />

                    <ColorInput
                      label={t('secondaryColor')}
                      value={formData.secondaryColor}
                      onChange={(value) => setFormData({ ...formData, secondaryColor: value })}
                      primaryColor={formData.primaryColor}
                    />

                    <ColorInput
                      label={t('accentColor')}
                      value={formData.accentColor}
                      onChange={(value) => setFormData({ ...formData, accentColor: value })}
                      primaryColor={formData.primaryColor}
                    />
                  </div>
                  
                  <p className="text-slate-500 text-xs mt-3">
                    {t('colorSchemeHelpText')}
                  </p>
                </div>

                {/* Image URL */}
                <FormField
                  label={t('imageUrl')}
                  value={formData.image}
                  onChange={(value) => setFormData({ ...formData, image: value })}
                  type="url"
                  placeholder={t('imageUrlPlaceholder')}
                  primaryColor={formData.primaryColor}
                  locale={locale}
                  icon={ImageIcon}
                />
                <p className="text-slate-500 text-xs -mt-3">
                  {t('imageUrlHelpText')}
                </p>

                {/* Link */}
                <FormField
                  label={t('projectLink')}
                  value={formData.link}
                  onChange={(value) => setFormData({ ...formData, link: value })}
                  type="url"
                  placeholder={t('projectLinkPlaceholder')}
                  primaryColor={formData.primaryColor}
                  locale={locale}
                  icon={LinkIcon}
                />

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                    style={{
                      background: `linear-gradient(to right, ${formData.primaryColor}, ${formData.accentColor})`
                    }}
                  >
                    <Upload className="w-5 h-5" />
                    {t('addProject')}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}