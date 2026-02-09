import { motion, AnimatePresence } from 'motion/react';
import { X, Edit, Search, Trash2, Save, Link as LinkIcon, FileText, Palette } from 'lucide-react';
import { useState } from 'react';
import type { Project } from '../types/project';
import { useLanguage } from '../i18n/context';
import * as projectApi from '../api/projects';
import { toast } from 'sonner';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onEdit: (id: string, project: Omit<Project, 'id'>) => void;
  onDelete: (id: string) => void;
}

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
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-lg cursor-pointer border-2 border-slate-700"
      />
    </div>
  );
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onEdit: (id: string, project: Omit<Project, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function EditProjectModal({ isOpen, onClose, projects, onEdit, onDelete }: EditProjectModalProps) {
  const { t, locale, dir } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.categoryEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.categoryAr && project.categoryAr.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBackToList = () => {
    setSelectedProject(null);
  };

  const handleClose = () => {
    setSelectedProject(null);
    setSearchQuery('');
    setDeleteConfirmId(null);
    onClose();
  };

  const handleDelete = async (id: string) => {
    try {
      await projectApi.deleteProject(id);
      onDelete(id);
      setDeleteConfirmId(null);
      toast.success(t('projectDeletedSuccess'));
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error(t('projectDeletedError'));
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl z-50 p-4 max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
              {!selectedProject ? (
                <>
                  {/* Project List View */}
                  <div className="relative p-6 border-b bg-gradient-to-r" style={{
                    background: 'linear-gradient(to right, rgba(95, 184, 199, 0.2), rgba(23, 138, 160, 0.2))',
                    borderColor: 'var(--glass-border)'
                  }}>
                    <div className="flex items-center gap-3 mb-2">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="p-3 rounded-xl"
                        style={{ background: 'rgba(95, 184, 199, 0.2)' }}
                      >
                        <Edit className="w-6 h-6 text-teal-300" />
                      </motion.div>
                      <div>
                        <h2 className="text-2xl text-white">{t('editProject')}</h2>
                        <p className="text-slate-400 text-sm">
                          {t('selectProjectToEditDescription')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleClose}
                      className={`absolute top-4 ${locale === 'ar' ? 'left-4' : 'right-4'} p-2 hover:bg-slate-700/50 rounded-lg transition-colors`}
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>

                  <div className="p-6">
                    {/* Search */}
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('searchProjectsPlaceholder')}
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    {/* Project List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredProjects.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                          <Edit className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>{t('noProjectsFound')}</p>
                        </div>
                      ) : (
                        filteredProjects.map((project) => (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-purple-500/50 transition-all"
                          >
                            <div className="flex flex-col md:flex-row items-center gap-4">
                              {/* Project Image */}
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                                <img
                                  src={project.image}
                                  alt={project.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Project Info */}
                              <div className="flex-1 min-w-0 self-start" style={{alignSelf:"start"}}>
                                <h3 className="text-white font-medium mb-1 truncate">
                                  {project.title}
                                </h3>
                                <p className="text-slate-400 text-sm mb-2 line-clamp-1">
                                  {project.description}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md">
                                    {project.categoryEn} {project.categoryAr && `(${project.categoryAr})`}
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-row items-center gap-2 w-full md:w-auto flex-shrink-0">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleProjectSelect(project)}
                                  className="px-4 py-2 w-full bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                                >
                                  {t('edit')}
                                </motion.button>
                                
                                {deleteConfirmId === project.id ? (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleDelete(project.id)}
                                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                                    >
                                      {t('confirm')}
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                                    >
                                      {t('cancel')}
                                    </button>
                                  </div>
                                ) : (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setDeleteConfirmId(project.id)}
                                    className="p-2 w-full flex-1 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <EditProjectForm
                  project={selectedProject}
                  onBack={handleBackToList}
                  onSave={(updatedProject) => {
                    onEdit(selectedProject.id, updatedProject);
                    setSelectedProject(null);
                  }}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Edit Form Component
interface EditProjectFormProps {
  project: Project;
  onBack: () => void;
  onSave: (project: Omit<Project, 'id'>) => void;
}

function EditProjectForm({ project, onBack, onSave }: EditProjectFormProps) {
  const { t, locale, dir } = useLanguage();
  const [formData, setFormData] = useState({
    title: project.title,
    titleAr: project.titleAr,
    categoryValue: project.categoryValue,
    categoryEn: project.categoryEn,
    categoryAr: project.categoryAr,
    description: project.description,
    descriptionAr: project.descriptionAr,
    image: project.image,
    link: project.link || '',
    primaryColor: project.customColors?.primary || '#10b981',
    secondaryColor: project.customColors?.secondary || '#059669',
    accentColor: project.customColors?.accent || '#34d399',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProject: Omit<Project, 'id'> = {
      title: formData.title,
      titleAr: formData.titleAr,
      categoryValue: formData.categoryValue,
      categoryEn: formData.categoryEn,
      categoryAr: formData.categoryAr,
      description: formData.description,
      descriptionAr: formData.descriptionAr,
      image: formData.image,
      link: formData.link,
      customColors: {
        primary: formData.primaryColor,
        secondary: formData.secondaryColor,
        accent: formData.accentColor,
      },
    };

    try {
      await projectApi.updateProject(project.id, updatedProject);
      toast.success(t('projectUpdatedSuccess'));
      onSave(updatedProject);
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error(t('projectUpdateError'));
    }
  };

  return (
    <>
      {/* Header */}
      <div 
        className="relative p-6 border-b border-slate-700/50 transition-all duration-500"
        style={{
          background: `linear-gradient(to right, ${formData.primaryColor}20, ${formData.accentColor}20)`
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="p-3 rounded-xl transition-all duration-500"
            style={{
              backgroundColor: `${formData.primaryColor}33`
            }}
          >
            <Edit 
              className="w-6 h-6 transition-all duration-500"
              style={{ color: formData.primaryColor }}
            />
          </motion.div>
          <div>
            <h2 className="text-2xl text-white">{t('editProject')}</h2>
            <p className="text-slate-400 text-sm">
              {t('updateProjectDetails')}
            </p>
          </div>
        </div>
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

        {/* Category English */}
        <FormField
          label={`${t('category')} (English)*`}
          value={formData.categoryEn}
          onChange={(value) => setFormData({ ...formData, categoryEn: value })}
          placeholder={t('categoryNamePlaceholder')}
          primaryColor={formData.primaryColor}
          locale={locale}
          required
        />

        {/* Category Arabic */}
        <FormField
          label={`${t('category')} (عربي)*`}
          value={formData.categoryAr}
          onChange={(value) => setFormData({ ...formData, categoryAr: value })}
          placeholder={t('categoryNamePlaceholder')}
          primaryColor={formData.primaryColor}
          locale={locale}
          required
          dir="rtl"
        />

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
          required
        />

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
            onClick={onBack}
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
            <Save className="w-5 h-5" />
            {t('saveChanges')}
          </motion.button>
        </div>
      </form>
    </>
  );
}