import * as React from "react"
import { cn } from "@/lib/utils"

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-md border border-zinc-800/90 bg-[#111114] text-zinc-100",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-4 sm:p-5 border-b border-zinc-800/60", className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn("text-sm sm:text-base font-medium tracking-tight text-zinc-100", className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-xs text-zinc-400", className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-4 sm:p-5", className)} {...props} />
}

export function CardFooter({ className, ...props }) {
  return (
    <div
      className={cn("flex items-center p-4 sm:p-5 pt-0 border-t border-zinc-800/60 mt-4", className)}
      {...props}
    />
  )
}
