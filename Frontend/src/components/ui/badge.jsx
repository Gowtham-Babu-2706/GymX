import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = {
  default: "bg-zinc-800 text-zinc-300 border-zinc-700/50",
  secondary: "bg-zinc-900 text-zinc-400 border-zinc-800",
  outline: "bg-transparent text-zinc-400 border-zinc-800",
  accent: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  danger: "bg-red-500/10 text-red-400 border-red-500/30",
}

export function Badge({ className, variant = "default", children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono tracking-tight uppercase border transition-colors",
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
