import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { storage, STORAGE_KEYS } from '@/services/storage';
import { useSystemColorScheme } from '@/hooks/use-system-color-scheme';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  colorScheme: 'light' | 'dark';
  preference: ThemePreference;
  isDark: boolean;
  setPreference: (preference: ThemePreference) => void;
  toggleDarkMode: () => void;
  isLoaded: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isValidPreference = (value: unknown): value is ThemePreference => {
  return value === 'light' || value === 'dark' || value === 'system';
};

export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? 'light';
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    storage
      .getItem<{ value?: ThemePreference }>(STORAGE_KEYS.THEME_PREFERENCE)
      .then((stored) => {
        if (!isMounted) return;
        const preference = stored?.value;
        if (isValidPreference(preference)) {
          setPreferenceState(preference);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    storage.setItem(STORAGE_KEYS.THEME_PREFERENCE, { value: next }).catch(() => {
      // Ignore storage errors; we can still use the in-memory preference.
    });
  }, []);

  const colorScheme = preference === 'system' ? systemScheme : preference;
  const toggleDarkMode = useCallback(() => {
    const next = colorScheme === 'dark' ? 'light' : 'dark';
    setPreferenceState(next);
    storage.setItem(STORAGE_KEYS.THEME_PREFERENCE, { value: next }).catch(() => {});
  }, [colorScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colorScheme,
      preference,
      isDark: colorScheme === 'dark',
      setPreference,
      toggleDarkMode,
      isLoaded,
    }),
    [colorScheme, preference, setPreference, toggleDarkMode, isLoaded]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeColorScheme() {
  const ctx = useContext(ThemeContext);
  const systemScheme = useSystemColorScheme() ?? 'light';
  return ctx?.colorScheme ?? systemScheme;
}
