import { motion } from 'motion/react';
import { Github, Linkedin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../i18n/context';
import logoImage from '../assets/logo.png';

export function Header() {
  const { t, dir } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);

    // Check for mobile on mount and resize
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);
  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
        style={{ 
          background: 'var(--glass-bg)',
          borderColor: 'var(--glass-border)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20" dir={dir}>
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative"
                >
                  <img 
                    src={logoImage} 
                    alt="MaVoid Logo" 
                    className="w-12 h-12 object-contain"
                  />
                </motion.div>
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-0 rounded-lg blur-xl -z-10"
                  style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}
                ></motion.div>
              </div>
              {!isMobile && <span className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-teal-400 bg-clip-text text-transparent">
                MaVoid
              </span>}
            </motion.div>

            {/* Right side controls */}
            <div className="flex items-center gap-3" dir="ltr">
              {/* Language Toggle */}
              <LanguageToggle />
              
              {/* Social Media Links */}
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://github.com/mavoid"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-colors"
                style={{
                  background: 'var(--glass-bg)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--glass-border)'
                }}
                title="GitHub"
              >
                <Github className="w-5 h-5 text-cyan-300" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://linkedin.com/company/mavoid"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-colors"
                style={{
                  background: 'var(--glass-bg)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--glass-border)'
                }}
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-cyan-300" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Animated border */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, #178aa0, #5fb8c7, transparent)',
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
      </motion.header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-20"></div>
    </>
  );
}