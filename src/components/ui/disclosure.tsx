
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
    <div className={cn("border border-border rounded-card bg-canvas-subtle", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-text-primary min-h-touch rounded-card"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <Info size={16} className="text-forest-700" aria-hidden="true" />
          {title}
        </span>
        <ChevronDown
          size={18}
          className={cn("text-text-secondary transition-transform duration-200", isOpen ? "rotate-180" : "")}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-0 text-sm text-text-secondary border-t border-border">
          {children}
        </div>
      )}
    </div>
  )
}
