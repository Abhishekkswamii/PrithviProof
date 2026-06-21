
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { z } from "zod";
import { Activity, LedgerRecord, UserConstraints, Recommendation, EmissionEstimate, UncertaintyContribution } from "../domain/models";

import { calculateEstimate, calculateCategoryTotals, calculateUncertaintyContributions } from "../domain/calculations";
import { loadFromStorage, saveToStorage, clearStorage } from "@/lib/safe-storage";
import { useAuth } from "@/providers/AuthProvider";
import { getDataRepository } from "@/lib/data/createDataRepository";
import { isFirebaseConfigured } from "@/lib/firebase/config";


const PersistedStoreSchema = z.object({
  activities: z.array(Activity),
  constraints: UserConstraints,
  ledger: z.array(LedgerRecord),
  recommendations: z.array(Recommendation),
  answeredQuestionIds: z.array(z.string()),
});
type PersistedStore = z.infer<typeof PersistedStoreSchema>;

interface AppState {
  isInitialized: boolean;
  storeError: string | null;

  activities: Activity[];
  constraints: UserConstraints;
  ledger: LedgerRecord[];
  recommendations: Recommendation[];
  answeredQuestionIds: string[];

  estimates: EmissionEstimate[];
  categoryTotals: Record<string, { central: number; low: number; high: number }>;
  uncertaintyContributions: UncertaintyContribution[];

  addActivity: (activity: Activity) => void;
  updateActivity: (activity: Activity) => void;
  removeActivity: (id: string) => void;
  updateConstraints: (constraints: UserConstraints) => void;
  addLedgerRecord: (record: LedgerRecord) => void;
  updateLedgerRecord: (record: LedgerRecord) => void;
  markQuestionAnswered: (id: string) => void;

  exportUserData: () => string;
  deleteAllData: () => void;
}

const StoreContext = createContext<AppState | null>(null);

function getEmptyState(): PersistedStore {
  return {
    activities: [],
    constraints: {
      budgetAvailable: 50000,
      transportModes: [],
      housingType: "apartment",
      ownership: "rent",
      hasCar: false,
    },
    ledger: [],
    recommendations: [],
    answeredQuestionIds: [],
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { initialized: authInitialized, user, setOnboardingCompleted } = useAuth();

  const [isInitialized, setIsInitialized] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [constraints, setConstraints] = useState<UserConstraints>(getEmptyState().constraints);
  const [ledger, setLedger] = useState<LedgerRecord[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);

  const hydrate = useCallback((data: PersistedStore) => {
    setActivities(data.activities);
    setConstraints(data.constraints);
    setLedger(data.ledger);
    setRecommendations(data.recommendations);
    setAnsweredQuestionIds(data.answeredQuestionIds);
  }, []);

  const loadKey = useRef<string | null>(null);

  useEffect(() => {
    if (!authInitialized) return;

    const key = user ? `auth:${user.uid}` : "local";
    if (loadKey.current === key) return;

    let cancelled = false;

    async function load() {
      try {
        if (user && isFirebaseConfigured()) {
          const remote = await getDataRepository(true).load(user.uid);
          if (cancelled) return;
          if (remote) {
            hydrate(remote);
          } else {
            hydrate(getEmptyState());
          }
        } else {
          const stored = loadFromStorage(PersistedStoreSchema);
          if (cancelled) return;
          if (stored) {
            hydrate(stored);
          }
        }
        loadKey.current = key;
        setStoreError(null);
      } catch (e) {
        console.error("PrithviProof: failed to load state", e);
        if (!cancelled) setStoreError("Could not load saved data. Starting fresh.");
      } finally {
        if (!cancelled) setIsInitialized(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [authInitialized, user, hydrate]);

  useEffect(() => {
    if (!isInitialized) return;
    const data: PersistedStore = {
      activities,
      constraints,
      ledger,
      recommendations,
      answeredQuestionIds,
    };

    if (user && isFirebaseConfigured()) {
      void getDataRepository(true).save(user.uid, data).catch((e) => {
        console.error("PrithviProof: Firestore save failed", e);
      });
    } else {
      saveToStorage(data);
    }
  }, [activities, constraints, ledger, recommendations, answeredQuestionIds, isInitialized, user]);

  useEffect(() => {
    if (activities.length > 0 && user) {
      void setOnboardingCompleted(true);
    }
  }, [activities.length, user, setOnboardingCompleted]);

  const estimates = activities.map(calculateEstimate);
  const categoryTotals = calculateCategoryTotals(estimates, activities);
  const uncertaintyContributions = calculateUncertaintyContributions(estimates);

  const addActivity = (activity: Activity) => setActivities((prev) => [...prev, activity]);
  const updateActivity = (activity: Activity) =>
    setActivities((prev) => prev.map((a) => (a.id === activity.id ? activity : a)));
  const removeActivity = (id: string) => setActivities((prev) => prev.filter((a) => a.id !== id));
  const updateConstraints = (c: UserConstraints) => setConstraints(c);
  const addLedgerRecord = (r: LedgerRecord) => setLedger((prev) => [...prev, r]);
  const updateLedgerRecord = (r: LedgerRecord) =>
    setLedger((prev) => prev.map((old) => (old.id === r.id ? r : old)));
  const markQuestionAnswered = (id: string) =>
    setAnsweredQuestionIds((prev) => [...prev, id]);



  const exportUserData = () =>
    JSON.stringify(
      { activities, constraints, ledger, recommendations, answeredQuestionIds },
      null,
      2
    );

  const deleteAllData = () => {
    hydrate(getEmptyState());
    setStoreError(null);
    clearStorage();
  };

  const value: AppState = {
    isInitialized,
    storeError,

    activities,
    constraints,
    ledger,
    recommendations,
    answeredQuestionIds,
    estimates,
    categoryTotals,
    uncertaintyContributions,
    addActivity,
    updateActivity,
    removeActivity,
    updateConstraints,
    addLedgerRecord,
    updateLedgerRecord,
    markQuestionAnswered,

    exportUserData,
    deleteAllData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}
