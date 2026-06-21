import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
//} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Assessment from "../../src/pages/(app)/assessment/page";

const mockMarkQuestionAnswered = vi.fn();
const mockAddActivity = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() })
}));

vi.mock("@/data/store", () => ({
  useStore: () => ({
    isInitialized: true,
    storeError: null,
    answeredQuestionIds: [],
    uncertaintyContributions: [],
    activities: [],
    markQuestionAnswered: mockMarkQuestionAnswered,
    addActivity: mockAddActivity
  })
}));

describe("Assessment Component", () => {
  it("renders a question from defaultQuestions", () => {
    render(<MemoryRouter><Assessment /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: /What best describes your diet/i })).toBeInTheDocument();
  });

  it("submits answer and updates store", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Assessment /></MemoryRouter>);

    const label = screen.getByText(/Plant-based/i);
    await user.click(label);

    const submitBtn = screen.getByRole("button", { name: /Continue/i });
    await user.click(submitBtn);

    expect(mockAddActivity).toHaveBeenCalled();
    expect(mockMarkQuestionAnswered).toHaveBeenCalled();
  });

  it("skip button calls markQuestionAnswered without adding activity", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Assessment /></MemoryRouter>);

    mockAddActivity.mockClear();
    mockMarkQuestionAnswered.mockClear();

    const skipBtn = screen.getByRole("button", { name: /^Skip$/i });
    await user.click(skipBtn);

    expect(mockAddActivity).not.toHaveBeenCalled();
    expect(mockMarkQuestionAnswered).toHaveBeenCalled();
  });
});
