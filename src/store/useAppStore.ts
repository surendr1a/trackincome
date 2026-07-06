import {useSyncExternalStore} from 'react';
import dayjs from 'dayjs';

import {
  jobsRepo,
  premiumRepo,
  resetAllData,
  settingsRepo,
  shiftsRepo,
} from '../db/storage';
import {devTogglePremium, purchase, restore} from '../services/iap';
import {
  Job,
  JobInput,
  PaywallTrigger,
  PremiumStatus,
  Shift,
  ShiftInput,
} from '../types';

export const FREE_JOB_LIMIT = 1;
export const FREE_MONTHLY_SHIFT_LIMIT = 10;

type ToastKind = 'success' | 'error' | 'info';

type ToastState = {
  message: string;
  kind: ToastKind;
} | null;

type MutationResult = {
  ok: boolean;
};

export type AppState = {
  jobs: Job[];
  shifts: Shift[];
  premium: PremiumStatus;
  selectedMonth: string;
  selectedDate: string;
  monthlyGoal: number;
  onboarded: boolean;
  isPaywallVisible: boolean;
  paywallTrigger: PaywallTrigger | null;
  toast: ToastState;

  loadInitialData: () => Promise<void>;
  setSelectedMonth: (month: string) => void;
  setSelectedDate: (date: string) => void;
  setMonthlyGoal: (goal: number) => Promise<void>;

  addJob: (input: JobInput) => Promise<MutationResult>;
  updateJob: (id: string, input: JobInput) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;

  addShift: (input: ShiftInput) => Promise<MutationResult>;
  updateShift: (id: string, input: ShiftInput) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;

  openPaywall: (trigger: PaywallTrigger) => void;
  closePaywall: () => void;
  purchasePlan: (productId: string) => Promise<void>;
  restorePurchases: () => Promise<void>;
  devTogglePremiumAction: () => Promise<void>;

  showToast: (message: string, kind?: ToastKind) => void;
  clearToast: () => void;
  resetAllUserData: () => Promise<void>;
};

const uuidv4 = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, token => {
    const random = (Math.random() * 16) | 0;
    const value = token === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });

let state: AppState;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(listener => listener());
}

function setState(patch: Partial<AppState>) {
  state = {...state, ...patch};
  emit();
}

function getMonthlyShiftCount(shifts: Shift[], month: string): number {
  return shifts.filter(shift => shift.date.startsWith(month)).length;
}

async function persistJobs(jobs: Job[]) {
  setState({jobs});
  await jobsRepo.saveAll(jobs);
}

async function persistShifts(shifts: Shift[]) {
  setState({shifts});
  await shiftsRepo.saveAll(shifts);
}

state = {
  jobs: [],
  shifts: [],
  premium: {isPremium: false},
  selectedMonth: dayjs().format('YYYY-MM'),
  selectedDate: dayjs().format('YYYY-MM-DD'),
  monthlyGoal: 100000,
  onboarded: false,
  isPaywallVisible: false,
  paywallTrigger: null,
  toast: null,

  loadInitialData: async () => {
    const [jobs, shifts, premium, onboarded, monthlyGoal] = await Promise.all([
      jobsRepo.getAll(),
      shiftsRepo.getAll(),
      premiumRepo.get(),
      settingsRepo.getOnboarded(),
      settingsRepo.getGoal(),
    ]);

    setState({
      jobs,
      shifts,
      premium,
      onboarded,
      monthlyGoal,
    });
  },

  setSelectedMonth: month => setState({selectedMonth: month}),
  setSelectedDate: date => setState({selectedDate: date}),

  setMonthlyGoal: async goal => {
    setState({monthlyGoal: goal});
    await settingsRepo.setGoal(goal);
  },

  addJob: async input => {
    if (!state.premium.isPremium && state.jobs.length >= FREE_JOB_LIMIT) {
      state.openPaywall('MULTI_JOB_LIMIT');
      return {ok: false};
    }

    const now = new Date().toISOString();
    const job: Job = {
      ...input,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    await persistJobs([...state.jobs, job]);
    return {ok: true};
  },

  updateJob: async (id, input) => {
    const now = new Date().toISOString();
    const jobs = state.jobs.map(job =>
      job.id === id ? {...job, ...input, updatedAt: now} : job,
    );

    await persistJobs(jobs);
  },

  deleteJob: async id => {
    const jobs = state.jobs.filter(job => job.id !== id);
    const shifts = state.shifts.filter(shift => shift.jobId !== id);

    setState({jobs, shifts});
    await Promise.all([jobsRepo.saveAll(jobs), shiftsRepo.saveAll(shifts)]);
  },

  addShift: async input => {
    const month = input.date.slice(0, 7);

    if (
      !state.premium.isPremium &&
      getMonthlyShiftCount(state.shifts, month) >= FREE_MONTHLY_SHIFT_LIMIT
    ) {
      state.openPaywall('MONTHLY_SHIFT_LIMIT');
      return {ok: false};
    }

    const now = new Date().toISOString();
    const shift: Shift = {
      ...input,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    await persistShifts([...state.shifts, shift]);
    return {ok: true};
  },

  updateShift: async (id, input) => {
    const now = new Date().toISOString();
    const shifts = state.shifts.map(shift =>
      shift.id === id ? {...shift, ...input, updatedAt: now} : shift,
    );

    await persistShifts(shifts);
  },

  deleteShift: async id => {
    await persistShifts(state.shifts.filter(shift => shift.id !== id));
  },

  openPaywall: trigger =>
    setState({
      isPaywallVisible: true,
      paywallTrigger: trigger,
    }),

  closePaywall: () =>
    setState({
      isPaywallVisible: false,
      paywallTrigger: null,
    }),

  purchasePlan: async productId => {
    const premium = await purchase(productId);
    setState({
      premium,
      isPaywallVisible: false,
      paywallTrigger: null,
    });
  },

  restorePurchases: async () => {
    const premium = await restore();
    setState({premium});
  },

  devTogglePremiumAction: async () => {
    const premium = await devTogglePremium();
    setState({premium});
  },

  showToast: (message, kind = 'info') => setState({toast: {message, kind}}),
  clearToast: () => setState({toast: null}),

  resetAllUserData: async () => {
    await resetAllData();
    setState({
      jobs: [],
      shifts: [],
      premium: {isPremium: false},
      monthlyGoal: 100000,
      onboarded: false,
    });
  },
};

export function useAppStore<T>(selector: (snapshot: AppState) => T): T {
  return useSyncExternalStore(
    listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => selector(state),
    () => selector(state),
  );
}

export function getAppState(): AppState {
  return state;
}

export function useMonthlyShiftLimit(month: string) {
  const shifts = useAppStore(snapshot => snapshot.shifts);
  const premium = useAppStore(snapshot => snapshot.premium);
  const count = getMonthlyShiftCount(shifts, month);

  return {
    count,
    limit: FREE_MONTHLY_SHIFT_LIMIT,
    remaining: premium.isPremium
      ? Number.POSITIVE_INFINITY
      : Math.max(0, FREE_MONTHLY_SHIFT_LIMIT - count),
    canAdd: premium.isPremium || count < FREE_MONTHLY_SHIFT_LIMIT,
  };
}
