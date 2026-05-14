'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { languages, type LanguageCode } from '@/lib/i18n/config';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(i18n.isInitialized);

  useEffect(() => {
    if (!i18n.isInitialized) {
      const handleInitialized = () => setIsInitialized(true);
      i18n.on('initialized', handleInitialized);
      return () => {
        i18n.off('initialized', handleInitialized);
      };
    }
  }, []);

  // Update document direction based on language
  useEffect(() => {
    const updateDirection = (lng: string) => {
      const language = languages.find(l => l.code === lng);
      const dir = language?.dir || 'ltr';
      document.documentElement.dir = dir;
      document.documentElement.lang = lng;
    };

    updateDirection(i18n.language);

    const handleLanguageChange = (lng: string) => {
      updateDirection(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  if (!isInitialized) {
    return null;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}

// Hook to get current language info
export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(
    i18n.language as LanguageCode
  );

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng as LanguageCode);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const changeLanguage = (lng: LanguageCode) => {
    i18n.changeLanguage(lng);
  };

  const languageInfo = languages.find(l => l.code === currentLanguage);

  return {
    currentLanguage,
    changeLanguage,
    languages,
    isRTL: languageInfo?.dir === 'rtl',
    languageInfo,
  };
}
