import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { storage, STORAGE_KEYS } from '@/services/storage';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  preference: ThemePreference;
  setPreference: (value: ThemePreference) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme() ?? 'light';
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    let isMounted = true;
    storage.getItem<ThemePreference>(STORAGE_KEYS.THEME_PREFERENCE).then((saved) => {
      if (!isMounted) return;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setPreferenceState(saved);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const colorScheme = preference === 'system' ? systemScheme : preference;

  const setPreference = useCallback((value: ThemePreference) => {
    setPreferenceState(value);
    storage.setItem(STORAGE_KEYS.THEME_PREFERENCE, value);
  }, []);

  const toggle = useCallback(() => {
    setPreferenceState((prev) => {
      const next =
        prev === 'system'
          ? systemScheme === 'dark'
            ? 'light'
            : 'dark'
          : prev === 'dark'
            ? 'light'
            : 'dark';
      storage.setItem(STORAGE_KEYS.THEME_PREFERENCE, next);
      return next;
    });
  }, [systemScheme]);

  const value = useMemo(
    () => ({
      colorScheme,
      preference,
      setPreference,
      toggle,
    }),
    [colorScheme, preference, setPreference, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within AppThemeProvider');
  }
  return context;
}

export { ThemeContext };
