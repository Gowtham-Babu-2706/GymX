import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { exercisesApi } from '@/api/exercises'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Plus, 
  X, 
  Check,
  Server
} from 'lucide-react'

export function ExerciseLibrary() {
  const navigate = useNavigate()
  const { activeWorkout, startNewWorkout, updateActiveWorkout } = useApp()

  const [exercises, setExercises] = useState([])
  const [catalogSource, setCatalogSource] = useState('catalog')
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [muscleGroup, setMuscleGroup] = useState('ALL')
  const [equipment, setEquipment] = useState('ALL')
  const [difficulty, setDifficulty] = useState('ALL')

  // Selected exercise for detail modal/drawer
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [addedNotice, setAddedNotice] = useState(false)

  // Fetch exercises from API
  const loadExercises = async () => {
    setIsLoading(true)
    try {
      const res = await exercisesApi.getExercises({
        muscleGroup: muscleGroup === 'ALL' ? undefined : muscleGroup,
        equipment: equipment === 'ALL' ? undefined : equipment,
        search: search.trim() || undefined,
      })
      if (res?.data) {
        setExercises(res.data)
        setCatalogSource(res.source)
      }
    } catch (err) {
      console.error('Error fetching exercises:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadExercises()
  }, [muscleGroup, equipment, search])

  // Filter local dataset if difficulty filter is selected
  const displayExercises = exercises.filter((ex) => {
    if (difficulty !== 'ALL' && ex.difficulty !== difficulty) return false
    return true
  })

  // Add exercise to active workout or start new
  const handleAddToWorkout = (exercise) => {
    const exerciseEntry = {
      id: exercise.id,
      name: exercise.name,
      primaryMuscle: exercise.primaryMuscle,
      equipment: exercise.equipment,
      sets: [
        { setNumber: 1, weightKg: 50, reps: 10, completed: false, type: 'normal' },
        { setNumber: 2, weightKg: 50, reps: 10, completed: false, type: 'normal' },
        { setNumber: 3, weightKg: 50, reps: 10, completed: false, type: 'normal' },
      ],
    }

    if (activeWorkout) {
      updateActiveWorkout({
        ...activeWorkout,
        exercises: [...(activeWorkout.exercises || []), exerciseEntry],
      })
    } else {
      startNewWorkout({
        title: `${exercise.primaryMuscle} Focus`,
        exercises: [exerciseEntry],
      })
    }

    setAddedNotice(true)
    setTimeout(() => {
      setAddedNotice(false)
      setSelectedExercise(null)
      navigate('/log')
    }, 700)
  }

  const muscleOptions = [
    'ALL',
    'CHEST',
    'BACK',
    'SHOULDERS',
    'BICEPS',
    'TRICEPS',
    'QUADRICEPS',
    'HAMSTRINGS',
    'GLUTES',
    'CALVES',
    'ABS',
  ]

  const equipmentOptions = [
    'ALL',
    'BARBELL',
    'DUMBBELL',
    'CABLE',
    'MACHINE',
    'BODYWEIGHT',
    'KETTLEBELL',
  ]

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
            <span>Library</span>
            <span>•</span>
            <span className="text-zinc-300 font-semibold">{displayExercises.length} Movements</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-100 m-0">
            Movement Directory
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Verified exercise biomechanics, primary movers, and step-by-step cues.
          </p>
        </div>

        {/* Catalog Source Indicator */}
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] py-1 text-zinc-400 gap-1.5">
            <Server className="w-3 h-3 text-orange-400" />
            <span>API: {catalogSource === 'backend' ? 'PostgreSQL Active' : 'Verified Catalog'}</span>
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-md border border-zinc-800/90 bg-[#111114] space-y-3.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search movements by name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900/90 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Muscle Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-mono text-[11px] uppercase">Muscle:</span>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded px-2 py-1 outline-none focus:border-orange-500 font-mono"
            >
              {muscleOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-mono text-[11px] uppercase">Equipment:</span>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded px-2 py-1 outline-none focus:border-orange-500 font-mono"
            >
              {equipmentOptions.map((eq) => (
                <option key={eq} value={eq}>
                  {eq}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 font-mono text-[11px] uppercase">Tier:</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs rounded px-2 py-1 outline-none focus:border-orange-500 font-mono"
            >
              <option value="ALL">ALL</option>
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
            </select>
          </div>

          {(muscleGroup !== 'ALL' || equipment !== 'ALL' || difficulty !== 'ALL' || search) && (
            <button
              onClick={() => {
                setMuscleGroup('ALL')
                setEquipment('ALL')
                setDifficulty('ALL')
                setSearch('')
              }}
              className="text-[11px] font-mono text-orange-400 hover:text-orange-300 ml-auto cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Compact Table View */}
      <div className="rounded-md border border-zinc-800/90 bg-[#111114] overflow-hidden relative">
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-500/20 overflow-hidden z-10">
            <div className="w-1/3 h-full bg-orange-500 animate-[indeterminate_1.5s_infinite_linear]" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/30 text-[10px] uppercase">
                <th className="py-2.5 px-3 font-semibold">Exercise</th>
                <th className="py-2.5 px-3 font-semibold">Primary Target</th>
                <th className="py-2.5 px-3 font-semibold hidden sm:table-cell">Secondary</th>
                <th className="py-2.5 px-3 font-semibold">Equipment</th>
                <th className="py-2.5 px-3 font-semibold hidden md:table-cell">Tier</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {displayExercises.map((exercise) => (
                <tr
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise)}
                  className="hover:bg-zinc-800/40 transition-colors cursor-pointer text-zinc-300 group"
                >
                  {/* Name */}
                  <td className="py-3 px-3">
                    <div className="font-sans font-medium text-zinc-100 group-hover:text-orange-400 transition-colors">
                      {exercise.name}
                    </div>
                  </td>

                  {/* Primary Muscle */}
                  <td className="py-3 px-3">
                    <Badge variant="accent" className="text-[10px] py-0">
                      {exercise.primaryMuscle}
                    </Badge>
                  </td>

                  {/* Secondary Muscles */}
                  <td className="py-3 px-3 hidden sm:table-cell text-zinc-400 text-[11px]">
                    {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0
                      ? exercise.secondaryMuscles.join(', ')
                      : '—'}
                  </td>

                  {/* Equipment */}
                  <td className="py-3 px-3 text-zinc-300">
                    {exercise.equipment}
                  </td>

                  {/* Difficulty */}
                  <td className="py-3 px-3 hidden md:table-cell">
                    <span
                      className={`text-[10px] uppercase font-mono ${
                        exercise.difficulty === 'ADVANCED'
                          ? 'text-red-400'
                          : exercise.difficulty === 'INTERMEDIATE'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                      }`}
                    >
                      {exercise.difficulty}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => handleAddToWorkout(exercise)}
                      className="h-7 px-2.5 text-xs hover:bg-orange-500 hover:text-zinc-950 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Log
                    </Button>
                  </td>
                </tr>
              ))}

              {displayExercises.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-zinc-400 font-mono text-xs">
                    No movements found matching the active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXERCISE DETAIL DRAWER / MODAL                                            */}
      {/* ========================================================================= */}
      {selectedExercise && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exercise-detail-title"
        >
          <div className="w-full max-w-lg bg-[#111114] border border-zinc-800 rounded-md shadow-2xl p-5 space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 id="exercise-detail-title" className="text-lg font-semibold text-zinc-100 m-0">
                  {selectedExercise.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="accent">{selectedExercise.primaryMuscle}</Badge>
                  <span className="text-xs font-mono text-zinc-400">{selectedExercise.equipment}</span>
                  <span className="text-xs font-mono text-zinc-400">• {selectedExercise.difficulty}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExercise(null)}
                className="text-zinc-400 hover:text-zinc-100 p-1 cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {selectedExercise.description}
            </div>

            {/* Target Breakdown */}
            <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-400">Primary Muscle:</span>
                <span className="text-orange-400 font-semibold">{selectedExercise.primaryMuscle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Secondary Muscles:</span>
                <span className="text-zinc-200">
                  {selectedExercise.secondaryMuscles?.length > 0
                    ? selectedExercise.secondaryMuscles.join(', ')
                    : 'None recorded'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Equipment Requisite:</span>
                <span className="text-zinc-200">{selectedExercise.equipment}</span>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            {selectedExercise.instructions && selectedExercise.instructions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Execution Protocol
                </div>
                <ol className="space-y-1.5 list-decimal list-inside text-xs text-zinc-300 leading-normal pl-1">
                  {selectedExercise.instructions.map((step, idx) => (
                    <li key={idx} className="marker:text-orange-500 marker:font-mono">
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedExercise(null)}
                className="text-xs text-zinc-400"
              >
                Close
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => handleAddToWorkout(selectedExercise)}
                className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs px-4 gap-1.5"
              >
                {addedNotice ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Added!
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Log in Active Workout
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
