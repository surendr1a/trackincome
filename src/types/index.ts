export type Job = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  hourlyRate: number;
  commuteAllowance: number;
  paydayDay: number;
  weekendMultiplier: number;
  holidayMultiplier: number;
  nightShiftEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type JobInput = Omit<Job, 'id' | 'createdAt' | 'updatedAt'>;

export type Shift = {
  id: string;
  jobId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO
  endTime: string; // ISO
  breakMinutes: number;
  memo?: string;
  hourlyRateSnapshot: number;
  commuteAllowanceSnapshot: number;
  isHoliday: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShiftInput = Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>;

export type PremiumStatus = {
  isPremium: boolean;
  entitlementId?: string;
  activeProductId?: string;
};

export type PaywallTrigger =
  | 'MONTHLY_SHIFT_LIMIT'
  | 'MULTI_JOB_LIMIT'
  | 'NIGHT_SHIFT_ANALYTICS'
  | 'TAX_ESTIMATOR'
  | 'CSV_EXPORT'
  | 'BACKUP';
