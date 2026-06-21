import { z } from "zod";

const STORAGE_VERSION = 1;
const STORAGE_KEY = `prithviproof_v${STORAGE_VERSION}`;

function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const storage = window.localStorage;
    if (
      !storage ||
      typeof storage.getItem !== "function" ||
      typeof storage.setItem !== "function" ||
      typeof storage.removeItem !== "function"
    ) {
      return false;
    }
    const testKey = "__prithviproof_test__";
    storage.setItem(testKey, "1");
    const val = storage.getItem(testKey);
    storage.removeItem(testKey);
    return val === "1";
  } catch {
    return false;
  }
}

export function loadFromStorage<T>(schema: z.ZodType<T>): T | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    console.warn("PrithviProof: stored data failed validation, resetting.", result.error.issues);
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    return null;
  }
}

export function saveToStorage(data: unknown): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // QuotaExceededError or SecurityError — silently degrade
  }
}

export function clearStorage(): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}
