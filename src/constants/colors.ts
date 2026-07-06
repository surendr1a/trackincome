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
} as const;

export const JOB_COLORS = [
  '#81C784',
  '#F48FB1',
  '#64B5F6',
  '#FFB74D',
  '#BA68C8',
  '#4DB6AC',
  '#FF8A65',
  '#A1887F',
] as const;

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
] as const;

export type AppColorName = keyof typeof colors;
