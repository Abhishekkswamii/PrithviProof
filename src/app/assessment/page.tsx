"use client";

import React, { useState } from "react";
import { useStore } from "@/data/store";
import { selectNextQuestion, defaultQuestions } from "@/domain/adaptive";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Activity } from "@/domain/models";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function Assessment() {
  const { isInitialized, answeredQuestionIds, uncertaintyContributions, activities, markQuestionAnswered, addActivity } = useStore();
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  if (!isInitialized) return <div className="p-8 text-center" aria-live="polite">Loading assessment...</div>;

  const nextQuestion = selectNextQuestion(defaultQuestions, answeredQuestionIds, uncertaintyContributions, activities);
  
  // Fake progress calculation: since we don't know total questions dynamically, 
  // we just show a growing bar that approaches 100 but never quite hits it until done.
  const progressValue = Math.min(95, (answeredQuestionIds.length / (defaultQuestions.length || 1)) * 100);

  const handleSkip = () => {
    if (nextQuestion) {
      markQuestionAnswered(nextQuestion.id);
      setInputValue("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextQuestion || !inputValue) return;

    if (nextQuestion.type === "number") {
      const val = parseFloat(inputValue);
      if (isNaN(val)) return;
      
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        categoryId: nextQuestion.categoryId,
        factorId: nextQuestion.factorId || "unknown",
        value: val,
        unit: (nextQuestion.unit || "kg") as Activity["unit"],
        dataQualityScore: 50, // User input via form
      };
      addActivity(newActivity);
    } else if (nextQuestion.type === "choice") {
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        categoryId: nextQuestion.categoryId,
        factorId: inputValue, // Options store factorId as value
        value: 1, // Base value for diet/choice
        unit: "kg" as Activity["unit"],
        dataQualityScore: 50,
      };
      addActivity(newActivity);
    }

    markQuestionAnswered(nextQuestion.id);
    setInputValue("");
  };

  if (!nextQuestion) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-8 text-center">
        <CheckCircle2 size={64} className="text-forest-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Assessment Complete</h1>
        <p className="text-charcoal-600 mb-8">We&apos;ve gathered enough data to provide confident recommendations.</p>
        <Button onClick={() => router.push("/recommendations")} className="w-full sm:w-auto bg-teal-600">
          View Recommendations
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-charcoal-500 hover:text-charcoal-900 focus-visible:ring-2 focus-visible:ring-teal-500 rounded p-1">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-xs font-medium text-charcoal-500">
          <span>Information Gathering</span>
          <span>Adaptive</span>
        </div>
        <Progress value={progressValue} aria-label="Assessment Progress" />
      </div>

      <Card>
        <CardHeader>
          <div className="inline-block bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-1 rounded w-max mb-2">
            Targeting: {nextQuestion.categoryId.toUpperCase()}
          </div>
          <CardTitle className="text-2xl leading-relaxed">{nextQuestion.text}</CardTitle>
          <p className="text-sm text-charcoal-500 mt-2">
            Why we ask: This reduces uncertainty in your {nextQuestion.categoryId} emissions estimate.
          </p>
        </CardHeader>
        <CardContent>
          <form id="assessment-form" onSubmit={handleSubmit} className="space-y-6 pt-4">
            {nextQuestion.type === "number" && (
              <div className="space-y-2">
                <label htmlFor="q-input" className="sr-only">Your Answer</label>
                <div className="relative">
                  <Input 
                    id="q-input"
                    type="number" 
                    step="any"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Enter value..."
                    className="text-lg py-6 pr-16"
                    required
                    autoFocus
                  />
                  {nextQuestion.unit && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400 font-medium">
                      {nextQuestion.unit}
                    </span>
                  )}
                </div>
              </div>
            )}

            {nextQuestion.type === "choice" && nextQuestion.options && (
              <div className="grid grid-cols-1 gap-3">
                {nextQuestion.options.map((opt) => (
                  <label 
                    key={opt.value} 
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${inputValue === opt.value ? 'border-teal-600 bg-teal-50' : 'border-charcoal-200 hover:bg-charcoal-50'}`}
                  >
                    <input 
                      type="radio" 
                      name="q-choice" 
                      value={opt.value}
                      checked={inputValue === opt.value}
                      onChange={e => setInputValue(e.target.value)}
                      className="sr-only"
                    />
                    <span className="font-medium text-charcoal-800">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-charcoal-100 pt-6">
          <Button type="button" onClick={handleSkip} className="text-charcoal-500 hover:text-charcoal-900 bg-transparent hover:bg-charcoal-100 shadow-none">
            Skip Question
          </Button>
          <Button type="submit" form="assessment-form" disabled={!inputValue} className="bg-charcoal-900">
            Submit Answer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
