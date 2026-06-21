import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Dashboard from "../../src/app/dashboard/page";

// Mock the store hook
vi.mock("@/data/store", () => ({
  useStore: () => ({
    isInitialized: true,
    categoryTotals: {
      transport: { central: 10, low: 8, high: 12 },
      energy: { central: 20, low: 18, high: 22 }
    },
    uncertaintyContributions: [
      { activityId: "act-1", percentageOfTotal: 50 }
    ],
    estimates: [
      { activityId: "act-1", central: 10, low: 8, high: 12 }
    ]
  })
}));

// Mock Next.js Link and Router
vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() })
}));

describe("Dashboard Component", () => {
  it("renders total estimated emissions correctly", () => {
    render(<Dashboard />);
    // Total should be 30.0 (10 + 20)
    expect(screen.getByText("30.0")).toBeInTheDocument();
  });

  it("displays top uncertainty contributor and Next Best Action", () => {
    render(<Dashboard />);
    expect(screen.getByText(/The biggest contributor is activity/i)).toBeInTheDocument();
    expect(screen.getByText(/act-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Clarify Uncertainty/i)).toBeInTheDocument();
  });

  it("renders accessible chart fallback table", () => {
    render(<Dashboard />);
    // Screen readers should see the table
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByText("Transport").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Energy").length).toBeGreaterThan(0);
  });
});
