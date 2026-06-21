
import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, FlaskConical, ArrowRight, Lightbulb, ClipboardList } from "lucide-react";
import { useStore } from "@/data/store";
import { Card, CardContent } from "@/components/ui/card";
import { AccessibleChart, ChartDataPoint, ChartDataTable } from "@/components/AccessibleChart";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { formatEmissionsRange } from "@/lib/format";
import { getCategoryLabel, getCategoryColorClass, getActivityLabel } from "@/lib/labels";
import { calculateTotalSavings } from "@/domain/ledger";
import { rankRecommendations } from "@/domain/recommendations";

function getCurrentPeriod(): string {
  const now = new Date();
  return now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export default function Dashboard() {
  const {
    isInitialized,
    storeError,
    categoryTotals,
    uncertaintyContributions,
    estimates,
    activities,
    ledger,
    recommendations,
    constraints,
  } = useStore();
  const navigate = useNavigate();

  if (!isInitialized) {
    return (
      <div className="max-w-content mx-auto p-6">
        <div className="animate-pulse h-6 w-48 bg-canvas-subtle rounded" aria-hidden="true" />
      </div>
    );
  }

  if (storeError) {
    return (
      <div className="max-w-content mx-auto p-6">
        <div className="bg-surface border border-amber/30 rounded-card p-6 text-center">
          <AlertTriangle size={28} className="text-amber mx-auto mb-3" aria-hidden="true" />
          <p className="text-text-primary font-medium">{storeError}</p>
          <p className="text-sm text-text-secondary mt-2">The app is running with default data.</p>
        </div>
      </div>
    );
  }

  const totalCentral = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.central, 0);
  const totalLow = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.low, 0);
  const totalHigh = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.high, 0);
  const savings = calculateTotalSavings(ledger);

  const avgConfidence =
    activities.length > 0
      ? Math.round(activities.reduce((s, a) => s + a.dataQualityScore, 0) / activities.length)
      : 0;

  const chartData: ChartDataPoint[] = Object.entries(categoryTotals).map(([cat, values]) => ({
    label: getCategoryLabel(cat),
    value: values.central,
    low: values.low,
    high: values.high,
    colorClass: getCategoryColorClass(cat),
  }));

  const topContributor = uncertaintyContributions[0];
  const topActivity = topContributor ? activities.find((a) => a.id === topContributor.activityId) : undefined;

  const activeLedgerIds = ledger.filter((l) => l.state !== "rejected").map((l) => l.recommendationId);
  const topRec = rankRecommendations(recommendations, constraints, activeLedgerIds)[0];

  const recentLedger = [...ledger].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 2);

  return (
    <div className="max-w-content mx-auto p-4 sm:p-6 space-y-5">
      <PageHeader
        title="Your Carbon Audit"
        description={`Current period: ${getCurrentPeriod()}`}

        action={
          <Button onClick={() => navigate("/assessment")} className="h-11">
            Clarify My Estimate
          </Button>
        }
      />

      {estimates.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No activity data yet"
          description="Start an assessment or log an activity to build your emissions estimate."
          action={
            <Button onClick={() => navigate("/assessment")}>Start Assessment</Button>
          }
        />
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Summary metrics">
            <MetricCard
              label="Monthly emissions estimate"
              value={totalCentral.toFixed(1)}
              subtext={`Range: ${formatEmissionsRange(totalLow, totalHigh)}/month`}
            />
            <MetricCard
              label="Data confidence"
              value={`${avgConfidence}%`}
              subtext="Based on activity data quality scores"
              variant="green"
            />
            <MetricCard
              label="Projected savings"
              value={savings.projected.toFixed(1)}
              subtext="kg CO₂e/month (planned + in progress)"
              variant="amber"
            />
            <MetricCard
              label="Verified savings"
              value={savings.verified.toFixed(1)}
              subtext="kg CO₂e/month (evidence confirmed)"
              variant="green"
            />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardContent className="pt-5">
                <AccessibleChart
                  data={chartData}
                  title="Emissions by category"
                  yAxisLabel="kg CO₂e/month"
                  maxHeight={260}
                  hideTable
                />
                <ChartDataTable data={chartData} title="Emissions by category" yAxisLabel="kg CO₂e/month" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 space-y-4">
                <h2 className="text-sm font-semibold text-text-primary">Where uncertainty comes from</h2>
                {uncertaintyContributions.length === 0 ? (
                  <p className="text-sm text-text-secondary">Add activities to see uncertainty breakdown.</p>
                ) : (
                  <ul className="space-y-3">
                    {uncertaintyContributions.slice(0, 4).map((contrib) => {
                      const act = activities.find((a) => a.id === contrib.activityId);
                      if (!act) return null;
                      return (
                        <li key={contrib.activityId} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-text-primary">{getActivityLabel(act)}</span>
                            <span className="text-text-secondary">{contrib.percentageOfTotal.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-canvas-subtle rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getCategoryColorClass(act.categoryId)}`}
                              style={{ width: `${contrib.percentageOfTotal}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <ConfidenceIndicator score={avgConfidence} />
              </CardContent>
            </Card>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-5">
                <h2 className="text-sm font-semibold text-text-primary mb-2">Best next question</h2>
                {topActivity && topContributor && topContributor.percentageOfTotal > 10 ? (
                  <>
                    <p className="text-sm text-text-secondary">
                      Clarify <span className="font-medium text-text-primary">{getActivityLabel(topActivity)}</span> — it drives {topContributor.percentageOfTotal.toFixed(0)}% of your uncertainty.
                    </p>
                    <Button onClick={() => navigate("/assessment")} className="mt-3 h-10 text-xs w-full">
                      Answer next question
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-text-secondary">Your baseline is reasonably confident. Focus on high-impact actions.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <h2 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-1.5">
                  <Lightbulb size={16} className="text-amber" aria-hidden="true" />
                  Highest-impact feasible action
                </h2>
                {topRec ? (
                  <>
                    <p className="text-sm font-medium text-text-primary">{topRec.title}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      ~{topRec.expectedReductionKgCO2e} kg CO₂e/month · {topRec.confidencePercent}% confidence
                    </p>
                    <Link to="/recommendations" className="inline-flex items-center gap-1 text-xs text-forest-700 font-medium mt-3 hover:underline">
                      View all recommendations <ArrowRight size={12} aria-hidden="true" />
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-text-secondary">No new recommendations match your constraints.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <h2 className="text-sm font-semibold text-text-primary mb-2">Recent evidence status</h2>
                {recentLedger.length === 0 ? (
                  <p className="text-sm text-text-secondary">No ledger entries yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {recentLedger.map((rec) => (
                      <li key={rec.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-text-primary truncate">{rec.title}</span>
                        <StatusBadge status={rec.state} />
                      </li>
                    ))}
                  </ul>
                )}
                <Link to="/ledger" className="inline-flex items-center gap-1 text-xs text-forest-700 font-medium mt-3 hover:underline">
                  Open evidence ledger <ArrowRight size={12} aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
