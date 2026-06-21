import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
//} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Dashboard from "../../src/pages/(app)/dashboard/page";

vi.mock("@/data/store", () => ({
  useStore: () => ({
    isInitialized: true,
    storeError: null,

    categoryTotals: {
      transport: { central: 10, low: 8, high: 12 },
      energy: { central: 20, low: 18, high: 22 }
    },
    uncertaintyContributions: [
      { activityId: "act-1", percentageOfTotal: 50, variance: 1 }
    ],
    estimates: [
      { activityId: "act-1", central: 10, low: 8, high: 12 }
    ],
    activities: [
      { id: "act-1", categoryId: "transport", factorId: "f-scooter-gas", value: 100, unit: "km", dataQualityScore: 80 }
    ],
    ledger: [],
    recommendations: [],
    constraints: { budgetAvailable: 50000, housingType: "shared", ownership: "rent", hasCar: false },
  })
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/dashboard"
}));

describe("Dashboard Component", () => {
  it("renders total estimated emissions correctly", () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText("30.0")).toBeInTheDocument();
  });


  it("renders accessible chart data table in disclosure", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    const disclosure = screen.getByRole("button", { name: /View chart data/i });
    await user.click(disclosure);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByText("Transport").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Energy").length).toBeGreaterThan(0);
  });

  it("renders uncertainty range", () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/26\.0–34\.0/)).toBeInTheDocument();
  });
});
