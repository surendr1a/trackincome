import {Platform} from 'react-native';

export const colors = {
  background: '#F9F9F9',
  surface: '#FFFFFF',
  surfaceSoft: '#FDFDFD',

  mint: '#E8F5E9',
  mintStrong: '#81C784',

  sakura: '#FCE4EC',
  sakuraStrong: '#F48FB1',

  charcoal: '#2C3E50',
  mutedText: '#7A8A99',
  border: '#EBEBEB',
  divider: '#EBEBEB',

  gold: '#D6A84F',
  goldSoft: '#F5EBD3',
  danger: '#D96C6C',
  dangerSoft: '#FBE9E9',
  success: '#66BB6A',
  successSoft: '#E4F3E5',

  blurOverlay: 'rgba(255,255,255,0.72)',
  scrim: 'rgba(44,62,80,0.55)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const shadows = {
  soft: {
    shadowColor: '#2C3E50',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },
  subtle: {
    shadowColor: '#2C3E50',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },
};

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
};

export const JOB_COLORS = [
  '#81C784',
  '#F48FB1',
  '#64B5F6',
  '#FFB74D',
  '#BA68C8',
  '#4DB6AC',
  '#FF8A65',
  '#A1887F',
];

export const JOB_EMOJIS = [
  '💼',
  '☕',
  '🍜',
  '🍔',
  '🛍️',
  '📚',
  '🏪',
  '🎓',
  '🚗',
  '🏥',
  '🎨',
  '💻',
];