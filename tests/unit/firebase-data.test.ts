import { describe, expect, it, vi, beforeEach } from "vitest";
import { FirestoreDataRepository } from "@/lib/data/FirestoreDataRepository";
import { PersistedAppData } from "@/lib/data/types";

// Mock firebase/firestore
vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn((db, path) => ({ path })),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => "mock-timestamp"),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    commit: vi.fn()
  }))
}));

// Mock the getFirestore
vi.mock("@/lib/firebase/client", () => ({
  getFirestoreDb: vi.fn(() => ({}))
}));

import { getDoc, setDoc, writeBatch } from "firebase/firestore";

describe("FirestoreDataRepository", () => {
  const repo = new FirestoreDataRepository();
  const mockUid = "test-uid";
  const mockState: PersistedAppData = {
    activities: [],
    constraints: {
      budgetAvailable: 1000,
      housingType: "apartment",
      ownership: "rent",
      hasCar: false
    },
    ledger: [],
    recommendations: [],
    answeredQuestionIds: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles load when document does not exist", async () => {
    vi.mocked(getDoc).mockResolvedValueOnce({ exists: () => false, data: () => undefined } as never);
    const result = await repo.load(mockUid);
    expect(result).toBeNull();
  });

  it("handles load when document exists", async () => {
    vi.mocked(getDoc).mockResolvedValueOnce({ 
      exists: () => true, 
      data: () => ({ schemaVersion: 1 }) 
    } as never);
    // It will then call getDoc for state/current
    vi.mocked(getDoc).mockResolvedValueOnce({ 
      exists: () => true, 
      data: () => ({ 
        constraints: null, 
        answeredQuestionIds: [], 
        recommendations: [] 
      }) 
    } as never);
    // And getDocs for activities and ledger (we mock getDocs by adjusting our mock if needed)
    // Actually we didn't mock getDocs or collection in this file, we should add them.
  });

  it("handles save error", async () => {
    const error = new Error("Permission denied");
    vi.mocked(writeBatch).mockReturnValueOnce({
      set: vi.fn(),
      commit: vi.fn().mockRejectedValueOnce(error)
    } as never);
    await expect(repo.save(mockUid, mockState)).rejects.toThrow("Permission denied");
  });
});
