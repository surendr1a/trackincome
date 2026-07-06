import AsyncStorage from '@react-native-async-storage/async-storage';

export const DB_PREFIX = '@zenshift';

export const DB_KEYS = {
  schemaVersion: `${DB_PREFIX}/schema_version`,
  jobs: `${DB_PREFIX}/jobs`,
  shifts: `${DB_PREFIX}/shifts`,
  premium: `${DB_PREFIX}/premium`,
  onboarded: `${DB_PREFIX}/onboarded`,
  monthlyGoal: `${DB_PREFIX}/monthly_goal`,
} as const;

export type DatabaseKey = (typeof DB_KEYS)[keyof typeof DB_KEYS];

export async function readJSON<T>(key: DatabaseKey, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function writeJSON<T>(key: DatabaseKey, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeValue(key: DatabaseKey): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function clearDatabase(): Promise<void> {
  await (
    AsyncStorage as unknown as {multiRemove: (keys: string[]) => Promise<void>}
  ).multiRemove(Object.values(DB_KEYS));
}

export function createId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, token => {
    const random = (Math.random() * 16) | 0;
    const value = token === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function nowIso(): string {
  return new Date().toISOString();
}
