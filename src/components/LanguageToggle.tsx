import { motion } from 'motion/react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../i18n/context';

export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md transition-all"
      style={{
        background: 'var(--glass-bg)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--glass-border)',
        color: 'var(--text-main)'
      }}
      aria-label={t('languageToggle.ariaLabel')}
      title={t('languageToggle.title')}
    >
      <motion.div
        animate={{ rotate: locale === 'ar' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <Languages className="w-5 h-5" />
      </motion.div>
      <span className="text-sm font-medium hidden sm:inline">
        {t(`languageToggle.languageName.${locale}`)}
      </span>
      <motion.div
        className="relative w-10 h-5 rounded-full"
        style={{
          background: 'linear-gradient(90deg, #0f6a7a 0%, #178aa0 50%, #5fb8c7 100%)',
        }}
        whileHover={{
          boxShadow: '0 4px 12px rgba(23, 138, 160, 0.4)'
        }}
      >
        <motion.div
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md"
          animate={{
            x: locale === 'ar' ? 20 : 2
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </motion.button>
  );
}
