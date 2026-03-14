import { useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { ThemeContext } from '@/contexts/theme-context';

export function useColorScheme() {
  const systemScheme = useRNColorScheme() ?? 'light';
  const theme = useContext(ThemeContext);
  return theme?.colorScheme ?? systemScheme;
}
