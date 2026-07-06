import {Platform} from 'react-native';

import {colors} from './colors';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'System',
  default: 'System',
});

export const typography = {
  fontFamily,
  h1: {
    fontSize: 28,
    fontWeight: '500' as const,
    lineHeight: 36,
    color: colors.charcoal,
  },
  h2: {
    fontSize: 22,
    fontWeight: '500' as const,
    lineHeight: 30,
    color: colors.charcoal,
  },
  h3: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 26,
    color: colors.charcoal,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: colors.charcoal,
  },
  bodyMuted: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: colors.mutedText,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
    color: colors.mutedText,
  },
} as const;

export type TypographyName = Exclude<keyof typeof typography, 'fontFamily'>;
