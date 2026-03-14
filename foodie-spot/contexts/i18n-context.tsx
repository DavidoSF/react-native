// contexts/i18n-context.tsx

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { storage, STORAGE_KEYS } from '@/services/storage';
import { i18n, Language, Translations } from '@/services/i18n';

interface I18nContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => Promise<void>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLang] = useState<Language>('fr');

  // Load persisted language on mount
  useEffect(() => {
    storage.getItem<Language>(STORAGE_KEYS.LANGUAGE).then((saved) => {
      if (saved === 'en' || saved === 'fr') {
        setLang(saved);
        i18n.setLanguage(saved);
      }
    });
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    i18n.setLanguage(lang);
    setLang(lang);
    await storage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  }, []);

  return (
    <I18nContext.Provider value={{ language, t: i18n.t(language), setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
};
