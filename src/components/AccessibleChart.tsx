import React from "react";
import { cn } from "@/lib/utils";

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
}

export function AccessibleChart({ data, title, yAxisLabel, className }: AccessibleChartProps) {
  const maxValue = Math.max(...data.map(d => d.high ?? d.value), 0.1); // Avoid div by zero

  return (
    <div className={cn("my-6", className)}>
      <h3 className="sr-only">{title}</h3>
      
      {/* Visual Chart - aria-hidden to avoid double reading since table is below */}
      <div className="flex h-64 items-end gap-2 border-b border-l border-charcoal-300 pl-2 pb-2 mt-4" aria-hidden="true">
        {data.map((d, i) => {
          const heightPercent = Math.max(0, (d.value / maxValue) * 100);
          const lowPercent = d.low !== undefined ? Math.max(0, (d.low / maxValue) * 100) : heightPercent;
          const highPercent = d.high !== undefined ? Math.max(0, (d.high / maxValue) * 100) : heightPercent;
          
          return (
            <div key={i} className="group relative flex flex-1 flex-col justify-end items-center h-full">
              {/* Uncertainty Bar */}
              {(d.low !== undefined && d.high !== undefined) && (
                <div 
                  className="absolute w-1 bg-amber-500/50 z-0"
                  style={{ 
                    height: `${highPercent - lowPercent}%`, 
                    bottom: `${lowPercent}%` 
                  }}
                />
              )}
              {/* Central Value Bar */}
              <div 
                className={cn("w-full max-w-[40px] rounded-t-sm z-10 transition-all group-hover:opacity-80", d.colorClass || "bg-teal-600")}
                style={{ height: `${heightPercent}%` }}
              />
              <span className="absolute -bottom-6 text-xs text-charcoal-600 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                {d.label}
              </span>
              
              {/* Tooltip on hover */}
              <div className="absolute -top-10 hidden group-hover:block bg-charcoal-900 text-white text-xs p-1 rounded whitespace-nowrap z-20">
                {d.value.toFixed(1)} {yAxisLabel}
                {(d.low !== undefined && d.high !== undefined) && (
                   ` (±${((d.high - d.value)).toFixed(1)})`
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Accessible Table Fallback */}
      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-charcoal-200">
          <caption className="sr-only">{title} Data Table</caption>
          <thead className="bg-charcoal-100 text-charcoal-800">
            <tr>
              <th scope="col" className="px-4 py-2">Category</th>
              <th scope="col" className="px-4 py-2">Estimated {yAxisLabel}</th>
              <th scope="col" className="px-4 py-2">Lower Bound</th>
              <th scope="col" className="px-4 py-2">Upper Bound</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-b border-charcoal-100">
                <td className="px-4 py-2 font-medium">{d.label}</td>
                <td className="px-4 py-2">{d.value.toFixed(2)}</td>
                <td className="px-4 py-2">{d.low !== undefined ? d.low.toFixed(2) : d.value.toFixed(2)}</td>
                <td className="px-4 py-2">{d.high !== undefined ? d.high.toFixed(2) : d.value.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
