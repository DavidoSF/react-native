import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { i18n, Language, Translations } from '@/services/i18n';

const LANGUAGE_KEY = 'app_language';

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('fr');

    useEffect(() => {
        AsyncStorage.getItem(LANGUAGE_KEY).then(stored => {
            if (stored === 'fr' || stored === 'en') {
                setLanguageState(stored);
                i18n.setLanguage(stored);
            }
        });
    }, []);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        i18n.setLanguage(lang);
        AsyncStorage.setItem(LANGUAGE_KEY, lang);
    }, []);

    return (
        <I18nContext.Provider value={{ language, setLanguage, t: i18n.t(language) }}>
            {children}
        </I18nContext.Provider>
    );
};

export const useI18n = () => {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
};
