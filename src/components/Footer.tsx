import { motion } from 'motion/react';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { useLanguage } from '../i18n/context';

export function Footer() {
  const { t, dir } = useLanguage();
  
  const socialLinks = [
    { icon: Github, href: 'https://github.com/MaVoid-Team', labelKey: 'github' },
    { icon: Linkedin, href: 'https://linkedin.com/company/mavoid', labelKey: 'linkedin' },
    { icon: Mail, href: 'mailto:contact@mavoid.com', labelKey: 'email' },
  ];

  return (
    <footer className="relative backdrop-blur-sm" style={{ 
      borderTop: '1px solid var(--glass-border)',
      background: 'var(--glass-bg)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={dir}>
        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          <h3 className="text-lg" style={{ color: 'var(--text-main)' }}>{t('followUs')}</h3>
          <div className="flex gap-4">
            {socialLinks.map(({ icon: Icon, href, labelKey }) => (
              <motion.a
                key={labelKey}
                href={href}
                aria-label={t(labelKey)}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: 'var(--card)',
                  color: 'var(--text-dim)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--glass-border)'
                }}
              >
                <Icon className="w-6 h-6" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pt-6 text-center"
          style={{ color: 'var(--text-dim)' }}
        >
          <p>{t('copyright')} {t('allRightsReserved')}</p>
        </motion.div>
      </div>
    </footer>
  );
}