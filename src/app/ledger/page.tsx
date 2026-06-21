"use client";

import React from "react";
import { useStore } from "@/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transitionLedgerState, isValidTransition, calculateTotalSavings } from "@/domain/ledger";
import { LedgerRecord, LedgerState } from "@/domain/models";
import { ShieldCheck, Clock, CheckCircle2, AlertOctagon, ArrowRight } from "lucide-react";

export default function Ledger() {
  const { isInitialized, ledger, updateLedgerRecord } = useStore();

  if (!isInitialized) return <div className="p-8 text-center" aria-live="polite">Loading ledger...</div>;

  const totals = calculateTotalSavings(ledger);

  const handleStateChange = (record: LedgerRecord, newState: LedgerState) => {
    try {
      const updated = transitionLedgerState(record, newState);
      updateLedgerRecord(updated);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  };

  const getIcon = (state: LedgerState) => {
    switch(state) {
      case "planned": return <Clock className="text-amber-500" size={18}/>;
      case "in-progress": return <ArrowRight className="text-blue-500" size={18}/>;
      case "verified": return <CheckCircle2 className="text-forest-600" size={18}/>;
      case "rejected": return <AlertOctagon className="text-red-500" size={18}/>;
      default: return null;
    }
  };

  const sections: { title: string; states: LedgerState[]; bg: string }[] = [
    { title: "Planning & Progress", states: ["estimated", "planned", "in-progress"], bg: "bg-charcoal-50" },
    { title: "Verified Reality", states: ["verified"], bg: "bg-forest-50 border-forest-200" },
    { title: "Rejected / Invalid", states: ["rejected"], bg: "bg-red-50 border-red-100" }
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-charcoal-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900 flex items-center gap-2">
            <ShieldCheck className="text-forest-600" /> Evidence Ledger
          </h1>
          <p className="text-charcoal-600 mt-1">Immutable-style tracking of action provenance.</p>
        </div>
        <div className="flex gap-4 bg-white p-3 rounded border border-charcoal-200 shadow-sm">
          <div className="text-center pr-4 border-r border-charcoal-200">
            <div className="text-xs text-charcoal-500 font-medium">Projected</div>
            <div className="text-xl font-bold text-amber-600">{totals.projected} <span className="text-xs font-normal">kgCO2e</span></div>
          </div>
          <div className="text-center pl-2">
            <div className="text-xs text-forest-700 font-bold uppercase tracking-wide">Realized (Verified)</div>
            <div className="text-xl font-bold text-forest-700">{totals.verified} <span className="text-xs font-normal">kgCO2e</span></div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map(section => (
          <div key={section.title} className="space-y-4">
            <h2 className="font-bold text-charcoal-800 border-b border-charcoal-200 pb-2">{section.title}</h2>
            {ledger.filter(l => section.states.includes(l.state)).length === 0 ? (
              <div className="p-4 text-center text-sm text-charcoal-400 border border-dashed border-charcoal-300 rounded">
                No records
              </div>
            ) : (
              ledger.filter(l => section.states.includes(l.state)).map(record => (
                <Card key={record.id} className={`${section.bg} shadow-sm border-charcoal-200`}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base leading-tight flex items-start gap-2">
                        {getIcon(record.state)}
                        <span className="mt-0.5">{record.title}</span>
                      </CardTitle>
                    </div>
                    <div className="text-xs text-charcoal-500 uppercase tracking-wider font-semibold mt-1">
                      {record.state.replace('-', ' ')}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="text-sm text-charcoal-700 mb-4">
                      {record.state === 'verified' ? (
                        <span className="font-medium text-forest-700">Verified: {record.verifiedSavingsKgCO2e} kgCO2e</span>
                      ) : (
                        <span>Projected: {record.projectedSavingsKgCO2e} kgCO2e</span>
                      )}
                    </div>

                    <div className="space-y-2 mt-4 pt-4 border-t border-charcoal-200">
                      <span className="text-xs text-charcoal-500 font-medium">Update State:</span>
                      <div className="flex flex-wrap gap-2">
                        {["planned", "in-progress", "verified", "rejected"].map((s) => {
                          const stateVal = s as LedgerState;
                          if (!isValidTransition(record.state, stateVal) || record.state === stateVal) return null;
                          return (
                            <button
                              key={stateVal}
                              onClick={() => handleStateChange(record, stateVal)}
                              className="text-xs px-2 py-1 bg-white border border-charcoal-300 rounded hover:bg-charcoal-100 hover:border-charcoal-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                            >
                              Move to {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
