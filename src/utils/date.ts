import dayjs from 'dayjs';

export const DATE_FORMAT = 'YYYY-MM-DD';
export const MONTH_FORMAT = 'YYYY-MM';
export const TIME_FORMAT = 'HH:mm';

export function todayString(): string {
  return dayjs().format(DATE_FORMAT);
}

export function currentMonthString(): string {
  return dayjs().format(MONTH_FORMAT);
}

export function toDateString(value: string | Date): string {
  return dayjs(value).format(DATE_FORMAT);
}

export function toMonthString(value: string | Date): string {
  return dayjs(value).format(MONTH_FORMAT);
}

export function formatDisplayDate(
  value: string | Date,
  locale: 'en' | 'ja' = 'en',
): string {
  const date = dayjs(value);
  return locale === 'ja'
    ? date.format('YYYY年 M月 D日')
    : date.format('MMM D, YYYY');
}

export function formatDisplayMonth(
  value: string,
  locale: 'en' | 'ja' = 'en',
): string {
  const month = dayjs(value.length === 7 ? `${value}-01` : value);
  return locale === 'ja'
    ? month.format('YYYY年 M月')
    : month.format('MMMM YYYY');
}

export function formatTime(value: string | Date): string {
  return dayjs(value).format(TIME_FORMAT);
}

export function isSameMonth(date: string, month: string): boolean {
  return date.startsWith(month);
}

export function getMonthRange(month: string): {start: string; end: string} {
  const start = dayjs(`${month}-01`);
  return {
    start: start.format(DATE_FORMAT),
    end: start.endOf('month').format(DATE_FORMAT),
  };
}

export function addMonths(month: string, amount: number): string {
  return dayjs(`${month}-01`).add(amount, 'month').format(MONTH_FORMAT);
}

export function combineDateAndTime(date: string, time: string): string {
  const [hour = '0', minute = '0'] = time.split(':');
  return dayjs(date)
    .hour(Number(hour))
    .minute(Number(minute))
    .second(0)
    .millisecond(0)
    .toISOString();
}
