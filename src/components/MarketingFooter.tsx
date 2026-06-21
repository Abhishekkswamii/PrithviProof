import React from "react";
import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="bg-forest-950 text-white/70 py-10">
      <div className="max-w-content mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold mb-3">
              <Leaf size={18} className="text-green-500" aria-hidden="true" />
              PrithviProof
            </div>
            <p className="text-sm leading-relaxed">
              Evidence-aware personal carbon auditing for honest estimates and verified reductions.
            </p>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/auth/sign-up" className="hover:text-white">Start My Audit</Link></li>
              <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
              <li><a href="#why-different" className="hover:text-white">Why It Is Different</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#methodology" className="hover:text-white">Methodology</a></li>
              <li><a href="#privacy" className="hover:text-white">Privacy</a></li>
              <li>
                <a href="https://github.com" className="hover:text-white" rel="noopener noreferrer" target="_blank">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-3">Disclaimer</h3>
            <p className="text-sm leading-relaxed">
              Emissions estimates are model-based approximations, not certified measurements. Built for educational and competition demonstration purposes.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-xs text-center sm:text-left">
          &copy; 2026 PrithviProof. Open methodology.
        </div>
      </div>
    </footer>
  );
}
