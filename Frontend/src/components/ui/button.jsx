import * as React from "react"
import { cn } from "@/lib/utils"

const buttonVariants = {
  default: "bg-orange-500 text-zinc-950 font-medium hover:bg-orange-400 active:bg-orange-600 shadow-sm",
  primary: "bg-orange-500 text-zinc-950 font-medium hover:bg-orange-400 active:bg-orange-600 shadow-sm",
  secondary: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-800 border border-zinc-700/60",
  outline: "border border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-800/80 hover:text-zinc-50 active:bg-zinc-800",
  ghost: "text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100 active:bg-zinc-800",
  destructive: "bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/40 active:bg-red-950/60",
  subtle: "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 border border-zinc-800/80",
}

const buttonSizes = {
  sm: "h-8 px-2.5 text-xs rounded",
  default: "h-9 px-3.5 text-xs sm:text-sm rounded-md",
  lg: "h-11 px-5 text-sm sm:text-base rounded-md",
  icon: "h-9 w-9 rounded-md p-0 flex items-center justify-center",
  iconSm: "h-7 w-7 rounded p-0 flex items-center justify-center",
}

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", disabled, type = "button", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 select-none whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 disabled:pointer-events-none disabled:opacity-40 cursor-pointer font-sans",
          buttonVariants[variant] || buttonVariants.default,
          buttonSizes[size] || buttonSizes.default,
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
