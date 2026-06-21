"use client";

import * as React from "react"
import { ChevronDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface DisclosureProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function Disclosure({ title, children, className, defaultOpen = false }: DisclosureProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn("border border-charcoal-200 rounded-md bg-charcoal-50", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-charcoal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <Info size={16} className="text-teal-600" />
          {title}
        </span>
        <ChevronDown
          size={18}
          className={cn("text-charcoal-500 transition-transform duration-200", isOpen ? "rotate-180" : "")}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 text-sm text-charcoal-700">
          {children}
        </div>
      )}
    </div>
  )
}
