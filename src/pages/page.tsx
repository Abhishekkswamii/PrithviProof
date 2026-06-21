
import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  MessageCircleQuestion,
  TrendingDown,
  ShieldCheck,
  SlidersHorizontal,
  GitBranch,
  Lock,
  Calculator,
} from "lucide-react";
import { useStore } from "@/data/store";
import { useAuth } from "@/providers/AuthProvider";
import { getAuditCtaDestination } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/MarketingHeader";
import { MarketingFooter } from "@/components/MarketingFooter";
import { HeroPreviewPanel } from "@/components/HeroPreviewPanel";
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator";
import { StatusBadge } from "@/components/StatusBadge";
import { formatEmissions } from "@/lib/format";

const steps = [
  { icon: Search, title: "Understand", text: "Build an emissions estimate from your real activities with honest uncertainty ranges." },
  { icon: MessageCircleQuestion, title: "Clarify", text: "Answer adaptive questions that target the biggest gaps in your data." },
  { icon: TrendingDown, title: "Reduce", text: "Get ranked actions filtered by budget, housing, transport and effort." },
  { icon: ShieldCheck, title: "Verify", text: "Track planned actions through to verified evidence — only then do savings count." },
];

export default function LandingPage() {

  const { isAuthenticated, profile, initialized } = useAuth();
  const navigate = useNavigate();


  const handleStartAudit = () => {
    navigate(
      getAuditCtaDestination(
        initialized ? isAuthenticated : false,
        profile?.onboardingCompleted ?? false
      )
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <MarketingHeader />

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="min-h-[calc(100vh-3.5rem)] flex items-center border-b border-border bg-canvas">
          <div className="max-w-content mx-auto px-4 py-12 lg:py-16 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              <div>
                <p className="text-xs font-semibold text-forest-700 uppercase tracking-wider mb-3">
                  Evidence-aware personal carbon auditing
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight text-balance">
                  Your footprint is an estimate. Your progress should be proof.
                </h1>
                <p className="mt-4 text-text-secondary leading-relaxed max-w-lg">
                  PrithviProof calculates uncertainty-aware emissions from your activities, asks adaptive questions where data quality matters most, and separates projected reductions from verified evidence.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={handleStartAudit} className="h-11 px-5">
                    Start My Carbon Audit
                    <ArrowRight size={18} className="ml-2" aria-hidden="true" />
                  </Button>

                </div>
                <p className="mt-4 text-xs text-text-secondary">
                  Transparent factors · No offsets · Your data stays under your control
                </p>
              </div>
              <HeroPreviewPanel />
            </div>
          </div>
        </section>

        {/* Steps */}
        <section id="how-it-works" className="py-14 bg-surface border-b border-border">
          <div className="max-w-content mx-auto px-4">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Understand. Clarify. Reduce. Verify.</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">A complete audit loop designed for honest accounting, not greenwashing.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step) => (
                <div key={step.title} className="bg-canvas rounded-card border border-border p-5">
                  <step.icon size={22} className="text-forest-700 mb-3" aria-hidden="true" />
                  <h3 className="font-semibold text-text-primary mb-1.5">{step.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Adaptive questioning */}
        <section id="why-different" className="py-14 bg-canvas border-b border-border">
          <div className="max-w-content mx-auto px-4">
            <h2 className="text-2xl font-bold text-text-primary mb-2">PrithviProof asks what matters next</h2>
            <p className="text-text-secondary mb-8 max-w-2xl">
              Instead of a fixed questionnaire, adaptive questioning targets categories contributing most to total uncertainty — improving confidence where it counts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface rounded-card border border-border p-5">
                <p className="text-xs font-medium text-text-secondary mb-3">Before clarification</p>
                <p className="text-2xl font-bold text-text-primary tabular-nums">{formatEmissions(164.7)}</p>
                <p className="text-sm text-text-secondary mt-1">Range: 98.0–231.4 kg CO₂e</p>
                <div className="mt-4">
                  <ConfidenceIndicator score={52} label="Estimate confidence" />
                </div>
              </div>
              <div className="bg-surface-green rounded-card border border-green-100 p-5">
                <p className="text-xs font-medium text-forest-700 mb-3">After one targeted question</p>
                <p className="text-2xl font-bold text-text-primary tabular-nums">{formatEmissions(164.7)}</p>
                <p className="text-sm text-text-secondary mt-1">Range: 126.9–202.5 kg CO₂e</p>
                <div className="mt-4">
                  <ConfidenceIndicator score={77} label="Estimate confidence" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculation disclosure */}
        <section className="py-14 bg-surface border-b border-border">
          <div className="max-w-content mx-auto px-4">
            <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Calculator size={24} className="text-forest-700" aria-hidden="true" />
              Every number explains itself
            </h2>
            <p className="text-text-secondary mb-6 max-w-2xl">
              Each estimate shows the full calculation chain with source, year, geography and confidence — never a black box.
            </p>
            <div className="bg-canvas rounded-card border border-border p-5 max-w-2xl">
              <p className="text-sm font-medium text-text-primary mb-3">Scooter commute example</p>
              <div className="font-mono text-xs bg-surface rounded-card p-4 border border-border space-y-2">
                <p>300 km × 0.04 kg CO₂e/km = <span className="text-forest-700 font-semibold">12.0 kg CO₂e</span></p>
                <p>Range: 9.3 – 14.7 kg CO₂e (low / central / high)</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-xs px-2 py-1 bg-surface border border-border rounded-card">India GHG Program · 2022</span>
                <span className="text-xs px-2 py-1 bg-surface border border-border rounded-card">Geography: India</span>
                <span className="text-xs px-2 py-1 bg-surface border border-border rounded-card">Confidence: 80%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recommendations */}
        <section className="py-14 bg-canvas border-b border-border">
          <div className="max-w-content mx-auto px-4">
            <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <SlidersHorizontal size={24} className="text-forest-700" aria-hidden="true" />
              Recommendations that respect real life
            </h2>
            <p className="text-text-secondary mb-6 max-w-2xl">
              Actions are ranked by expected reduction and confidence, then filtered by constraints you actually face.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Monthly budget", value: "₹50,000" },
                { label: "Housing", value: "Shared accommodation" },
                { label: "Ownership", value: "Renter" },
                { label: "Transport", value: "Metro, scooter" },
              ].map((item) => (
                <div key={item.label} className="bg-surface rounded-card border border-border p-4">
                  <p className="text-xs text-text-secondary">{item.label}</p>
                  <p className="text-sm font-semibold text-text-primary mt-1">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-text-secondary mt-4">
              Rooftop solar won&apos;t appear for renters. Low-effort LED upgrades rank higher when budget is tight.
            </p>
          </div>
        </section>

        {/* Evidence lifecycle */}
        <section className="py-14 bg-surface border-b border-border">
          <div className="max-w-content mx-auto px-4">
            <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <GitBranch size={24} className="text-forest-700" aria-hidden="true" />
              Projected is not verified
            </h2>
            <p className="text-text-secondary mb-6 max-w-2xl">
              The evidence ledger tracks each action through its lifecycle. Only verified actions count as realized savings.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {(["estimated", "planned", "in-progress", "verified"] as const).map((state, i) => (
                <React.Fragment key={state}>
                  <StatusBadge status={state} />
                  {i < 3 && <ArrowRight size={16} className="text-text-secondary hidden sm:block" aria-hidden="true" />}
                </React.Fragment>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-2xl">
              <div className="bg-canvas rounded-card border border-border p-4">
                <p className="text-xs text-text-secondary">Projected savings</p>
                <p className="text-lg font-bold text-amber tabular-nums">{formatEmissions(120, true)}</p>
                <p className="text-xs text-text-secondary mt-1">Includes planned and in-progress actions</p>
              </div>
              <div className="bg-surface-green rounded-card border border-green-100 p-4">
                <p className="text-xs text-text-secondary">Verified savings</p>
                <p className="text-lg font-bold text-forest-700 tabular-nums">{formatEmissions(0, true)}</p>
                <p className="text-xs text-text-secondary mt-1">Only counts after evidence is confirmed</p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section id="privacy" className="py-14 bg-canvas border-b border-border">
          <div className="max-w-content mx-auto px-4">
            <h2 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Lock size={24} className="text-forest-700" aria-hidden="true" />
              Your data, your control
            </h2>
            <p className="text-text-secondary max-w-2xl leading-relaxed">
              Your account data is stored securely in the cloud with your consent. You can export or delete your data at any time from Settings.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section id="methodology" className="py-16 bg-forest-950 text-white">
          <div className="max-w-content mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Turn estimates into evidence.</h2>
            <p className="text-white/70 mb-8 max-w-lg mx-auto">
              Start with an honest baseline, clarify what you don&apos;t know, and prove what actually changed.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={handleStartAudit} className="bg-green-500 hover:bg-green-500/90 text-forest-950 h-11 px-6">
                Start My Audit
              </Button>

            </div>
            <p className="mt-6 text-sm text-white/50">
              <Link to="/methodology" className="underline hover:text-white/80">Read our open methodology</Link>
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
