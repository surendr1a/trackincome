import dayjs from "dayjs";
import { Job, Shift } from "../types";

export function calculateWorkedMinutes(
  startTime: string,
  endTime: string,
  breakMinutes: number
): number {
  const start = dayjs(startTime);
  let end = dayjs(endTime);

  if (end.isBefore(start) || end.isSame(start)) {
    end = end.add(1, "day");
  }

  return Math.max(0, end.diff(start, "minute") - (breakMinutes || 0));
}

export function calculateBasePay(minutes: number, hourlyRate: number): number {
  return Math.round((minutes / 60) * hourlyRate);
}

export function calculateNightShiftMinutes(
  startTime: string,
  endTime: string,
  breakMinutes: number
): number {
  const start = dayjs(startTime);
  let end = dayjs(endTime);

  if (end.isBefore(start) || end.isSame(start)) {
    end = end.add(1, "day");
  }

  const totalMinutes = end.diff(start, "minute");
  if (totalMinutes <= 0) return 0;

  let nightCount = 0;

  for (let i = 0; i < totalMinutes; i++) {
    const h = start.add(i, "minute").hour();
    if (h >= 22 || h < 5) nightCount += 1;
  }

  const proportion = totalMinutes > 0 ? nightCount / totalMinutes : 0;
  const nightAfterBreak =
    nightCount - Math.round((breakMinutes || 0) * proportion);

  return Math.max(0, nightAfterBreak);
}

export function calculateNightPremiumPay(
  nightMinutes: number,
  hourlyRate: number
): number {
  return Math.round((nightMinutes / 60) * hourlyRate * 0.25);
}

export type ShiftPay = {
  workedMinutes: number;
  basePay: number;
  nightMinutes: number;
  nightPremium: number;
  commute: number;
  grossPay: number;
};

export function calculateShiftPay(
  shift: Shift,
  job: Job | undefined,
  isPremium: boolean
): ShiftPay {
  const workedMinutes = calculateWorkedMinutes(
    shift.startTime,
    shift.endTime,
    shift.breakMinutes
  );

  let basePay = calculateBasePay(workedMinutes, shift.hourlyRateSnapshot);

  if (isPremium && job) {
    const date = dayjs(shift.date);
    const dayOfWeek = date.day();

    if (shift.isHoliday && job.holidayMultiplier > 1) {
      basePay = Math.round(basePay * job.holidayMultiplier);
    } else if (
      (dayOfWeek === 0 || dayOfWeek === 6) &&
      job.weekendMultiplier > 1
    ) {
      basePay = Math.round(basePay * job.weekendMultiplier);
    }
  }

  const nightEligible = isPremium && (job?.nightShiftEnabled ?? true);

  const nightMinutes = nightEligible
    ? calculateNightShiftMinutes(
        shift.startTime,
        shift.endTime,
        shift.breakMinutes
      )
    : 0;

  const nightPremium = nightEligible
    ? calculateNightPremiumPay(nightMinutes, shift.hourlyRateSnapshot)
    : 0;

  const commute = shift.commuteAllowanceSnapshot || 0;

  return {
    workedMinutes,
    basePay,
    nightMinutes,
    nightPremium,
    commute,
    grossPay: basePay + nightPremium + commute,
  };
}

export type MonthlySummary = {
  totalGross: number;
  totalBase: number;
  totalNightPremium: number;
  totalCommute: number;
  totalMinutes: number;
  shiftCount: number;
  deductions: number;
  netPay: number;
  perJob: Array<{ jobId: string; gross: number; minutes: number }>;
};

export function calculateMonthlySalarySummary(params: {
  shifts: Shift[];
  jobs: Job[];
  month: string;
  isPremium: boolean;
}): MonthlySummary {
  const { shifts, jobs, month, isPremium } = params;

  const inMonth = shifts.filter((s) => s.date.startsWith(month));
  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  const perJobMap = new Map<string, { gross: number; minutes: number }>();

  let totalGross = 0;
  let totalBase = 0;
  let totalNight = 0;
  let totalCommute = 0;
  let totalMinutes = 0;

  for (const s of inMonth) {
    const pay = calculateShiftPay(s, jobMap.get(s.jobId), isPremium);

    totalGross += pay.grossPay;
    totalBase += pay.basePay;
    totalNight += pay.nightPremium;
    totalCommute += pay.commute;
    totalMinutes += pay.workedMinutes;

    const prev = perJobMap.get(s.jobId) ?? { gross: 0, minutes: 0 };

    perJobMap.set(s.jobId, {
      gross: prev.gross + pay.grossPay,
      minutes: prev.minutes + pay.workedMinutes,
    });
  }

  const deductions = Math.round(totalGross * 0.1);
  const netPay = totalGross - deductions;

  return {
    totalGross,
    totalBase,
    totalNightPremium: totalNight,
    totalCommute,
    totalMinutes,
    shiftCount: inMonth.length,
    deductions,
    netPay,
    perJob: Array.from(perJobMap.entries()).map(([jobId, v]) => ({
      jobId,
      ...v,
    })),
  };
}

export function calculateYearlyGross(
  shifts: Shift[],
  jobs: Job[],
  year: number,
  isPremium: boolean
) {
  const yearStr = String(year);
  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  let total = 0;

  for (const s of shifts) {
    if (!s.date.startsWith(yearStr)) continue;

    const pay = calculateShiftPay(s, jobMap.get(s.jobId), isPremium);
    total += pay.grossPay;
  }

  return total;
}

export type BarrierLevel =
  | "safe"
  | "warning_103"
  | "warning_106"
  | "danger_130";

export function getIncomeBarrierStatus(yearlyGross: number): BarrierLevel {
  if (yearlyGross >= 1300000) return "danger_130";
  if (yearlyGross >= 1060000) return "warning_106";
  if (yearlyGross >= 1030000) return "warning_103";
  return "safe";
}