import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { workoutsApi } from '@/api/workouts'
import { 
  History, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Plus, 
  Search,
  Dumbbell,
  Download,
  BarChart2
} from 'lucide-react'

export function WorkoutHistory() {
  const { workouts, personalRecords, refreshWorkouts } = useApp()

  const [search, setSearch] = useState('')
  const [expandedWorkoutId, setExpandedWorkoutId] = useState(null)

  // Filter workouts by title or exercise
  const filteredWorkouts = workouts.filter((w) => {
    if (!search) return true
    const q = search.toLowerCase()
    const titleMatch = w.title?.toLowerCase().includes(q)
    const exerciseMatch = w.exercises?.some(e => e.name?.toLowerCase().includes(q))
    return titleMatch || exerciseMatch
  })

  const toggleExpand = (id) => {
    setExpandedWorkoutId(prev => prev === id ? null : id)
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (window.confirm('Delete this workout session from your logbook?')) {
      workoutsApi.deleteWorkout(id)
      refreshWorkouts()
    }
  }

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workouts, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `gymx_training_log_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // PR list entries
  const prList = Object.entries(personalRecords || {})

  // Compute Volume Trend for the last 6 workouts
  const recentWorkoutsChronological = [...workouts].reverse().slice(-6)
  const maxVolumeInRecent = Math.max(...recentWorkoutsChronological.map(w => w.totalVolumeKg || 0), 1000)

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
            <History className="w-3.5 h-3.5 text-orange-400" />
            <span>Archive</span>
            <span>•</span>
            <span className="text-zinc-300 font-semibold">{workouts.length} Sessions Logged</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100 m-0">
            Training History & Progression
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Chronological audit log of completed sessions, volume loads, and benchmark records.
          </p>
        </div>

        {/* Data Tools */}
        <div className="flex items-center gap-2">
          {workouts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="text-xs border-zinc-800 text-zinc-300 hover:bg-zinc-800 h-8 gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              Export JSON
            </Button>
          )}

          <Link to="/log">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs h-8 gap-1">
              <Plus className="w-3.5 h-3.5" />
              Log Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* Real Progress Telemetry / Volume Chart (Only shown if data exists) */}
      {recentWorkoutsChronological.length > 1 && (
        <div className="rounded-md border border-zinc-800/90 bg-[#111114] p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-medium text-zinc-100 m-0 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-orange-400" />
                Session Volume Progression (kg)
              </h2>
              <span className="text-xs text-zinc-400">Total tonnage moved per session over recent training cycles</span>
            </div>
            <div className="font-mono text-xs text-zinc-400 hidden sm:block">
              Peak: {Math.max(...recentWorkoutsChronological.map(w => w.totalVolumeKg || 0)).toLocaleString()} kg
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-2 pb-1">
            <div className="h-32 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {recentWorkoutsChronological.map((w, idx) => {
                const vol = w.totalVolumeKg || 0
                const heightPct = Math.max(12, Math.round((vol / maxVolumeInRecent) * 100))
                const dateLabel = new Date(w.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="font-mono text-[10px] text-zinc-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                      {vol.toLocaleString()}kg
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[48px] rounded-t bg-orange-500/80 group-hover:bg-orange-400 transition-colors border-t border-x border-orange-400/30"
                    />
                    <span className="font-mono text-[10px] text-zinc-400 mt-2 truncate max-w-full">
                      {dateLabel}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* PR Ledger Grid */}
      {prList.length > 0 && (
        <div className="rounded-md border border-zinc-800/90 bg-[#111114] p-4 sm:p-5">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3 mb-3">
            <div>
              <h2 className="text-sm font-medium text-zinc-100 m-0 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Verified Personal Records (PRs)
              </h2>
              <span className="text-xs text-zinc-400">All-time top weights and estimated 1-Rep Maximums</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">{prList.length} TRACKED</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {prList.map(([exName, record], idx) => (
              <div key={idx} className="p-3 rounded border border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-medium text-zinc-200 truncate">{exName}</div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                    Est. 1RM: <span className="text-zinc-200">{record.est1RM} kg</span>
                  </div>
                </div>
                <div className="text-right font-mono shrink-0">
                  <div className="text-sm font-bold text-orange-400 tabular-nums">
                    {record.maxWeight} <span className="text-xs text-zinc-400 font-normal">kg</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    × {record.maxRepsAtMaxWeight} reps
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="p-3 rounded-md border border-zinc-800/90 bg-[#111114]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search workouts by name or movement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900/90 text-sm"
          />
        </div>
      </div>

      {/* Workouts Feed */}
      <div className="space-y-3">
        {filteredWorkouts.map((workout) => {
          const isExpanded = expandedWorkoutId === workout.id
          const dateStr = new Date(workout.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
          const mins = Math.round((workout.durationSeconds || 1800) / 60)

          return (
            <div
              key={workout.id}
              className="rounded-md border border-zinc-800/90 bg-[#111114] overflow-hidden transition-colors"
            >
              {/* Header row */}
              <div
                onClick={() => toggleExpand(workout.id)}
                className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-800/30 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-semibold text-zinc-100 truncate">
                      {workout.title}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                      {dateStr}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1 truncate">
                    {workout.exercises?.map(e => e.name).join(' • ') || 'No exercises logged'}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right font-mono">
                    <div className="text-sm sm:text-base font-semibold text-orange-400 tabular-nums">
                      {(workout.totalVolumeKg || 0).toLocaleString()} kg
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {mins}m • {workout.exercises?.length || 0} moves
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(workout.id, e)}
                    className="text-zinc-600 hover:text-red-400 p-1.5 rounded transition-colors cursor-pointer"
                    title="Delete workout"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="text-zinc-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Set-by-Set Breakdown */}
              {isExpanded && (
                <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/30 space-y-4">
                  {workout.notes && (
                    <div className="p-3 rounded bg-zinc-900/80 border border-zinc-800/60 text-xs text-zinc-300 italic">
                      "{workout.notes}"
                    </div>
                  )}

                  <div className="space-y-3">
                    {workout.exercises?.map((exercise, idx) => (
                      <div key={idx} className="rounded border border-zinc-800/70 bg-zinc-900/50 p-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-zinc-200 mb-2">
                          <div className="flex items-center gap-2">
                            <span>{exercise.name}</span>
                            <Badge variant="outline" className="text-[10px] py-0">{exercise.primaryMuscle}</Badge>
                          </div>
                          <span className="font-mono text-zinc-400 text-[11px]">
                            {exercise.sets?.length} sets
                          </span>
                        </div>

                        {/* Sets list */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {exercise.sets?.map((set, sIdx) => (
                            <div
                              key={sIdx}
                              className={`p-1.5 rounded border text-xs font-mono flex items-center justify-between ${
                                set.completed
                                  ? 'bg-zinc-800/60 border-zinc-700/60 text-zinc-200'
                                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
                              }`}
                            >
                              <span className="text-zinc-400 text-[10px]">Set {set.setNumber}</span>
                              <span className="font-semibold text-zinc-100 tabular-nums">
                                {set.weightKg}kg × {set.reps}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Empty State */}
        {filteredWorkouts.length === 0 && (
          <div className="p-10 text-center rounded-md border border-dashed border-zinc-800 bg-[#111114]">
            <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-zinc-200">No workout records found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
              {search
                ? 'No past sessions match your search query.'
                : 'Your training ledger is empty. Complete a workout session to establish progression analytics.'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Link to="/log">
                <Button size="sm" className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Log First Workout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
