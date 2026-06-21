import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/data/store";
import Link from "next/link";
import { Leaf } from "lucide-react";

export const metadata: Metadata = {
  title: "PrithviProof | Carbon Audit",
  description: "Uncertainty-aware personal carbon audit and action verification assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-charcoal-50 text-charcoal-950 flex flex-col">
        <StoreProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-white focus:z-50">
            Skip to main content
          </a>
          <header className="bg-white border-b border-charcoal-200 sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded p-1">
                <Leaf size={24} className="text-forest-600" />
                PrithviProof
              </Link>
              <nav aria-label="Main Navigation">
                <ul className="flex items-center gap-4 text-sm font-medium">
                  <li><Link href="/dashboard" className="hover:text-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500 p-2 rounded">Dashboard</Link></li>
                  <li><Link href="/assessment" className="hover:text-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500 p-2 rounded">Assessment</Link></li>
                  <li><Link href="/log" className="hover:text-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500 p-2 rounded">Log Data</Link></li>
                  <li><Link href="/recommendations" className="hover:text-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500 p-2 rounded">Actions</Link></li>
                  <li><Link href="/ledger" className="hover:text-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500 p-2 rounded">Ledger</Link></li>
                </ul>
              </nav>
            </div>
          </header>
          <main id="main-content" className="flex-1 w-full">
            {children}
          </main>
          <footer className="bg-charcoal-900 text-charcoal-300 py-6 text-center text-sm">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p>&copy; 2026 PrithviProof. Open Source Methodology.</p>
              <Link href="/methodology" className="hover:text-white focus-visible:ring-2 focus-visible:ring-teal-500 rounded p-1">View Methodology</Link>
            </div>
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
