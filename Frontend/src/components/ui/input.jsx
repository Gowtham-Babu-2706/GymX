import * as React from "react"
import { cn } from "@/lib/utils"

export const Input = React.forwardRef(
  ({ className, type = "text", autoSelect = false, onFocus, ...props }, ref) => {
    const handleFocus = (e) => {
      if (autoSelect) {
        e.target.select()
      }
      if (onFocus) {
        onFocus(e)
      }
    }

    return (
      <input
        type={type}
        ref={ref}
        onFocus={handleFocus}
        className={cn(
          "flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/90 px-3 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus-visible:outline-none focus-visible:border-orange-500/80 focus-visible:ring-1 focus-visible:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"
