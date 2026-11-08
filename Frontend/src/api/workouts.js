/**
 * GymX Workout Session & Analytics Service
 * 
 * Connected directly to Spring Boot REST API:
 *   - POST /api/workouts (create session)
 *   - GET /api/workouts (list user workouts)
 *   - GET /api/workouts/{id} (get session details)
 *   - DELETE /api/workouts/{id} (delete session)
 */

import { apiRequest } from './client'
import { authApi } from './auth'

const STORAGE_KEY_PREFIX = 'gymx_workouts_'
const ACTIVE_SESSION_KEY = 'gymx_active_session'

function getUserStorageKey() {
  const user = authApi.getStoredUser()
  return user?.id ? `${STORAGE_KEY_PREFIX}${user.id}` : `${STORAGE_KEY_PREFIX}guest`
}

// Convert backend WorkoutsEntity to frontend workout shape
function mapBackendWorkoutToFrontend(w) {
  const exercises = (w.workoutExercisesEntityList || []).map((we) => ({
    id: we.exerciseId || we.id,
    name: we.exerciseName || `Exercise #${we.exerciseId || we.id}`,
    primaryMuscle: we.primaryMuscle || 'GENERAL',
    equipment: we.equipment || 'BARBELL',
    sets: (we.workoutSetsEntityList || []).map((s) => ({
      id: s.id,
      setNumber: s.setNumber,
      weightKg: Number(s.weightKg) || 0,
      reps: Number(s.reps) || 0,
      completed: Boolean(s.isCompleted),
      type: 'normal',
    })),
  }))

  return {
    id: w.id,
    title: w.title || 'Workout Session',
    date: w.workoutDate ? new Date(w.workoutDate).toISOString() : new Date().toISOString(),
    notes: w.notes || '',
    exercises,
    totalVolumeKg: workoutsApi.calculateWorkoutVolume(exercises),
    createdAt: w.workoutDate ? new Date(w.workoutDate).toISOString() : new Date().toISOString(),
  }
}

// Convert frontend active session / completed workout to backend CreateWorkoutRequest
function mapFrontendWorkoutToBackend(workout) {
  const dateStr = workout.date
    ? workout.date.split('T')[0]
    : new Date().toISOString().split('T')[0]

  return {
    title: workout.title || 'Workout Session',
    workoutDate: dateStr,
    notes: workout.notes || '',
    exercises: (workout.exercises || []).map((ex, exIdx) => ({
      exerciseId: ex.id && typeof ex.id === 'number' ? ex.id : null,
      exerciseName: ex.name,
      primaryMuscle: ex.primaryMuscle,
      equipment: ex.equipment,
      displayOrder: exIdx + 1,
      sets: (ex.sets || []).map((s, sIdx) => ({
        setNumber: s.setNumber || sIdx + 1,
        reps: Number(s.reps) || 0,
        weightKg: Number(s.weightKg) || 0,
        isCompleted: Boolean(s.completed),
      })),
    })),
  }
}

