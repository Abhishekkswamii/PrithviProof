"use client";

import React from "react";
import { AlertTriangle, ShieldAlert, TrendingDown } from "lucide-react";
import { useStore } from "@/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccessibleChart, ChartDataPoint } from "@/components/AccessibleChart";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { isInitialized, categoryTotals, uncertaintyContributions, estimates } = useStore();
  const isJudgeDemo = process.env.NEXT_PUBLIC_ENABLE_JUDGE_DEMO_MODE === "true";
  const router = useRouter();

  if (!isInitialized) return <div className="p-8 text-center" aria-live="polite">Loading dashboard...</div>;

  const totalCentral = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.central, 0);
  const totalLow = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.low, 0);
  const totalHigh = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.high, 0);
  
  const chartData: ChartDataPoint[] = Object.entries(categoryTotals).map(([cat, values]) => ({
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: values.central,
    low: values.low,
    high: values.high,
    colorClass: cat === "transport" ? "bg-amber-500" : cat === "energy" ? "bg-teal-500" : "bg-forest-500"
  }));

  const topContributor = uncertaintyContributions[0];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-charcoal-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal-900">Your Carbon Audit</h1>
          <p className="text-charcoal-600 mt-1">Current estimates and uncertainty ranges.</p>
        </div>
        {isJudgeDemo && (
          <div className="flex items-center gap-2 bg-amber-100 text-amber-900 px-3 py-1.5 rounded-md font-medium text-sm border border-amber-300">
            <ShieldAlert size={16} />
            Judge Demo Mode
          </div>
        )}
      </header>

      <section aria-labelledby="summary-heading" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-charcoal-900 text-white border-none shadow-md">
          <CardHeader>
            <CardTitle id="summary-heading" className="text-charcoal-200">Total Estimated Emissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{totalCentral.toFixed(1)}</span>
              <span className="text-charcoal-300 font-medium text-lg">kgCO2e / month</span>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-amber-300 bg-charcoal-800/50 p-2 rounded border border-charcoal-700 w-full">
              <AlertTriangle size={16} className="shrink-0" />
              <span>Uncertainty Range: {totalLow.toFixed(1)} – {totalHigh.toFixed(1)} kgCO2e</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-forest-50 border-forest-200">
          <CardHeader>
            <CardTitle className="text-forest-800 flex items-center gap-2">
              <TrendingDown size={20} /> Next Best Action
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topContributor && topContributor.percentageOfTotal > 10 ? (
              <div className="space-y-4">
                <p className="text-charcoal-800">
                  Your estimate has high uncertainty. The biggest contributor is activity <span className="font-mono text-sm bg-white px-1 border border-charcoal-200 rounded">{topContributor.activityId}</span> ({topContributor.percentageOfTotal.toFixed(0)}% of total variance).
                </p>
                <Button onClick={() => router.push("/assessment")} className="w-full sm:w-auto bg-forest-600 hover:bg-forest-700">
                  Clarify Uncertainty
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-charcoal-800">Your baseline is reasonably confident. Time to act.</p>
                <Button onClick={() => router.push("/recommendations")} className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700">
                  View Recommendations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="breakdown-heading">
        <Card>
          <CardHeader>
            <CardTitle id="breakdown-heading">Category Breakdown & Uncertainty</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <AccessibleChart data={chartData} title="Emissions by Category" yAxisLabel="kgCO2e" />
            ) : (
              <p className="text-charcoal-500 italic py-8 text-center">No activity data yet. Start an assessment.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <Disclosure title="How was the total calculated?" className="mt-8">
        <p className="mb-2">Total emissions are the sum of individual activity estimates calculated as:</p>
        <code className="block bg-charcoal-100 p-3 rounded mb-4 text-xs font-mono overflow-x-auto text-charcoal-900">
          Emission = Activity Value × Normalized Factor Value
        </code>
        <p className="mb-2">The <strong>uncertainty range</strong> is calculated using the Root Sum Square method of the underlying factor&apos;s inherent uncertainty and the data quality score of your inputs.</p>
        <div className="mt-4 text-xs border-t border-charcoal-200 pt-4">
          <p className="font-semibold mb-1">Active Estimates:</p>
          <ul className="space-y-1 list-disc pl-4">
            {estimates.map(est => (
              <li key={est.activityId}>
                {est.activityId}: {est.central.toFixed(2)} kgCO2e (±{((est.high - est.central)).toFixed(2)})
              </li>
            ))}
          </ul>
        </div>
      </Disclosure>
    </div>
  );
}
