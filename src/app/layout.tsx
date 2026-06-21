import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased min-h-screen bg-charcoal-50 text-charcoal-950">
        {/* Navigation could go here */}
        {children}
      </body>
    </html>
  );
}
