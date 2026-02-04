import { motion, AnimatePresence } from 'motion/react';
import { X, Minimize2, Maximize2, RefreshCw, ExternalLink, Lock, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { Project } from '../types/project';
import { useLanguage } from '../i18n/context';

interface ProjectViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Default colors
const defaultColors = {
  primary: '#a855f7',
  secondary: '#7c3aed',
  accent: '#c084fc',
};

export function ProjectViewModal({ isOpen, onClose, project }: ProjectViewModalProps) {
  const { t, locale } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const colors = project?.customColors || defaultColors;

  // Get localized content
  const title = project ? (locale === 'ar' ? project.titleAr : project.title) : '';
  const description = project ? (locale === 'ar' ? project.descriptionAr : project.description) : '';
  const category = project ? (locale === 'ar' && project.categoryAr ? project.categoryAr : project.categoryEn) : '';

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simulate loading with progress
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setLoadingProgress(0);
      
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setIsLoading(false), 300);
            return 100;
          }
          return prev + Math.random() * 30;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isOpen, project]);

  // Initialize navigation history when modal opens
  useEffect(() => {
    if (isOpen && project?.link) {
      setCurrentUrl(project.link);
      setNavigationHistory([project.link]);
      setCurrentHistoryIndex(0);
      setCanGoBack(false);
      setCanGoForward(false);
    }
  }, [isOpen, project]);

  // Reset states on close
  const handleClose = () => {
    setIsFullscreen(false);
    setIsLoading(true);
    setLoadingProgress(0);
    onClose();
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setLoadingProgress(0);
    if (iframeRef.current && currentUrl) {
      iframeRef.current.src = currentUrl;
    }
    setTimeout(() => setIsLoading(false), 1500);
  };

  // Navigation handlers for back/forward
  const handleBack = () => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      const newUrl = navigationHistory[newIndex];
      setCurrentHistoryIndex(newIndex);
      setCurrentUrl(newUrl);
      setCanGoBack(newIndex > 0);
      setCanGoForward(true);
      
      if (iframeRef.current) {
        setIsLoading(true);
        iframeRef.current.src = newUrl;
        setTimeout(() => setIsLoading(false), 1500);
      }
    }
  };

  const handleForward = () => {
    if (currentHistoryIndex < navigationHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      const newUrl = navigationHistory[newIndex];
      setCurrentHistoryIndex(newIndex);
      setCurrentUrl(newUrl);
      setCanGoBack(true);
      setCanGoForward(newIndex < navigationHistory.length - 1);
      
      if (iframeRef.current) {
        setIsLoading(true);
        iframeRef.current.src = newUrl;
        setTimeout(() => setIsLoading(false), 1500);
      }
    }
  };

  // Function to navigate to a new URL (for future use with clickable links)
  const navigateToUrl = (url: string) => {
    // Remove any forward history
    const newHistory = navigationHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(url);
    
    setNavigationHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
    setCurrentUrl(url);
    setCanGoBack(true);
    setCanGoForward(false);
    
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = url;
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  if (!project) return null;

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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: isMobile ? 0.95 : 0.5, y: isMobile ? 20 : 100 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
            }}
            exit={{ opacity: 0, scale: isMobile ? 0.95 : 0.5, y: isMobile ? 20 : 100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed z-50 flex items-center justify-center ${
              isFullscreen || isMobile
                ? 'inset-0' 
                : 'inset-4 md:inset-8'
            }`}
          >
            {/* Browser Window Container */}
            <div 
              className="relative bg-slate-900 shadow-2xl overflow-hidden border-2 flex flex-col w-full h-full"
              style={{
                borderColor: hexToRgba(colors.primary, 0.5),
                borderRadius: (isFullscreen || isMobile) ? '0' : '1rem',
                maxWidth: (isFullscreen || isMobile) ? 'none' : '1400px',
                maxHeight: (isFullscreen || isMobile) ? 'none' : '90vh',
              }}
            >
              {/* Animated Border Glow - Hide on mobile for performance */}
              {!isMobile && (
                <motion.div
                  className="absolute inset-0 opacity-50 pointer-events-none"
                  style={{
                    background: `conic-gradient(from 0deg, ${colors.primary}, ${colors.accent}, ${colors.secondary}, ${colors.primary})`,
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              )}
              <div className="absolute inset-[2px] bg-slate-900 flex flex-col h-full"
                style={{
                  borderRadius: (isFullscreen || isMobile) ? '0' : '1rem',
                }}
              >
                {/* Browser Header */}
                <div className="relative bg-slate-800/95 border-b border-slate-700/50 backdrop-blur-sm flex-shrink-0">
                  {/* Top Bar - Window Controls */}
                  <div className={`flex items-center justify-between ${isMobile ? 'px-3 py-2' : 'px-4 py-3'} border-b border-slate-700/50`}>
                    {/* Traffic Lights & Close Button */}
                    <div className="flex items-center gap-2">
                      {!isMobile && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleClose}
                            className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                          />
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-5 h-5 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
                          />
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="w-5 h-5 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
                          />
                        </>
                      )}
                      {isMobile && (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={handleClose}
                          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors -ml-2"
                        >
                          <X className="w-8 h-8 text-slate-400" />
                        </motion.button>
                      )}
                    </div>

                    {/* Project Title - Hide on very small screens */}
                    {!isMobile && (
                      <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-2">
                        <Globe className="w-8 h-8 text-slate-400" />
                        <span className="text-sm text-slate-300 font-medium truncate max-w-[200px]">
                          {title}
                        </span>
                      </div>
                    )}

                    {/* Window Controls - Desktop only */}
                    {!isMobile && (
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: hexToRgba(colors.primary, 0.2) }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                          {isFullscreen ? (
                            <Minimize2 className="w-6 h-6 text-slate-400" />
                          ) : (
                            <Maximize2 className="w-6 h-6 text-slate-400" />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleClose}
                          className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                          <X className="w-6 h-6 text-slate-400" />
                        </motion.button>
                      </div>
                    )}
                    {/* Mobile: Show category badge */}
                    {isMobile && (
                      <div 
                        className="px-2 py-1 rounded text-xs font-medium border"
                        style={{
                          backgroundColor: hexToRgba(colors.secondary, 0.2),
                          borderColor: hexToRgba(colors.accent, 0.5),
                          color: colors.accent,
                        }}
                      >
                        {category}
                      </div>
                    )}
                  </div>

                  {/* Address Bar & Navigation */}
                  <div className={`${isMobile ? 'px-2 py-2' : 'px-4 py-3'} flex items-center gap-2`}>
                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBack}
                        disabled={!canGoBack}
                        className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-lg hover:bg-slate-700/50 transition-colors group disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {locale==="ar" ? <ChevronRight className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6'} text-slate-400`} /> : <ChevronLeft className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6'} text-slate-400`} />}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleForward}
                        disabled={!canGoForward}
                        className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-lg hover:bg-slate-700/50 transition-colors group disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {locale==="ar" ? <ChevronLeft className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6'} text-slate-400`} /> : <ChevronRight className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6'} text-slate-400`} />}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleRefresh}
                        disabled={!project.link}
                        className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-lg hover:bg-slate-700/50 transition-colors group disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <RefreshCw 
                          className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6'} text-slate-400 transition-all ${isLoading ? 'animate-spin' : ''}`}
                          style={{
                            color: isLoading ? colors.primary : undefined
                          }}
                        />
                      </motion.button>
                    </div>

                    {/* URL Bar - Responsive */}
                    <div 
                      className={`flex-1 ${isMobile ? 'px-2 py-1.5' : 'px-4 py-2'} rounded-lg border flex items-center gap-2 bg-slate-900/50 backdrop-blur-sm transition-all duration-300 min-w-0`}
                      style={{
                        borderColor: isLoading ? colors.primary : '#475569',
                      }}
                    >
                      <Lock className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-green-500 flex-shrink-0`} />
                      <div className="flex-1 flex items-center gap-2 overflow-hidden min-w-0">
                        <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-slate-400 truncate`}>
                          {isMobile 
                            ? (currentUrl || project.link || title).split('/')[2] || title
                            : (currentUrl || project.link || `https://${title.toLowerCase().replace(/\s+/g, '')}.mavoid.com`)
                          }
                        </span>
                      </div>
                      {project.link && (
                        <motion.a
                          href={currentUrl || project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileTap={{ scale: 0.9 }}
                          className="p-1 rounded hover:bg-slate-700/50 transition-colors flex-shrink-0"
                        >
                          <ExternalLink className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} text-slate-400`} />
                        </motion.a>
                      )}
                    </div>

                    {/* Category Badge - Desktop only */}
                    {!isMobile && (
                      <div 
                        className="px-3 py-1 rounded-lg text-xs font-medium border whitespace-nowrap"
                        style={{
                          backgroundColor: hexToRgba(colors.secondary, 0.2),
                          borderColor: hexToRgba(colors.accent, 0.5),
                          color: colors.accent,
                        }}
                      >
                        {category}
                      </div>
                    )}
                  </div>

                  {/* Loading Progress Bar */}
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: loadingProgress / 100 }}
                        exit={{ scaleX: 1, opacity: 0 }}
                        className="absolute bottom-0 left-0 right-0 h-0.5 origin-left"
                        style={{
                          background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
                        }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative bg-white overflow-hidden">
                  {/* Loading State */}
                  <AnimatePresence>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${hexToRgba(colors.primary, 0.1)}, ${hexToRgba(colors.accent, 0.1)})`,
                        }}
                      >
                        <div className="text-center">
                          <motion.div
                            animate={{ 
                              rotate: [0, 360],
                              scale: [1, 1.2, 1],
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear'
                            }}
                            className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full border-4 border-t-transparent mx-auto mb-4`}
                            style={{
                              borderColor: colors.primary,
                              borderTopColor: 'transparent',
                            }}
                          />
                          <p 
                            className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}
                            style={{ color: colors.primary }}
                          >
                            {t('loading')} {title}...
                          </p>
                          <p className="text-sm text-slate-500 mt-2">
                            {Math.round(loadingProgress)}%
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Iframe or Fallback */}
                  {project.link ? (
                    <iframe
                      ref={iframeRef}
                      src={project.link}
                      className="w-full h-full border-0"
                      title={title}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 overflow-y-auto">
                      <div className={`text-center max-w-2xl ${isMobile ? 'px-4 py-6' : 'px-8 py-8'}`}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: 0.2 }}
                          className="mb-6"
                        >
                          <div 
                            className={`${isMobile ? 'w-24 h-24' : 'w-32 h-32'} rounded-2xl mx-auto overflow-hidden border-4 shadow-2xl`}
                            style={{
                              borderColor: colors.primary,
                            }}
                          >
                            <img 
                              src={project.image} 
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </motion.div>
                        
                        <h3 
                          className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold mb-4`}
                          style={{ color: colors.primary }}
                        >
                          {title}
                        </h3>
                        <p className={`text-slate-600 ${isMobile ? 'text-base' : 'text-lg'} mb-6`}>
                          {description}
                        </p>

                        <div 
                          className={`inline-block ${isMobile ? 'px-4 py-2 text-xs' : 'px-6 py-3 text-sm'} rounded-lg`}
                          style={{
                            backgroundColor: hexToRgba(colors.primary, 0.1),
                            color: colors.primary,
                          }}
                        >
                          💡 {t('preview')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}