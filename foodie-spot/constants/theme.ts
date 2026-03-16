/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const brandColor = '#FF6B35';
const tintColorLight = brandColor;
const tintColorDark = '#FFD9C7';

export const Colors = {
  light: {
    text: '#11181C',
    textMuted: '#666666',
    textSubtle: '#888888',
    textSecondary: '#999999',
    background: '#fff',
    surface: '#ffffff',
    surfaceAlt: '#f6f6f6',
    surfaceMuted: '#f3f4f6',
    border: '#e5e7eb',
    borderSubtle: '#f0f0f0',
    tint: tintColorLight,
    brand: brandColor,
    brandSoft: '#FFE5DB',
    brandSoftAlt: '#FFF4EF',
    onBrand: '#ffffff',
    header: brandColor,
    onHeader: '#ffffff',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    inputBackground: '#f5f5f5',
    inputBorder: '#dddddd',
    placeholder: 'rgba(0, 0, 0, 0.5)',
    info: '#3B82F6',
    success: '#22c55e',
    warning: '#F59E0B',
    danger: '#EF4444',
    infoSoft: '#DBEAFE',
    successSoft: '#F0FDF4',
    warningSoft: '#FEF3C7',
    dangerSoft: '#FEE2E2',
    overlay: 'rgba(255, 255, 255, 0.2)',
    skeleton: '#e5e7eb',
    skeletonAlt: '#f1f5f9',
    promo: '#8B5CF6',
    promoOn: '#ffffff',
  },
  dark: {
    text: '#ECEDEE',
    textMuted: '#A1A1AA',
    textSubtle: '#8B93A1',
    textSecondary: '#6B7280',
    background: '#151718',
    surface: '#1B1D22',
    surfaceAlt: '#121317',
    surfaceMuted: '#1F2329',
    border: '#2A2F36',
    borderSubtle: '#20242A',
    tint: tintColorDark,
    brand: brandColor,
    brandSoft: '#3B241C',
    brandSoftAlt: '#2A1B14',
    onBrand: '#ffffff',
    header: '#1F2937',
    onHeader: '#ffffff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    inputBackground: '#1B1F26',
    inputBorder: '#2F333B',
    placeholder: 'rgba(255, 255, 255, 0.5)',
    info: '#60A5FA',
    success: '#22c55e',
    warning: '#F59E0B',
    danger: '#EF4444',
    infoSoft: '#1E293B',
    successSoft: '#12251B',
    warningSoft: '#3A2B12',
    dangerSoft: '#3B1D1D',
    overlay: 'rgba(0, 0, 0, 0.3)',
    skeleton: '#2A2F36',
    skeletonAlt: '#1F2329',
    promo: '#6D28D9',
    promoOn: '#ffffff',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
