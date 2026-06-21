import * as React from "react"
import { cn } from "@/lib/utils"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-card text-sm font-medium transition-colors",
          "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          "bg-forest-700 text-white hover:bg-forest-900 min-h-touch h-11 px-4 shadow-card",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
