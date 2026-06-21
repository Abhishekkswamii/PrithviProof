import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Assessment from "../../src/app/assessment/page";

const mockMarkQuestionAnswered = vi.fn();
const mockAddActivity = vi.fn();

// Mock useRouter
vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() })
}));

// Mock the store hook with an unanswered question
vi.mock("@/data/store", () => ({
  useStore: () => ({
    isInitialized: true,
    answeredQuestionIds: [],
    uncertaintyContributions: [],
    activities: [],
    markQuestionAnswered: mockMarkQuestionAnswered,
    addActivity: mockAddActivity
  })
}));

describe("Assessment Component", () => {
  it("renders the first question from defaultQuestions", () => {
    render(<Assessment />);
    // Assuming defaultQuestions[1] is "What best describes your diet?"
    expect(screen.getByText(/What best describes your diet/i)).toBeInTheDocument();
  });

  it("submits answer and updates store", async () => {
    const user = userEvent.setup();
    render(<Assessment />);
    
    // Find input (radio button)
    const label = screen.getByText(/Plant-based/i);
    await user.click(label);
    
    // Submit
    const submitBtn = screen.getByRole("button", { name: /Submit Answer/i });
    await user.click(submitBtn);

    expect(mockAddActivity).toHaveBeenCalled();
    expect(mockMarkQuestionAnswered).toHaveBeenCalled();
  });

  it("skip button calls markQuestionAnswered without adding activity", async () => {
    const user = userEvent.setup();
    render(<Assessment />);
    
    mockAddActivity.mockClear();
    mockMarkQuestionAnswered.mockClear();

    const skipBtn = screen.getByRole("button", { name: /Skip Question/i });
    await user.click(skipBtn);

    expect(mockAddActivity).not.toHaveBeenCalled();
    expect(mockMarkQuestionAnswered).toHaveBeenCalled();
  });
});
