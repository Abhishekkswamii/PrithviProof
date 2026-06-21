import { Activity, ActivityCategory } from "@/domain/models";
import { getFactorById } from "@/domain/factors";

const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  transport: "Transport",
  energy: "Energy",
  food: "Food",
  purchases: "Purchases",
  waste: "Waste",
};

const ACTIVITY_LABELS: Record<string, string> = {
  "act-1": "Scooter commute",
  "act-2": "Shared apartment electricity",
  "act-3": "Food and diet details",
};

const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  transport: "bg-amber",
  energy: "bg-blue",
  food: "bg-green-500",
  purchases: "bg-coral",
  waste: "bg-teal",
};

const CATEGORY_TEXT_COLORS: Record<ActivityCategory, string> = {
  transport: "text-amber",
  energy: "text-blue",
  food: "text-green-700",
  purchases: "text-coral",
  waste: "text-teal",
};

export function getCategoryLabel(category: ActivityCategory | string): string {
  return CATEGORY_LABELS[category as ActivityCategory] ?? category;
}

export function getActivityLabel(activity: Activity): string {
  if (ACTIVITY_LABELS[activity.id]) return ACTIVITY_LABELS[activity.id];
  const factor = getFactorById(activity.factorId);
  if (factor) return factor.name;
  return `${getCategoryLabel(activity.categoryId)} activity`;
}

export function getCategoryColorClass(category: ActivityCategory | string): string {
  return CATEGORY_COLORS[category as ActivityCategory] ?? "bg-green-500";
}

export function getCategoryTextColorClass(category: ActivityCategory | string): string {
  return CATEGORY_TEXT_COLORS[category as ActivityCategory] ?? "text-green-700";
}

export function getHousingLabel(type: string): string {
  const map: Record<string, string> = {
    apartment: "apartment",
    house: "house",
    shared: "shared accommodation",
  };
  return map[type] ?? type;
}

export function getOwnershipLabel(ownership: string): string {
  return ownership === "rent" ? "renter" : "homeowner";
}
