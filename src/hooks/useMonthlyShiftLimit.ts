import {useMemo} from 'react';

import {useAppStore} from '../store/useAppStore';

export const FREE_MONTHLY_SHIFT_LIMIT = 10;

export type MonthlyShiftLimit = {
  count: number;
  limit: number;
  remaining: number;
  canAdd: boolean;
};

export function useMonthlyShiftLimit(month: string): MonthlyShiftLimit {
  const shifts = useAppStore(s => s.shifts);
  const isPremium = useAppStore(s => s.premium.isPremium);

  return useMemo(() => {
    const count = shifts.filter(shift => shift.date.startsWith(month)).length;
    const remaining = isPremium
      ? Number.POSITIVE_INFINITY
      : Math.max(0, FREE_MONTHLY_SHIFT_LIMIT - count);

    return {
      count,
      limit: FREE_MONTHLY_SHIFT_LIMIT,
      remaining,
      canAdd: isPremium || count < FREE_MONTHLY_SHIFT_LIMIT,
    };
  }, [isPremium, month, shifts]);
}
