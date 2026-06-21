"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Activity, LedgerRecord, UserConstraints, Recommendation, EmissionEstimate, UncertaintyContribution } from "../domain/models";
import { seedActivities, seedConstraints, seedLedger, seedRecommendations } from "./seed";
import { calculateEstimate, calculateCategoryTotals, calculateUncertaintyContributions } from "../domain/calculations";

interface AppState {
  isInitialized: boolean;
  activities: Activity[];
  constraints: UserConstraints;
  ledger: LedgerRecord[];
  recommendations: Recommendation[];
  answeredQuestionIds: string[];
  
  // Derived state (for convenience in UI)
  estimates: EmissionEstimate[];
  categoryTotals: Record<string, { central: number; low: number; high: number }>;
  uncertaintyContributions: UncertaintyContribution[];

  // Actions
  addActivity: (activity: Activity) => void;
  updateConstraints: (constraints: UserConstraints) => void;
  addLedgerRecord: (record: LedgerRecord) => void;
  updateLedgerRecord: (record: LedgerRecord) => void;
  markQuestionAnswered: (id: string) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<AppState | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [constraints, setConstraints] = useState<UserConstraints>(seedConstraints);
  const [ledger, setLedger] = useState<LedgerRecord[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);

  // Load from local storage
  useEffect(() => {
    const isJudgeDemo = process.env.NEXT_PUBLIC_ENABLE_JUDGE_DEMO_MODE === "true";
    if (!isJudgeDemo) return;

    try {
      const storedData = localStorage.getItem("prithviproof_store");
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setActivities(parsed.activities || []);
        setConstraints(parsed.constraints || seedConstraints);
        setLedger(parsed.ledger || []);
        setRecommendations(parsed.recommendations || seedRecommendations);
        setAnsweredQuestionIds(parsed.answeredQuestionIds || []);
      } else {
        // Seed initial data
        setActivities(seedActivities);
        setConstraints(seedConstraints);
        setLedger(seedLedger);
        setRecommendations(seedRecommendations);
      }
    } catch (e) {
      console.error("Failed to load store", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem("prithviproof_store", JSON.stringify({
      activities,
      constraints,
      ledger,
      recommendations,
      answeredQuestionIds
    }));
  }, [activities, constraints, ledger, recommendations, answeredQuestionIds, isInitialized]);

  const estimates = activities.map(calculateEstimate);
  const categoryTotals = calculateCategoryTotals(estimates, activities);
  const uncertaintyContributions = calculateUncertaintyContributions(estimates);

  const addActivity = (activity: Activity) => setActivities(prev => [...prev, activity]);
  const updateConstraints = (c: UserConstraints) => setConstraints(c);
  const addLedgerRecord = (r: LedgerRecord) => setLedger(prev => [...prev, r]);
  const updateLedgerRecord = (r: LedgerRecord) => setLedger(prev => prev.map(old => old.id === r.id ? r : old));
  const markQuestionAnswered = (id: string) => setAnsweredQuestionIds(prev => [...prev, id]);
  const resetDemo = () => {
    setActivities(seedActivities);
    setConstraints(seedConstraints);
    setLedger(seedLedger);
    setRecommendations(seedRecommendations);
    setAnsweredQuestionIds([]);
  };

  const value: AppState = {
    isInitialized,
    activities,
    constraints,
    ledger,
    recommendations,
    answeredQuestionIds,
    estimates,
    categoryTotals,
    uncertaintyContributions,
    addActivity,
    updateConstraints,
    addLedgerRecord,
    updateLedgerRecord,
    markQuestionAnswered,
    resetDemo
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}
