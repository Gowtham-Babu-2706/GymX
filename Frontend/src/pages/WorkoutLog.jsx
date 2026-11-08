import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { exercisesApi} from '@/api/exercises'
import { 
  Check, 
  Plus, 
  Trash2, 
  Search, 
  X, 
  Dumbbell, 
  Save
} from 'lucide-react'

export function WorkoutLog() {
  const navigate = useNavigate()
  const { 
    activeWorkout, 
    startNewWorkout, 
    updateActiveWorkout, 
    finishActiveWorkout, 
    discardActiveWorkout,
    personalRecords
  } = useApp()

  // Exercise picker modal state
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [exerciseCatalog, setExerciseCatalog] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState('ALL')
  const [selectedEquipment] = useState('ALL')

  // Finish confirmation modal state
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [workoutNotes, setWorkoutNotes] = useState(() => activeWorkout?.notes || '')
  const hasInitialized = useRef(false)

  // Initialize a workout if none active
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      if (!activeWorkout) {
        startNewWorkout({ title: 'Standard Session', exercises: [] })
      }
    }
  }, [activeWorkout, startNewWorkout])

  // Load exercises from API
  useEffect(() => {
    async function loadCatalog() {
      try {
        const result = await exercisesApi.getExercises()
        if (result?.data && result.data.length > 0) {
          setExerciseCatalog(result.data)
        }
      } catch (err) {
        console.warn('Failed loading exercises from API', err)
      }
    }
    loadCatalog()
  }, [])

  const currentWorkout = activeWorkout || {
    title: 'Standard Session',
    exercises: [],
  }

  // Title change
  const handleTitleChange = (e) => {
    updateActiveWorkout({
      ...currentWorkout,
      title: e.target.value,
    })
  }

  // Add exercise to workout
  const handleAddExercise = (exercise) => {
    // Check if user has PR or default hint for set 1
    const pr = personalRecords[exercise.name]
    const defaultWeight = pr?.maxWeight ? Math.round(pr.maxWeight * 0.8) : 50

    const newExerciseEntry = {
      id: exercise.id,
      name: exercise.name,
      primaryMuscle: exercise.primaryMuscle,
      equipment: exercise.equipment,
      sets: [
        { setNumber: 1, weightKg: defaultWeight, reps: 10, completed: false, type: 'normal' },
        { setNumber: 2, weightKg: defaultWeight, reps: 10, completed: false, type: 'normal' },
        { setNumber: 3, weightKg: defaultWeight, reps: 10, completed: false, type: 'normal' },
      ],
    }

    updateActiveWorkout({
      ...currentWorkout,
      exercises: [...(currentWorkout.exercises || []), newExerciseEntry],
    })
    setIsPickerOpen(false)
    setSearchQuery('')
  }

  // Remove exercise from workout
  const handleRemoveExercise = (exerciseIndex) => {
    const updatedExercises = currentWorkout.exercises.filter((_, idx) => idx !== exerciseIndex)
    updateActiveWorkout({
      ...currentWorkout,
      exercises: updatedExercises,
    })
  }

  // Add set to an exercise
  const handleAddSet = (exerciseIndex) => {
    const ex = currentWorkout.exercises[exerciseIndex]
    const lastSet = ex.sets[ex.sets.length - 1]
    const newSet = {
      setNumber: ex.sets.length + 1,
      weightKg: lastSet ? lastSet.weightKg : 50,
      reps: lastSet ? lastSet.reps : 10,
      completed: false,
      type: 'normal',
    }

    const updatedExercises = [...currentWorkout.exercises]
    updatedExercises[exerciseIndex] = {
      ...ex,
      sets: [...ex.sets, newSet],
    }
    updateActiveWorkout({
      ...currentWorkout,
      exercises: updatedExercises,
    })
  }

  // Remove set from an exercise
  const handleRemoveSet = (exerciseIndex, setIndex) => {
    const ex = currentWorkout.exercises[exerciseIndex]
    if (ex.sets.length <= 1) return
    const updatedSets = ex.sets
      .filter((_, idx) => idx !== setIndex)
      .map((s, idx) => ({ ...s, setNumber: idx + 1 }))

    const updatedExercises = [...currentWorkout.exercises]
    updatedExercises[exerciseIndex] = {
      ...ex,
      sets: updatedSets,
    }
    updateActiveWorkout({
      ...currentWorkout,
      exercises: updatedExercises,
    })
  }

  // Update set values
  const handleUpdateSet = (exerciseIndex, setIndex, field, value) => {
    const ex = currentWorkout.exercises[exerciseIndex]
    const updatedSets = [...ex.sets]
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      [field]: value,
    }

    const updatedExercises = [...currentWorkout.exercises]
    updatedExercises[exerciseIndex] = {
      ...ex,
      sets: updatedSets,
    }
    updateActiveWorkout({
      ...currentWorkout,
      exercises: updatedExercises,
    })
  }

  // Toggle set completion
  const handleToggleSetComplete = (exerciseIndex, setIndex) => {
    const ex = currentWorkout.exercises[exerciseIndex]
    const currentCompleted = Boolean(ex.sets[setIndex].completed)
    handleUpdateSet(exerciseIndex, setIndex, 'completed', !currentCompleted)
  }

  // Quick weight adjustment helpers
  const handleAdjustWeight = (exerciseIndex, setIndex, delta) => {
    const ex = currentWorkout.exercises[exerciseIndex]
    const currentWeight = Number(ex.sets[setIndex].weightKg) || 0
    const newWeight = Math.max(0, currentWeight + delta)
    handleUpdateSet(exerciseIndex, setIndex, 'weightKg', newWeight)
  }

  // Save / Finish
  const handleConfirmFinish = async () => {
    setIsSaving(true)
    try {
      if (workoutNotes !== currentWorkout.notes) {
        updateActiveWorkout({ ...currentWorkout, notes: workoutNotes })
      }
      await finishActiveWorkout()
      setIsFinishModalOpen(false)
      navigate('/history')
    } catch (err) {
      console.error('Failed to complete workout:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Filter exercises in modal
  const filteredCatalog = exerciseCatalog.filter((ex) => {
    const matchesSearch =
      !searchQuery ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMuscle =
      selectedMuscle === 'ALL' ||
      ex.primaryMuscle === selectedMuscle ||
      ex.secondaryMuscles?.includes(selectedMuscle)
    const matchesEquipment =
      selectedEquipment === 'ALL' || ex.equipment === selectedEquipment
    return matchesSearch && matchesMuscle && matchesEquipment
  })

  // Live total volume & completed sets calculation
  const totalSets = (currentWorkout.exercises || []).reduce(
    (acc, ex) => acc + (ex.sets || []).length,
    0
  )
  const completedSets = (currentWorkout.exercises || []).reduce(
    (acc, ex) => acc + (ex.sets || []).filter((s) => s.completed).length,
    0
  )
  const liveVolume = (currentWorkout.exercises || []).reduce((acc, ex) => {
    return (
      acc +
      (ex.sets || []).reduce((setAcc, s) => {
        if (!s.completed) return setAcc
        return setAcc + (Number(s.weightKg) || 0) * (Number(s.reps) || 0)
      }, 0)
    )
  }, 0)

  return (
    <div className="space-y-6 pb-28 md:pb-16 max-w-4xl mx-auto">
      {/* 1. Workout Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="uppercase tracking-wider">Active Workout Session</span>
          </div>
          <input
            type="text"
            value={currentWorkout.title}
            onChange={handleTitleChange}
            placeholder="Workout Title (e.g. Push Heavy A)"
            className="w-full bg-transparent text-xl sm:text-2xl font-semibold text-zinc-100 border-none outline-none focus:ring-0 p-0 placeholder:text-zinc-600"
          />
        </div>

        {/* Top Control Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={discardActiveWorkout}
            className="text-zinc-400 hover:text-red-400 text-xs"
          >
            Discard
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsFinishModalOpen(true)}
            disabled={(currentWorkout.exercises || []).length === 0}
            className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs px-4 gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Finish Workout
          </Button>
        </div>
      </div>

      {/* 2. Telemetry HUD Strip */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-md border border-zinc-800/80 bg-[#111114] text-center font-mono">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-400">Exercises</div>
          <div className="text-sm sm:text-base font-semibold text-zinc-100 tabular-nums">
            {(currentWorkout.exercises || []).length}
          </div>
        </div>
        <div className="border-x border-zinc-800/80">
          <div className="text-[10px] uppercase tracking-wider text-zinc-400">Total Volume</div>
          <div className="text-sm sm:text-base font-semibold text-orange-400 tabular-nums">
            {liveVolume.toLocaleString()} <span className="text-xs text-zinc-400">kg</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-400">Sets Done</div>
          <div className="text-sm sm:text-base font-semibold text-zinc-100 tabular-nums">
            {completedSets} <span className="text-xs text-zinc-400">/ {totalSets}</span>
          </div>
        </div>
      </div>

      {/* 3. Exercise List */}
      <div className="space-y-4">
        {(currentWorkout.exercises || []).map((exercise, exIndex) => {
          const pr = personalRecords[exercise.name]
          return (
            <div
              key={exIndex}
              className="rounded-md border border-zinc-800/90 bg-[#111114] overflow-hidden"
            >
              {/* Exercise Header */}
              <div className="p-3.5 sm:p-4 border-b border-zinc-800/80 flex items-center justify-between gap-3 bg-zinc-900/40">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center font-mono text-xs font-semibold text-orange-400 shrink-0">
                    {exIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-semibold text-zinc-100 truncate">
                      {exercise.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        {exercise.primaryMuscle}
                      </Badge>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {exercise.equipment}
                      </span>
                      {pr && (
                        <span className="text-[10px] font-mono text-orange-400 hidden sm:inline">
                          PR: {pr.maxWeight}kg × {pr.maxRepsAtMaxWeight}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove Exercise */}
                <button
                  type="button"
                  onClick={() => handleRemoveExercise(exIndex)}
                  className="text-zinc-500 hover:text-red-400 p-1.5 rounded transition-colors cursor-pointer"
                  title="Remove exercise"
                  aria-label={`Remove ${exercise.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sets Table */}
              <div className="p-2 sm:p-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="text-zinc-400 border-b border-zinc-800/60 text-[10px] uppercase">
                        <th className="py-2 px-2 w-10 text-center">Set</th>
                        <th className="py-2 px-2 hidden sm:table-cell w-28">Previous</th>
                        <th className="py-2 px-2 text-center w-36">Kg</th>
                        <th className="py-2 px-2 text-center w-24">Reps</th>
                        <th className="py-2 px-2 w-14 text-center">Done</th>
                        <th className="py-2 px-1 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {exercise.sets.map((set, setIndex) => {
                        const isCompleted = Boolean(set.completed)
                        return (
                          <tr
                            key={setIndex}
                            className={`transition-colors ${
                              isCompleted
                                ? 'bg-orange-950/10 text-zinc-200'
                                : 'hover:bg-zinc-900/30 text-zinc-100'
                            }`}
                          >
                            {/* Set Number */}
                            <td className="py-2 px-2 text-center font-bold text-zinc-400">
                              {set.setNumber}
                            </td>

                            {/* Previous hint */}
                            <td className="py-2 px-2 text-zinc-400 hidden sm:table-cell text-[11px]">
                              {pr ? `${pr.maxWeight} kg × ${pr.maxRepsAtMaxWeight}` : '—'}
                            </td>

                            {/* Weight (Kg) Input with +/- steppers */}
                            <td className="py-2 px-2">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleAdjustWeight(exIndex, setIndex, -2.5)}
                                  className="w-6 h-8 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-100 text-xs hidden sm:flex items-center justify-center cursor-pointer"
                                  title="-2.5 kg"
                                  aria-label="Decrease weight by 2.5 kg"
                                >
                                  -
                                </button>
                                <Input
                                  type="number"
                                  step="0.5"
                                  value={set.weightKg}
                                  autoSelect
                                  onChange={(e) =>
                                    handleUpdateSet(
                                      exIndex,
                                      setIndex,
                                      'weightKg',
                                      e.target.value
                                    )
                                  }
                                  className={`h-8 w-16 sm:w-20 text-center font-semibold text-sm tabular-nums p-0 ${
                                    isCompleted ? 'border-orange-500/40 bg-zinc-900/80' : ''
                                  }`}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAdjustWeight(exIndex, setIndex, 2.5)}
                                  className="w-6 h-8 rounded bg-zinc-800 text-zinc-400 hover:text-zinc-100 text-xs hidden sm:flex items-center justify-center cursor-pointer"
                                  title="+2.5 kg"
                                  aria-label="Increase weight by 2.5 kg"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Reps Input */}
                            <td className="py-2 px-2 text-center">
                              <Input
                                type="number"
                                value={set.reps}
                                autoSelect
                                onChange={(e) =>
                                  handleUpdateSet(
                                    exIndex,
                                    setIndex,
                                    'reps',
                                    e.target.value
                                  )
                                }
                                className={`h-8 w-14 sm:w-16 mx-auto text-center font-semibold text-sm tabular-nums p-0 ${
                                  isCompleted ? 'border-orange-500/40 bg-zinc-900/80' : ''
                                }`}
                              />
                            </td>

                            {/* Done Checkbox / Button */}
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleSetComplete(exIndex, setIndex)}
                                aria-label={`Toggle set ${set.setNumber} completion`}
                                className={`w-8 h-8 rounded flex items-center justify-center mx-auto transition-all cursor-pointer ${
                                  isCompleted
                                    ? 'bg-orange-500 text-zinc-950 font-bold shadow-sm'
                                    : 'bg-zinc-800/90 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 border border-zinc-700/60'
                                }`}
                              >
                                <Check
                                  className={`w-4 h-4 ${
                                    isCompleted ? 'stroke-[3]' : 'stroke-[1.5]'
                                  }`}
                                />
                              </button>
                            </td>

                            {/* Delete Set */}
                            <td className="py-2 px-1 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(exIndex, setIndex)}
                                className="text-zinc-600 hover:text-zinc-400 p-1 cursor-pointer"
                                title="Delete set"
                                aria-label={`Delete set ${set.setNumber}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add Set Button */}
                <div className="mt-3 flex justify-start">
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => handleAddSet(exIndex)}
                    className="text-xs h-7 gap-1 px-3"
                  >
                    <Plus className="w-3 h-3" />
                    Add Set
                  </Button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Empty Workout State */}
        {(currentWorkout.exercises || []).length === 0 && (
          <div className="p-8 sm:p-12 text-center rounded-md border border-dashed border-zinc-800 bg-zinc-950/40">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3">
              <Dumbbell className="w-6 h-6 text-zinc-500" />
            </div>
            <h3 className="text-base font-semibold text-zinc-200">No exercises added yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
              Select movements from the exercise library to log weights, repetitions, and rest intervals.
            </p>
            <Button
              variant="default"
              onClick={() => setIsPickerOpen(true)}
              className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add First Exercise
            </Button>
          </div>
        )}
      </div>

      {/* 4. Add Exercise Primary Button */}
      {(currentWorkout.exercises || []).length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsPickerOpen(true)}
            className="w-full sm:w-auto border-dashed border-zinc-700 hover:border-orange-500 hover:text-orange-400 text-zinc-300 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Exercise
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={() => setIsFinishModalOpen(true)}
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Finish Workout ({completedSets}/{totalSets} Sets)
          </Button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXERCISE PICKER MODAL / DRAWER                                            */}
      {/* ========================================================================= */}
      {isPickerOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exercise-library-title"
        >
          <div className="w-full max-w-2xl bg-[#111114] border border-zinc-800 rounded-md shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 id="exercise-library-title" className="text-base font-semibold text-zinc-100 m-0">Exercise Library</h3>
                <span className="text-xs text-zinc-400">
                  Select movement to add to {currentWorkout.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Muscle Filters */}
            <div className="p-4 border-b border-zinc-800/80 space-y-3 bg-zinc-900/30">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="Search exercise by name or muscle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-zinc-900 text-sm"
                  autoFocus
                />
              </div>

              {/* Muscle Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {['ALL', 'CHEST', 'BACK', 'SHOULDERS', 'QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'BICEPS', 'TRICEPS', 'ABS'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMuscle(m)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono tracking-tight uppercase whitespace-nowrap cursor-pointer transition-colors ${
                      selectedMuscle === m
                        ? 'bg-orange-500 text-zinc-950 font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Exercise Results List */}
            <div className="p-2 sm:p-4 overflow-y-auto divide-y divide-zinc-800/50 flex-1">
              {filteredCatalog.map((exercise) => {
                const pr = personalRecords[exercise.name]
                return (
                  <div
                    key={exercise.id}
                    onClick={() => handleAddExercise(exercise)}
                    className="p-3 rounded hover:bg-zinc-800/60 transition-colors cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-100 group-hover:text-orange-400 transition-colors">
                        {exercise.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                        <span className="font-mono text-[11px] text-zinc-300">
                          {exercise.primaryMuscle}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-zinc-400">
                          {exercise.equipment}
                        </span>
                        {pr && (
                          <span className="text-orange-400/90 font-mono text-[10px] hidden sm:inline">
                            Best: {pr.maxWeight}kg
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="subtle"
                      className="text-xs h-7 px-3 group-hover:bg-orange-500 group-hover:text-zinc-950 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                )
              })}

              {filteredCatalog.length === 0 && (
                <div className="p-8 text-center text-zinc-400 text-xs font-mono">
                  No exercises matching query. Try a different search term or muscle group.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FINISH WORKOUT RECAP MODAL                                                */}
      {/* ========================================================================= */}
      {isFinishModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="finish-workout-title"
        >
          <div className="w-full max-w-md bg-[#111114] border border-zinc-800 rounded-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 id="finish-workout-title" className="text-base font-semibold text-zinc-100 m-0">Finish Workout</h3>
                <p className="text-xs text-zinc-400">Review and commit session to logbook</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFinishModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-100 cursor-pointer"
                aria-label="Close finish workout dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recap Stats */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded bg-zinc-900/60 border border-zinc-800 text-center font-mono">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Exercises</span>
                <div className="text-sm font-semibold text-zinc-100">
                  {(currentWorkout.exercises || []).length}
                </div>
              </div>
              <div className="border-x border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase">Volume</span>
                <div className="text-sm font-semibold text-orange-400">
                  {liveVolume.toLocaleString()} kg
                </div>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase">Sets</span>
                <div className="text-sm font-semibold text-zinc-100">
                  {completedSets}
                </div>
              </div>
            </div>

            {/* Session Notes */}
            <div className="space-y-1.5">
              <label htmlFor="session-notes-input" className="text-xs text-zinc-300 font-medium">Session Notes (optional)</label>
              <textarea
                id="session-notes-input"
                rows="3"
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="RPE, fatigue notes, progressive overload notes..."
                className="w-full rounded border border-zinc-800 bg-zinc-900 p-2.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/80">
              <Button
                variant="ghost"
                size="sm"
                disabled={isSaving}
                onClick={() => setIsFinishModalOpen(false)}
                className="text-xs text-zinc-400"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={isSaving}
                onClick={handleConfirmFinish}
                className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs px-4"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                {isSaving ? 'Saving...' : 'Save & Complete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
