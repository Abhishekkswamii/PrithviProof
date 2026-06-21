import { localFactors, FACTOR_VERSION } from "@/domain/factors";
import { Disclosure } from "@/components/ui/disclosure";
import { getCategoryLabel } from "@/lib/labels";

const sections = [
  { id: "overview", label: "Overview" },
  { id: "factors", label: "Emission factors" },
  { id: "formula", label: "Calculation formula" },
  { id: "uncertainty", label: "Uncertainty method" },
  { id: "data-quality", label: "Data quality scoring" },
  { id: "recommendations", label: "Recommendation ranking" },
  { id: "evidence", label: "Evidence state rules" },
  { id: "limitations", label: "Limitations" },
];

export default function MethodologyContent() {
  return (
    <div className="max-w-content mx-auto p-4 sm:p-6">
      <header className="mb-8">
        <h1 className="text-xl font-bold text-text-primary mb-2">Methodology</h1>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          PrithviProof uses transparent emission factors, explicit uncertainty propagation, and constraint-aware ranking. Every estimate is an approximation — we show ranges and sources so you can judge confidence yourself.
        </p>
      </header>

      <nav aria-label="Table of contents" className="mb-8 bg-canvas-subtle border border-border rounded-card p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-3">Contents</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-forest-700 hover:underline py-1 inline-block">
                {i + 1}. {s.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-10">
        <section id="overview">
          <h2 className="text-base font-semibold text-text-primary mb-3">Overview</h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            Emissions estimates are calculated as activity quantity × emission factor, with uncertainty derived from both factor variability and input data quality. Adaptive questions target activities contributing most to total variance. Recommendations are filtered by user constraints before ranking.
          </p>
        </section>

        <section id="factors">
          <h2 className="text-base font-semibold text-text-primary mb-3">Emission factor sources</h2>
          <p className="text-xs text-text-secondary mb-3">Factor version: {FACTOR_VERSION}</p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-border">
              <thead className="bg-canvas-subtle">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Factor</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Category</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Value</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Uncertainty</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Source</th>
                  <th scope="col" className="px-3 py-2 text-left font-medium">Year / Geography</th>
                </tr>
              </thead>
              <tbody>
                {localFactors.map((f) => (
                  <tr key={f.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium text-text-primary">{f.name}</td>
                    <td className="px-3 py-2 text-text-secondary">{getCategoryLabel(f.category)}</td>
                    <td className="px-3 py-2 tabular-nums">{f.value} kg CO₂e/{f.unit}</td>
                    <td className="px-3 py-2">±{f.uncertaintyPercent}%</td>
                    <td className="px-3 py-2">
                      {f.provenance.url ? (
                        <a href={f.provenance.url} className="text-forest-700 hover:underline" target="_blank" rel="noopener noreferrer">
                          {f.provenance.sourceName}
                        </a>
                      ) : (
                        f.provenance.sourceName
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex gap-1 flex-wrap">
                        <span className="text-xs px-1.5 py-0.5 bg-surface border border-border rounded-card">{f.provenance.year}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-surface border border-border rounded-card">{f.provenance.geography}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="formula">
          <h2 className="text-base font-semibold text-text-primary mb-3">Calculation formula</h2>
          <div className="bg-canvas-subtle border border-border rounded-card p-4 font-mono text-sm space-y-2 max-w-xl">
            <p>central = normalized_activity × factor_value</p>
            <p>combined_uncertainty = √(activity_error² + factor_error²)</p>
            <p>low = central − (central × combined_uncertainty)</p>
            <p>high = central + (central × combined_uncertainty)</p>
          </div>
        </section>

        <section id="uncertainty">
          <h2 className="text-base font-semibold text-text-primary mb-3">Uncertainty method</h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            Total relative error uses root sum square propagation of activity input error and intrinsic factor uncertainty. Category totals sum individual bounds (conservative, assumes correlation). Variance decomposition identifies which activities contribute most to total uncertainty for adaptive questioning.
          </p>
        </section>

        <section id="data-quality">
          <h2 className="text-base font-semibold text-text-primary mb-3">Data quality scoring</h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl mb-3">
            Each activity carries a data quality score from 0 (pure guess) to 100 (metered/measured). This maps linearly to activity input error: 100 → 0% error, 0 → 50% error.
          </p>
          <div className="bg-surface border border-border rounded-card p-4 text-sm font-mono">
            activity_error% = max(0, 50 − data_quality_score / 2)
          </div>
        </section>

        <section id="recommendations">
          <h2 className="text-base font-semibold text-text-primary mb-3">Recommendation ranking</h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl mb-3">
            Recommendations are first filtered by required constraints (budget, housing type, ownership). Remaining items are ranked by:
          </p>
          <div className="bg-surface border border-border rounded-card p-4 text-sm font-mono">
            score = (expected_reduction × confidence) ÷ (cost + 1 + effort × 10)
          </div>
        </section>

        <section id="evidence">
          <h2 className="text-base font-semibold text-text-primary mb-3">Evidence state rules</h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl mb-3">
            Ledger entries follow strict transitions: Estimated → Planned → In progress → Verified. Rejection is permitted from any state. Only verified entries accrue verified savings; rejected entries zero out verified amounts and are excluded from projected totals.
          </p>
          <ul className="text-sm text-text-secondary space-y-1 list-disc pl-5">
            <li>Planned: committed intent, projected savings counted</li>
            <li>In progress: action underway, projected savings counted</li>
            <li>Verified: evidence confirmed, savings move to verified total</li>
            <li>Rejected: removed from projected totals</li>
          </ul>
        </section>

        <section id="limitations">
          <h2 className="text-base font-semibold text-text-primary mb-3">Limitations and assumptions</h2>
          <ul className="text-sm text-text-secondary space-y-2 list-disc pl-5 max-w-3xl">
            <li>Emission factors are static averages and may not reflect your specific supplier or route.</li>
            <li>Unit conversions use fixed exchange rates where currency conversion is needed.</li>
            <li>Category total bounds use simple summation, not full statistical correlation modeling.</li>
            <li>Natural-language activity parsing maps to nearest available factors — manual entry is more precise.</li>
            <li>Recommendations are heuristic rankings, not guaranteed outcomes.</li>
          </ul>
        </section>
      </div>

      <div className="mt-10 space-y-3">
        <h2 className="text-base font-semibold text-text-primary">Additional disclosures</h2>
        <Disclosure title="How is privacy handled?">
          <p className="mt-2 text-sm text-text-secondary">
            Judge Demo mode stores data locally in your browser. Authenticated accounts sync to Firestore under your user ID with your consent. You can export or delete data from Settings when signed in.
          </p>
        </Disclosure>
        <Disclosure title="What happens when an action is rejected?">
          <p className="mt-2 text-sm text-text-secondary">
            Rejected ledger entries are excluded from projected savings. Any previously verified savings for that entry are reset to zero.
          </p>
        </Disclosure>
      </div>
    </div>
  );
}
