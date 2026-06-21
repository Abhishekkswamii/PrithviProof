import { LedgerRecord, LedgerState } from "./models";

const VALID_TRANSITIONS: Record<LedgerState, LedgerState[]> = {
  "estimated": ["planned", "rejected"],
  "planned": ["in-progress", "rejected"],
  "in-progress": ["verified", "rejected"],
  "verified": ["rejected"], // Can be rejected if evidence is later found invalid
  "rejected": ["planned"] // Can be re-planned
};

export function isValidTransition(fromState: LedgerState, toState: LedgerState): boolean {
  if (fromState === toState) return true;
  return VALID_TRANSITIONS[fromState].includes(toState);
}

export function transitionLedgerState(record: LedgerRecord, newState: LedgerState, evidenceUrls?: string[]): LedgerRecord {
  if (!isValidTransition(record.state, newState)) {
    throw new Error(`Invalid transition from ${record.state} to ${newState}`);
  }

  // Business rules for verified savings
  let verifiedSavingsKgCO2e = record.verifiedSavingsKgCO2e;
  
  if (newState === "verified") {
    // When verified, projected becomes verified.
    // In a real app, evidence might adjust this number.
    verifiedSavingsKgCO2e = record.projectedSavingsKgCO2e;
  } else if (newState === "rejected") {
    // If rejected, verified savings are nullified
    verifiedSavingsKgCO2e = 0;
  }

  return {
    ...record,
    state: newState,
    verifiedSavingsKgCO2e,
    evidenceUrls: evidenceUrls || record.evidenceUrls,
    updatedAt: new Date().toISOString()
  };
}

export function calculateTotalSavings(records: LedgerRecord[]): { projected: number, verified: number } {
  return records.reduce((acc, rec) => {
    // Exclude rejected records from projected savings entirely
    if (rec.state !== "rejected") {
       acc.projected += rec.projectedSavingsKgCO2e;
    }
    acc.verified += rec.verifiedSavingsKgCO2e;
    return acc;
  }, { projected: 0, verified: 0 });
}
