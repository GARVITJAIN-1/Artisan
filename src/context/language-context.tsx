
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';

type Locale = 'en' | 'hi';

const translations = { en, hi };

type LanguageState = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
};

const LanguageContext = createContext<LanguageState | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>('en');

    const t = (key: string) => {
        return translations[locale][key as keyof typeof translations[Locale]] || key;
    };

    const value = { locale, setLocale, t };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
