import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { loadFromStorage, saveToStorage, clearStorage } from "../../src/lib/safe-storage";
import { z } from "zod";

const TestSchema = z.object({
  name: z.string(),
  count: z.number(),
});

describe("SafeBrowserStorage", () => {
  const originalWindow = globalThis.window;
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const localStorageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value.toString(); }),
      removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
      clear: vi.fn(() => { mockStorage = {}; }),
      length: 0,
      key: vi.fn()
    };
    
    // Default mock
    Object.defineProperty(globalThis, "window", { 
      value: { localStorage: localStorageMock }, 
      writable: true, 
      configurable: true 
    });
  });

  afterEach(() => {
    // Restore window
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", { value: originalWindow, writable: true, configurable: true });
    } else {
      // @ts-expect-error cleanup
      delete globalThis.window;
    }
    vi.restoreAllMocks();
  });

  describe("SSR (no window)", () => {
    it("loadFromStorage returns null when window is undefined", () => {
      // @ts-expect-error — intentionally removing window for test
      delete globalThis.window;
      expect(loadFromStorage(TestSchema)).toBeNull();
    });

    it("saveToStorage is a no-op when window is undefined", () => {
      // @ts-expect-error — intentionally removing window for test
      delete globalThis.window;
      expect(() => saveToStorage({ name: "test", count: 1 })).not.toThrow();
    });
  });

  describe("unavailable storage", () => {
    it("returns null when localStorage.getItem throws SecurityError", () => {
      window.localStorage.getItem = vi.fn().mockImplementation(() => { throw new DOMException("blocked", "SecurityError"); });
      expect(loadFromStorage(TestSchema)).toBeNull();
    });
  });

  describe("corrupted JSON", () => {
    it("returns null and removes key on corrupted JSON", () => {
      window.localStorage.setItem("prithviproof_v1", "{not valid json!!!");
      const result = loadFromStorage(TestSchema);
      expect(result).toBeNull();
      expect(window.localStorage.removeItem).toHaveBeenCalledWith("prithviproof_v1");
    });
  });

  describe("schema validation", () => {
    it("returns null when data does not match schema", () => {
      window.localStorage.setItem("prithviproof_v1", JSON.stringify({ wrong: "shape" }));
      const result = loadFromStorage(TestSchema);
      expect(result).toBeNull();
    });

    it("returns parsed data when schema matches", () => {
      const data = { name: "test", count: 42 };
      window.localStorage.setItem("prithviproof_v1", JSON.stringify(data));
      const result = loadFromStorage(TestSchema);
      expect(result).toEqual(data);
    });
  });

  describe("save and load round-trip", () => {
    it("saves and loads data correctly", () => {
      const data = { name: "roundtrip", count: 99 };
      saveToStorage(data);
      const result = loadFromStorage(TestSchema);
      expect(result).toEqual(data);
    });
  });

  describe("clearStorage", () => {
    it("removes the storage key", () => {
      window.localStorage.setItem("prithviproof_v1", "data");
      clearStorage();
      expect(window.localStorage.getItem("prithviproof_v1")).toBeNull();
    });
  });
});
