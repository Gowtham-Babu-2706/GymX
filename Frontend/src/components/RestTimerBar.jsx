import React from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Timer, Plus, X } from 'lucide-react'

export function RestTimerBar() {
  const { restTimerSeconds, isRestTimerRunning, addRestTime, stopRestTimer } = useApp()

  if (!isRestTimerRunning && restTimerSeconds === 0) {
    return null
  }

  const minutes = Math.floor(restTimerSeconds / 60)
  const seconds = restTimerSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <aside
      aria-label="Rest timer"
      className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-950/95 border border-orange-500/40 rounded-full px-4 py-2 text-zinc-100 shadow-2xl backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <Timer className="w-4 h-4 text-orange-500 animate-pulse" />
        <span className="text-xs uppercase tracking-wider text-zinc-400 font-mono">Rest</span>
        <span className="font-mono text-base font-semibold tabular-nums text-orange-400 min-w-[50px]">
          {formattedTime}
        </span>
      </div>

      <div className="h-4 w-[1px] bg-zinc-800" />

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addRestTime(30)}
          className="h-7 px-2 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-full"
          title="Add 30 seconds"
        >
          <Plus className="w-3.5 h-3.5 mr-0.5 text-orange-400" />
          30s
        </Button>

        <button
          onClick={stopRestTimer}
          className="h-7 w-7 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-full cursor-pointer transition-colors"
          title="Dismiss timer"
          aria-label="Dismiss timer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  )
}
