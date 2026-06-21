
import React from "react";
import { cn } from "@/lib/utils";
import { Disclosure } from "@/components/ui/disclosure";

export interface ChartDataPoint {
  label: string;
  value: number;
  low?: number;
  high?: number;
  colorClass?: string;
}

interface AccessibleChartProps {
  data: ChartDataPoint[];
  title: string;
  yAxisLabel: string;
  className?: string;
  maxHeight?: number;
  hideTable?: boolean;
}

export function AccessibleChart({
  data,
  title,
  yAxisLabel,
  className,
  maxHeight = 300,
  hideTable = false,
}: AccessibleChartProps) {
  const maxValue = Math.max(...data.map((d) => d.high ?? d.value), 0.1);
  const chartHeight = Math.min(maxHeight, 300);

  const tableContent = (
    <table className="min-w-full text-sm text-left border border-border">
      <caption className="sr-only">{title} data table</caption>
      <thead className="bg-canvas-subtle text-text-primary">
        <tr>
          <th scope="col" className="px-3 py-2 font-medium">Category</th>
          <th scope="col" className="px-3 py-2 font-medium">Estimate ({yAxisLabel})</th>
          <th scope="col" className="px-3 py-2 font-medium">Lower</th>
          <th scope="col" className="px-3 py-2 font-medium">Upper</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d, i) => (
          <tr key={i} className="border-t border-border">
            <td className="px-3 py-2 font-medium">{d.label}</td>
            <td className="px-3 py-2 tabular-nums">{d.value.toFixed(1)}</td>
            <td className="px-3 py-2 tabular-nums">{d.low !== undefined ? d.low.toFixed(1) : d.value.toFixed(1)}</td>
            <td className="px-3 py-2 tabular-nums">{d.high !== undefined ? d.high.toFixed(1) : d.value.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className={cn(className)}>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-secondary mb-3" id={`${title}-desc`}>
        Bar chart showing estimated {yAxisLabel} by category with uncertainty ranges.
      </p>

      <div
        className="flex items-end gap-3 border-b border-l border-border pl-2 pb-2"
        style={{ height: chartHeight }}
        role="img"
        aria-labelledby={`${title}-desc`}
        aria-describedby={`${title}-legend`}
      >
        {data.map((d, i) => {
          const heightPercent = Math.max(4, (d.value / maxValue) * 100);
          const lowPercent = d.low !== undefined ? Math.max(0, (d.low / maxValue) * 100) : heightPercent;
          const highPercent = d.high !== undefined ? Math.max(0, (d.high / maxValue) * 100) : heightPercent;

          return (
            <div key={i} className="group relative flex flex-1 flex-col justify-end items-center h-full min-w-0">
              {(d.low !== undefined && d.high !== undefined) && (
                <div
                  className="absolute w-1 bg-amber/40 z-0"
                  style={{ height: `${highPercent - lowPercent}%`, bottom: `${lowPercent}%` }}
                  aria-hidden="true"
                />
              )}
              <div
                className={cn("w-full max-w-[36px] rounded-t-sm z-10", d.colorClass || "bg-teal")}
                style={{ height: `${heightPercent}%` }}
                aria-hidden="true"
              />
              <span className="absolute -bottom-6 text-[11px] text-text-secondary truncate w-full text-center">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>

      <div id={`${title}-legend`} className="flex flex-wrap gap-3 mt-8 text-xs text-text-secondary">
        {data.map((d, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className={cn("w-2.5 h-2.5 rounded-sm", d.colorClass || "bg-teal")} aria-hidden="true" />
            {d.label}
          </span>
        ))}
      </div>

      {!hideTable && (
        <div className="mt-4">
          <Disclosure title="View chart data">
            <div className="overflow-x-auto mt-2">{tableContent}</div>
          </Disclosure>
        </div>
      )}
    </div>
  );
}

export function ChartDataTable({ data, title, yAxisLabel }: Pick<AccessibleChartProps, "data" | "title" | "yAxisLabel">) {
  return (
    <Disclosure title="View chart data">
      <div className="overflow-x-auto mt-2">
        <table className="min-w-full text-sm text-left border border-border">
          <caption className="sr-only">{title} data table</caption>
          <thead className="bg-canvas-subtle text-text-primary">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">Category</th>
              <th scope="col" className="px-3 py-2 font-medium">Estimate ({yAxisLabel})</th>
              <th scope="col" className="px-3 py-2 font-medium">Lower</th>
              <th scope="col" className="px-3 py-2 font-medium">Upper</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{d.label}</td>
                <td className="px-3 py-2 tabular-nums">{d.value.toFixed(1)}</td>
                <td className="px-3 py-2 tabular-nums">{d.low !== undefined ? d.low.toFixed(1) : d.value.toFixed(1)}</td>
                <td className="px-3 py-2 tabular-nums">{d.high !== undefined ? d.high.toFixed(1) : d.value.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Disclosure>
  );
}
