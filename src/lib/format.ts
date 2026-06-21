/** Format emission values consistently for display */
export function formatEmissions(value: number, perMonth = false): string {
  const suffix = perMonth ? " kg CO₂e/month" : " kg CO₂e";
  return `${value.toFixed(1)}${suffix}`;
}

export function formatEmissionsRange(low: number, high: number): string {
  return `${low.toFixed(1)}–${high.toFixed(1)} kg CO₂e`;
}
