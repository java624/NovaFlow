'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Перевіряємо чи додаток вже відкритий у режимі PWA (standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // 2. Перевіряємо чи користувач закривав банер в поточній сесії
    try {
      const isDismissed = sessionStorage.getItem('novaflow_pwa_dismissed');
      if (isDismissed === 'true') {
        return;
      }
    } catch {}

    // 3. Визначаємо iOS пристрої (Safari на iOS не підтримує beforeinstallprompt)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);

    if (isIOSDevice) {
      setIsIOS(true);
      // Показуємо підказку для iOS через 3 секунди після завантаження
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // 4. Перехоплюємо подію beforeinstallprompt для Android/Chrome/Edge/Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Запускаємо нативний діалог встановлення браузера
    await deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('novaflow_pwa_dismissed', 'true');
    } catch {}
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-96"
        >
          <div className="bg-white/95 backdrop-blur-xl border border-purple-100 shadow-2xl shadow-purple-500/15 rounded-3xl p-4 sm:p-5 relative overflow-hidden group">
            {/* Decorative Glow */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start gap-3.5 relative z-10">
              {/* Logo */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 p-2.5 flex items-center justify-center flex-shrink-0 shadow-md shadow-purple-500/20">
                <img src="/img/logo.svg" alt="NovaFlow" className="w-full h-full object-contain filter brightness-0 invert" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-sm font-extrabold text-gray-900 leading-snug">
                  Встановити додаток NovaFlow
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {isIOS
                    ? 'Натисніть кнопку "Поділитися" та оберіть "На початковий екран" для швидкого доступу.'
                    : 'Отримуй швидкий доступ до уроків та матеріалів прямо з головного екрана!'}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={handleDismiss}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="Закрити"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-end gap-2 relative z-10">
              <button
                onClick={handleDismiss}
                className="px-3.5 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
              >
                Пізніше
              </button>

              {isIOS ? (
                <div className="px-4 py-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-purple-100">
                  <Share className="w-3.5 h-3.5" />
                  <span>Поділитися → На початковий екран</span>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Встановити</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
