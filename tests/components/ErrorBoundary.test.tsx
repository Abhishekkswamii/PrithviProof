import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RouteErrorBoundary } from "@/components/ErrorBoundary";
import { isRouteErrorResponse } from "react-router-dom";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useRouteError: vi.fn(),
  isRouteErrorResponse: vi.fn()
}));

import { useRouteError } from "react-router-dom";

describe("RouteErrorBoundary", () => {
  it("renders generic error message when error is an instance of Error", () => {
    vi.mocked(useRouteError).mockReturnValue(new Error("Test error message"));
    vi.mocked(isRouteErrorResponse).mockReturnValue(false);

    render(<RouteErrorBoundary />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("renders specific router error when it is a RouteErrorResponse", () => {
    vi.mocked(useRouteError).mockReturnValue({
      status: 404,
      statusText: "Not Found",
      data: { message: "Page not found" }
    });
    vi.mocked(isRouteErrorResponse).mockReturnValue(true);

    render(<RouteErrorBoundary />);

    expect(screen.getByText("404 - Not Found")).toBeInTheDocument();
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });

  it("renders fallback message for unknown error types", () => {
    vi.mocked(useRouteError).mockReturnValue("Some string error");
    vi.mocked(isRouteErrorResponse).mockReturnValue(false);

    render(<RouteErrorBoundary />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("An unexpected error occurred.")).toBeInTheDocument();
  });
});
