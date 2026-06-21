
import React, { useState } from "react";
import { useStore } from "@/data/store";
import { selectNextQuestion, defaultQuestions } from "@/domain/adaptive";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Activity } from "@/domain/models";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { getCategoryLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";

export default function Assessment() {
  const { isInitialized, answeredQuestionIds, uncertaintyContributions, activities, markQuestionAnswered, addActivity } = useStore();
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!isInitialized) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <div className="animate-pulse h-6 w-48 bg-canvas-subtle rounded mx-auto" aria-hidden="true" />
      </div>
    );
  }

  const nextQuestion = selectNextQuestion(defaultQuestions, answeredQuestionIds, uncertaintyContributions, activities);
  const answeredCount = answeredQuestionIds.length;
  const progressValue = Math.min(90, 20 + answeredCount * 25);

  const handleSkip = () => {
    if (nextQuestion) {
      markQuestionAnswered(nextQuestion.id);
      setInputValue("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextQuestion || !inputValue || isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (nextQuestion.type === "number") {
        const val = parseFloat(inputValue);
        if (isNaN(val)) return;

        const newActivity: Activity = {
          id: `act-${Date.now()}`,
          categoryId: nextQuestion.categoryId,
          factorId: nextQuestion.factorId || "unknown",
          value: val,
          unit: (nextQuestion.unit || "kg") as Activity["unit"],
          dataQualityScore: 50,
        };
        addActivity(newActivity);
      } else if (nextQuestion.type === "choice") {
        const newActivity: Activity = {
          id: `act-${Date.now()}`,
          categoryId: nextQuestion.categoryId,
          factorId: inputValue,
          value: 1,
          unit: "kg" as Activity["unit"],
          dataQualityScore: 50,
        };
        addActivity(newActivity);
      }

      markQuestionAnswered(nextQuestion.id);
      setInputValue("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!nextQuestion) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" aria-hidden="true" />
        <h1 className="text-xl font-bold text-text-primary mb-2">Assessment complete</h1>
        <p className="text-sm text-text-secondary mb-6">We have enough data to provide confident recommendations.</p>
        <Button onClick={() => navigate("/recommendations")}>View Recommendations</Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6">
      <div className="mb-5 space-y-2">
        <div className="flex justify-between text-xs font-medium text-text-secondary">
          <span>Question {answeredCount + 1} answered · {answeredCount} completed</span>
          <span>Estimate confidence improving</span>
        </div>
        <Progress value={progressValue} aria-label="Estimate confidence improving" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <span className="inline-block bg-surface-green text-forest-700 text-xs font-semibold px-2 py-1 rounded-card w-max mb-2 border border-green-100">
            {getCategoryLabel(nextQuestion.categoryId)}
          </span>
          <CardTitle className="text-lg leading-snug">{nextQuestion.text}</CardTitle>
          <p className="text-sm text-text-secondary mt-2">
            <span className="font-medium text-text-primary">Why we ask:</span> This reduces uncertainty in your {getCategoryLabel(nextQuestion.categoryId).toLowerCase()} emissions estimate.
          </p>
        </CardHeader>
        <CardContent>
          <form id="assessment-form" onSubmit={handleSubmit} className="space-y-4">
            {nextQuestion.type === "number" && (
              <div className="space-y-2">
                <label htmlFor="q-input" className="block text-sm font-medium text-text-primary">Your answer</label>
                <div className="relative">
                  <Input
                    id="q-input"
                    type="number"
                    step="any"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter value"
                    className="pr-16"
                    required
                    autoFocus
                  />
                  {nextQuestion.unit && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-medium">
                      {nextQuestion.unit}
                    </span>
                  )}
                </div>
              </div>
            )}

            {nextQuestion.type === "choice" && nextQuestion.options && (
              <fieldset>
                <legend className="sr-only">{nextQuestion.text}</legend>
                <div className="grid grid-cols-1 gap-2">
                  {nextQuestion.options.map((opt) => (
                    <label
                      key={String(opt.value)}
                      className={cn(
                        "flex items-center p-3 border rounded-card cursor-pointer transition-colors min-h-touch",
                        inputValue === String(opt.value)
                          ? "border-forest-700 bg-surface-green"
                          : "border-border hover:bg-canvas-subtle"
                      )}
                    >
                      <input
                        type="radio"
                        name="q-choice"
                        value={String(opt.value)}
                        checked={inputValue === String(opt.value)}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-medium text-text-primary text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-border pt-4 gap-2">
          <Button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-surface text-text-secondary border border-border hover:bg-canvas-subtle shadow-none h-11"
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleSkip}
              className="bg-surface text-text-secondary border border-border hover:bg-canvas-subtle shadow-none h-11"
            >
              Skip
            </Button>
            <Button
              type="submit"
              form="assessment-form"
              disabled={!inputValue || isSubmitting}
              className="h-11"
            >
              {isSubmitting ? "Saving…" : "Continue"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
