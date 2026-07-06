import AsyncStorage from '@react-native-async-storage/async-storage';

import {DB_KEYS, readJSON, writeJSON} from './db';
import {Job, Shift} from '../types';

export const CURRENT_SCHEMA_VERSION = 1;

const LEGACY_KEYS = {
  jobs: '@zenshift/jobs',
  shifts: '@zenshift/shifts',
  premium: '@zenshift/premium',
  onboarded: '@zenshift/onboarded',
  monthlyGoal: '@zenshift/monthly_goal',
} as const;

async function copyLegacyValue(
  legacyKey: string,
  nextKey: string,
): Promise<void> {
  const existing = await AsyncStorage.getItem(nextKey);
  if (existing) return;

  const legacy = await AsyncStorage.getItem(legacyKey);
  if (legacy) {
    await AsyncStorage.setItem(nextKey, legacy);
  }
}

async function migrateFromLegacyStorage(): Promise<void> {
  await Promise.all([
    copyLegacyValue(LEGACY_KEYS.jobs, DB_KEYS.jobs),
    copyLegacyValue(LEGACY_KEYS.shifts, DB_KEYS.shifts),
    copyLegacyValue(LEGACY_KEYS.premium, DB_KEYS.premium),
    copyLegacyValue(LEGACY_KEYS.onboarded, DB_KEYS.onboarded),
    copyLegacyValue(LEGACY_KEYS.monthlyGoal, DB_KEYS.monthlyGoal),
  ]);
}

function normalizeJobs(jobs: Job[]): Job[] {
  return jobs.map(job => ({
    ...job,
    commuteAllowance: Number(job.commuteAllowance) || 0,
    hourlyRate: Number(job.hourlyRate) || 0,
    paydayDay: Math.min(31, Math.max(1, Number(job.paydayDay) || 25)),
    weekendMultiplier: Number(job.weekendMultiplier) || 1,
    holidayMultiplier: Number(job.holidayMultiplier) || 1,
    nightShiftEnabled: Boolean(job.nightShiftEnabled),
  }));
}

function normalizeShifts(shifts: Shift[]): Shift[] {
  return shifts.map(shift => ({
    ...shift,
    breakMinutes: Number(shift.breakMinutes) || 0,
    hourlyRateSnapshot: Number(shift.hourlyRateSnapshot) || 0,
    commuteAllowanceSnapshot: Number(shift.commuteAllowanceSnapshot) || 0,
    isHoliday: Boolean(shift.isHoliday),
  }));
}

export async function runMigrations(): Promise<void> {
  const storedVersion = await readJSON<number>(DB_KEYS.schemaVersion, 0);
  if (storedVersion >= CURRENT_SCHEMA_VERSION) return;

  await migrateFromLegacyStorage();

  const jobs = await readJSON<Job[]>(DB_KEYS.jobs, []);
  const shifts = await readJSON<Shift[]>(DB_KEYS.shifts, []);
  await writeJSON(DB_KEYS.jobs, normalizeJobs(jobs));
  await writeJSON(DB_KEYS.shifts, normalizeShifts(shifts));
  await writeJSON(DB_KEYS.schemaVersion, CURRENT_SCHEMA_VERSION);
}
