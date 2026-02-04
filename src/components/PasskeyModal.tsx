/// <reference types="vite/client" />
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../i18n/context';

interface PasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PasskeyModal({ isOpen, onClose, onSuccess }: PasskeyModalProps) {
  const { t, locale } = useLanguage();
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const correctPasskey = import.meta.env.VITE_ADMIN_PASSKEY; // You can change this

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    
    setTimeout(() => {
      if (passkey === correctPasskey) {
        setError(false);
        onSuccess();
        setPasskey('');
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
      setIsValidating(false);
    }, 500);
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
          >
            <div className="rounded-2xl shadow-2xl overflow-hidden" style={{
              background: 'var(--card)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--glass-border)'
            }}>
              {/* Header */}
              <div className="relative p-6 border-b" style={{
                background: 'linear-gradient(to right, rgba(23, 138, 160, 0.2), rgba(95, 184, 199, 0.2))',
                borderColor: 'var(--glass-border)'
              }}>
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center gap-3 mb-2"
                >
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(23, 138, 160, 0.2)' }}>
                    <Lock className="w-6 h-6 text-cyan-300" />
                  </div>
                  <h2 className="text-2xl" style={{ color: 'var(--text-main)' }}>{t('passkeyModal.title')}</h2>
                </motion.div>
                <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
                  {t('passkeyModal.description')}
                </p>
                
                <button
                  onClick={onClose}
                  className={"absolute top-4" + (locale === 'ar' ? " left-4" : " right-4") + " p-2 rounded-lg transition-colors"}
                  style={{ background: 'rgba(0,0,0,0.2)' }}
                >
                  <X className="w-5 h-5" style={{ color: 'var(--text-dim)' }} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-6">
                  <label className="block mb-2 text-sm" style={{ color: 'var(--text-dim)' }}>
                    {t('passkeyModal.passkeyLabel')}
                  </label>
                  <motion.input
                    type="password"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-colors`}
                    style={{
                      background: 'var(--input)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: error ? '#ef4444' : 'var(--glass-border)',
                      color: 'var(--text-main)',
                      ...(error ? {} : {})
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#178aa0'}
                    onBlur={(e) => e.target.style.borderColor = error ? '#ef4444' : 'var(--glass-border)'}
                    placeholder={t('passkeyModal.passkeyPlaceholder')}
                    autoFocus
                  />
                  
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 mt-2 text-sm"
                        style={{ color: '#ef4444' }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{t('passkeyModal.errorMessage')}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-xl transition-colors"
                    style={{
                      background: 'var(--secondary)',
                      color: 'var(--text-dim)'
                    }}
                  >
                    {t('passkeyModal.cancelButton')}
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isValidating || !passkey}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(90deg, #0f6a7a 0%, #178aa0 50%, #5fb8c7 100%)',
                      color: 'white'
                    }}
                  >
                    {isValidating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        {t('passkeyModal.validating')}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        {t('passkeyModal.verifyButton')}
                      </>
                    )}
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