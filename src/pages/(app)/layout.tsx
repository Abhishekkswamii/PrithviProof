import React, { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/data/store";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileNavigation } from "@/components/MobileNavigation";
import { AuthGuard } from "@/components/auth/AuthGuard";

const AskPrithviLazy = lazy(() => import("@/components/AskPrithvi").then(m => ({ default: m.AskPrithvi })));

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { storeError } = useStore();

  return (
    <AuthGuard>
      <div className="min-h-screen flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col lg:ml-sidebar min-w-0">
          <MobileNavigation />

          {storeError && (
            <div className="bg-surface border-b border-amber/30 px-4 py-2 text-sm text-text-primary text-center" role="alert">
              {storeError}
            </div>
          )}

          <main id="main-content" className="flex-1 w-full pb-20 lg:pb-6">
            {children}
          </main>

          <footer className="hidden lg:block border-t border-border bg-surface py-3 text-center text-xs text-text-secondary">
            <div className="max-w-content mx-auto px-4 flex justify-between items-center">
              <p>&copy; 2026 PrithviProof</p>
              <Link to="/methodology" className="hover:text-forest-700">
                Methodology
              </Link>
            </div>
          </footer>
        </div>
      </div>
      <Suspense fallback={null}>
        <AskPrithviLazy />
      </Suspense>
    </AuthGuard>
  );
}
