import { Activity, AdaptiveQuestion, UncertaintyContribution } from "./models";


export function selectNextQuestion(
  availableQuestions: AdaptiveQuestion[],
  answeredQuestionIds: string[],
  contributions: UncertaintyContribution[],
  activities: Activity[]
): AdaptiveQuestion | null {
  const unanswered = availableQuestions.filter(q => !answeredQuestionIds.includes(q.id));
  if (unanswered.length === 0) return null;

  // 1. If there's high uncertainty, pick a question targeting that category/factor
  if (contributions.length > 0 && contributions[0].percentageOfTotal > 20) {
    const highestUncertaintyActivityId = contributions[0].activityId;
    const activity = activities.find(a => a.id === highestUncertaintyActivityId);
    
    if (activity) {
      // Find a question related to this factor or category with high info gain
      const targetedQuestions = unanswered.filter(
        q => q.factorId === activity.factorId || q.categoryId === activity.categoryId
      );
      
      if (targetedQuestions.length > 0) {
        return targetedQuestions.sort((a, b) => b.informationGainPotential - a.informationGainPotential)[0];
      }
    }
  }

  // 2. Otherwise, fall back to the highest information gain potential overall
  return unanswered.sort((a, b) => b.informationGainPotential - a.informationGainPotential)[0];
}

// Generate some sample questions matching factors
export const defaultQuestions: AdaptiveQuestion[] = [
  {
    id: "q-flight",
    categoryId: "transport",
    factorId: "f-flight-short",
    text: "How many short-haul flights did you take this year?",
    type: "number",
    informationGainPotential: 80,
  },
  {
    id: "q-diet",
    categoryId: "food",
    text: "What best describes your diet?",
    type: "choice",
    options: [
      { label: "Heavy Meat", value: "f-beef" },
      { label: "Plant-based", value: "f-plant-based" }
    ],
    informationGainPotential: 90,
  },
  {
    id: "q-grid",
    categoryId: "energy",
    factorId: "f-grid-us-avg",
    text: "What is your average monthly electricity bill in USD?",
    type: "number",
    unit: "USD", // Requires a conversion heuristic later, but acceptable for adaptive flow
    informationGainPotential: 60,
  }
];
