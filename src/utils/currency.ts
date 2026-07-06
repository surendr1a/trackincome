const DEFAULT_LOCALE = 'ja-JP';
const DEFAULT_CURRENCY = 'JPY';

export function formatCurrency(
  amount: number,
  options: {
    locale?: string;
    currency?: string;
    showSymbol?: boolean;
  } = {},
): string {
  const {
    locale = DEFAULT_LOCALE,
    currency = DEFAULT_CURRENCY,
    showSymbol = true,
  } = options;
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  if (!showSymbol) {
    return Math.round(safeAmount).toLocaleString(locale);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(safeAmount));
}

export function formatYen(amount: number, locale = DEFAULT_LOCALE): string {
  return formatCurrency(amount, {locale, currency: DEFAULT_CURRENCY});
}

export function parseCurrencyInput(value: string): number {
  const normalized = value.replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

export function clampCurrency(
  value: number,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}