export const workoutsApi = {
  // Check backend capability status
  getBackendContractStatus() {
    return {
      auth: 'Connected (/api/auth)',
      users: 'Connected (/api/users/me)',
      exercises: 'Connected (/api/exercises)',
      workouts: 'Connected REST API (/api/workouts)',
    }
  },

  // Get local storage workouts (fallback/guest)
  getLocalWorkouts() {
    try {
      const raw = localStorage.getItem(getUserStorageKey())
      if (!raw) return []
      const workouts = JSON.parse(raw)
      // Filter out any previously seeded workouts
      const cleaned = Array.isArray(workouts)
        ? workouts.filter(w => !String(w.id).startsWith('seed_'))
        : []
      return cleaned.sort((a, b) => new Date(b.date) - new Date(a.date))
    } catch (e) {
      console.error('Failed to parse workouts from storage', e)
      return []
    }
  },

  // Get all completed workouts (REST API with fallback)
  async getWorkouts() {
    const token = authApi.getStoredToken()
    if (token) {
      try {
        const data = await apiRequest('/api/workouts')
        if (Array.isArray(data)) {
          const mapped = data.map(mapBackendWorkoutToFrontend)
          // Keep local cache synced
          localStorage.setItem(getUserStorageKey(), JSON.stringify(mapped))
          return mapped
        }
      } catch (err) {
        console.warn('Backend /api/workouts request failed, reading local storage:', err.message)
      }
    }
    return this.getLocalWorkouts()
  },

  // Save a completed workout (REST API)
  async saveWorkout(workout) {
    const token = authApi.getStoredToken()
    if (token) {
      try {
        const payload = mapFrontendWorkoutToBackend(workout)
        const saved = await apiRequest('/api/workouts', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        this.clearActiveSession()
        const mapped = mapBackendWorkoutToFrontend(saved)

        // Sync local cache
        const local = this.getLocalWorkouts().filter(w => w.id !== mapped.id)
        localStorage.setItem(getUserStorageKey(), JSON.stringify([mapped, ...local]))

        return mapped
      } catch (err) {
        console.error('Failed saving workout to backend:', err)
      }
    }

    // Guest mode or offline fallback
    const workouts = this.getLocalWorkouts()
    const newWorkout = {
      id: workout.id || `w_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: workout.title || 'Workout Session',
      date: workout.date || new Date().toISOString(),
      notes: workout.notes || '',
      exercises: (workout.exercises || []).map(ex => ({
        id: ex.id,
        name: ex.name,
        primaryMuscle: ex.primaryMuscle,
        equipment: ex.equipment,
        sets: (ex.sets || []).map((s, idx) => ({
          setNumber: idx + 1,
          weightKg: Number(s.weightKg) || 0,
          reps: Number(s.reps) || 0,
          completed: Boolean(s.completed),
          type: s.type || 'normal',
        })),
      })),
      totalVolumeKg: this.calculateWorkoutVolume(workout.exercises || []),
      createdAt: new Date().toISOString(),
    }

    const updated = [newWorkout, ...workouts]
    localStorage.setItem(getUserStorageKey(), JSON.stringify(updated))
    this.clearActiveSession()
    return newWorkout
  },

  // Delete a workout (REST API)
  async deleteWorkout(workoutId) {
    const token = authApi.getStoredToken()
    if (token) {
      try {
        await apiRequest(`/api/workouts/${workoutId}`, {
          method: 'DELETE',
        })
      } catch (err) {
        console.error('Failed to delete workout from backend:', err)
      }
    }

    // Remove from local cache
    const workouts = this.getLocalWorkouts()
    const updated = workouts.filter(w => String(w.id) !== String(workoutId))
    localStorage.setItem(getUserStorageKey(), JSON.stringify(updated))
    return true
  },

  // Calculate total volume (tonnage) for exercises
  calculateWorkoutVolume(exercises) {
    return (exercises || []).reduce((acc, ex) => {
      const exVolume = (ex.sets || []).reduce((setAcc, s) => {
        if (!s.completed && s.completed !== undefined) return setAcc
        const weight = Number(s.weightKg) || 0
        const reps = Number(s.reps) || 0
        return setAcc + (weight * reps)
      }, 0)
      return acc + exVolume
    }, 0)
  },

  // Active workout draft persistence
  getActiveSession() {
    try {
      const raw = localStorage.getItem(ACTIVE_SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  saveActiveSession(session) {
    if (!session) {
      localStorage.removeItem(ACTIVE_SESSION_KEY)
      return
    }
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
      ...session,
      lastUpdated: Date.now(),
    }))
  },

  clearActiveSession() {
    localStorage.removeItem(ACTIVE_SESSION_KEY)
  },

  // Calculate personal records (PRs) per exercise
  getPersonalRecords(workoutList) {
    const workouts = Array.isArray(workoutList) ? workoutList : this.getLocalWorkouts()
    const prMap = {}

    workouts.forEach(workout => {
      workout.exercises?.forEach(ex => {
        if (!prMap[ex.name]) {
          prMap[ex.name] = { maxWeight: 0, maxRepsAtMaxWeight: 0, est1RM: 0, date: workout.date }
        }
        ex.sets?.forEach(set => {
          if (set.completed && set.weightKg > 0) {
            const currentEst1RM = Math.round(set.weightKg * (1 + (set.reps / 30)))
            if (set.weightKg > prMap[ex.name].maxWeight) {
              prMap[ex.name].maxWeight = set.weightKg
              prMap[ex.name].maxRepsAtMaxWeight = set.reps
              prMap[ex.name].date = workout.date
            }
            if (currentEst1RM > prMap[ex.name].est1RM) {
              prMap[ex.name].est1RM = currentEst1RM
            }
          }
        })
      })
    })

    return prMap
  },

  // Weekly analytics
  getWeeklyMetrics(workoutList) {
    const workouts = Array.isArray(workoutList) ? workoutList : this.getLocalWorkouts()
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
    const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000))

    const thisWeek = workouts.filter(w => new Date(w.date) >= sevenDaysAgo)
    const lastWeek = workouts.filter(w => {
      const d = new Date(w.date)
      return d >= fourteenDaysAgo && d < sevenDaysAgo
    })

    const thisWeekVolume = thisWeek.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0)
    const lastWeekVolume = lastWeek.reduce((sum, w) => sum + (w.totalVolumeKg || 0), 0)

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayMap = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
      const key = d.toISOString().split('T')[0]
      dayMap[key] = {
        dateStr: key,
        dayName: days[d.getDay()],
        sessions: 0,
        volume: 0,
        hasWorkout: false,
      }
    }

    thisWeek.forEach(w => {
      const key = (w.date || '').split('T')[0]
      if (dayMap[key]) {
        dayMap[key].sessions += 1
        dayMap[key].volume += (w.totalVolumeKg || 0)
        dayMap[key].hasWorkout = true
      }
    })

    return {
      thisWeekSessions: thisWeek.length,
      thisWeekVolume,
      volumeChangePct: lastWeekVolume > 0 ? Math.round(((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100) : 0,
      dailyActivity: Object.values(dayMap),
      totalWorkouts: workouts.length,
      allTimeVolume: workouts.reduce((s, w) => s + (w.totalVolumeKg || 0), 0),
    }
  },
}
