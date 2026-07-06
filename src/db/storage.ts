import AsyncStorage from '@react-native-async-storage/async-storage';

import {Job, PremiumStatus, Shift} from '../types';

const KEYS = {
  jobs: '@zenshift/jobs',
  shifts: '@zenshift/shifts',
  premium: '@zenshift/premium',
  onboarded: '@zenshift/onboarded',
  goal: '@zenshift/monthly_goal',
};

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const jobsRepo = {
  getAll: (): Promise<Job[]> => readJSON<Job[]>(KEYS.jobs, []),

  saveAll: (jobs: Job[]): Promise<void> => writeJSON(KEYS.jobs, jobs),
};

export const shiftsRepo = {
  getAll: (): Promise<Shift[]> => readJSON<Shift[]>(KEYS.shifts, []),

  saveAll: (shifts: Shift[]): Promise<void> => writeJSON(KEYS.shifts, shifts),
};

export const premiumRepo = {
  get: (): Promise<PremiumStatus> =>
    readJSON<PremiumStatus>(KEYS.premium, {
      isPremium: false,
    }),

  save: (status: PremiumStatus): Promise<void> =>
    writeJSON(KEYS.premium, status),
};

export const settingsRepo = {
  getOnboarded: (): Promise<boolean> =>
    readJSON<boolean>(KEYS.onboarded, false),

  setOnboarded: (value: boolean): Promise<void> =>
    writeJSON(KEYS.onboarded, value),

  getGoal: (): Promise<number> => readJSON<number>(KEYS.goal, 100000),

  setGoal: (value: number): Promise<void> => writeJSON(KEYS.goal, value),
};

export async function resetAllData(): Promise<void> {
  await (
    AsyncStorage as unknown as {multiRemove: (keys: string[]) => Promise<void>}
  ).multiRemove([
    KEYS.jobs,
    KEYS.shifts,
    KEYS.premium,
    KEYS.onboarded,
    KEYS.goal,
  ]);
}
