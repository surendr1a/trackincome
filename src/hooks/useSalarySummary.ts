import {useMemo} from 'react';

import {
  calculateMonthlySalarySummary,
  calculateYearlyGross,
  getIncomeBarrierStatus,
  MonthlySummary,
} from '../services/salaryCalculator';
import {useAppStore} from '../store/useAppStore';

export type SalarySummaryResult = {
  monthly: MonthlySummary;
  yearlyGross: number;
  barrier: ReturnType<typeof getIncomeBarrierStatus>;
};

export function useSalarySummary(month?: string): SalarySummaryResult {
  const shifts = useAppStore(s => s.shifts);
  const jobs = useAppStore(s => s.jobs);
  const selectedMonth = useAppStore(s => s.selectedMonth);
  const isPremium = useAppStore(s => s.premium.isPremium);

  const targetMonth = month ?? selectedMonth;
  const year = Number.parseInt(targetMonth.slice(0, 4), 10);

  return useMemo(() => {
    const monthly = calculateMonthlySalarySummary({
      shifts,
      jobs,
      month: targetMonth,
      isPremium,
    });
    const yearlyGross = calculateYearlyGross(shifts, jobs, year, isPremium);

    return {
      monthly,
      yearlyGross,
      barrier: getIncomeBarrierStatus(yearlyGross),
    };
  }, [isPremium, jobs, shifts, targetMonth, year]);
}
