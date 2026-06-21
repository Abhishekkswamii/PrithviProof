import React from "react";
import { AlertTriangle, CheckCircle2, FileText, Leaf, ShieldAlert } from "lucide-react";

export default function Dashboard() {
  const isJudgeDemo = process.env.NEXT_PUBLIC_ENABLE_JUDGE_DEMO_MODE === "true";

  return (
    <main className="max-w-6xl mx-auto p-8">
      <header className="flex justify-between items-center mb-8 border-b border-charcoal-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900 flex items-center gap-2">
            <Leaf className="text-forest-600" /> PrithviProof
          </h1>
          <p className="text-charcoal-600 mt-1">Uncertainty-Aware Carbon Audit</p>
        </div>
        {isJudgeDemo && (
          <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-md font-medium text-sm border border-amber-200">
            <ShieldAlert size={16} />
            Judge Demo Mode Active
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Estimated Emissions Card */}
        <section className="bg-white p-6 border border-charcoal-200 shadow-sm col-span-1 md:col-span-2">
          <h2 className="text-lg font-semibold text-charcoal-800 mb-2">Total Estimated Emissions</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-charcoal-950">12.4</span>
            <span className="text-charcoal-600 font-medium">tCO2e / year</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 border border-amber-100">
            <AlertTriangle size={18} />
            <span>High Uncertainty: ±3.2 tCO2e. Refine your data to reduce bounds.</span>
          </div>
        </section>

        {/* Actions Overview */}
        <section className="bg-forest-50 p-6 border border-forest-200 shadow-sm">
          <h2 className="text-lg font-semibold text-forest-800 mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} /> Verified Reductions
          </h2>
          <div className="text-3xl font-bold text-forest-700">-1.2 tCO2e</div>
          <p className="text-forest-600 mt-2 text-sm">3 Actions Verified</p>
          <button className="mt-4 w-full bg-forest-600 hover:bg-forest-700 text-white py-2 px-4 font-medium transition-colors">
            View Ledger
          </button>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <section className="bg-white p-6 border border-charcoal-200 shadow-sm">
            <h3 className="font-semibold text-charcoal-800 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-teal-600"/> Needs Attention
            </h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm p-3 bg-charcoal-50 border border-charcoal-100">
                <span className="text-charcoal-700">Electricity Bill - Jan 2026</span>
                <span className="text-teal-600 font-medium cursor-pointer hover:underline">Upload Proof</span>
              </li>
              <li className="flex justify-between items-center text-sm p-3 bg-charcoal-50 border border-charcoal-100">
                <span className="text-charcoal-700">Flight Assessment</span>
                <span className="text-teal-600 font-medium cursor-pointer hover:underline">Complete</span>
              </li>
            </ul>
         </section>
      </div>
    </main>
  );
}
