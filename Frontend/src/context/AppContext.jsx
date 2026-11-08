import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '@/api/auth'
import { workoutsApi } from '@/api/workouts'
import { measurementsApi } from '@/api/measurements'
import { playTimerCue } from '@/lib/sound'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Auth state
  const [token, setToken] = useState(() => authApi.getStoredToken())
  const [user, setUser] = useState(() => authApi.getStoredUser())
  const [isBackendHealthy, setIsBackendHealthy] = useState(null)

  // Workouts state
  const [workouts, setWorkouts] = useState([])
  const [personalRecords, setPersonalRecords] = useState({})
  const [weeklyMetrics, setWeeklyMetrics] = useState(null)

  // Body measurement & biometric state
  const [measurement, setMeasurement] = useState(null)
  const [isLoadingMeasurement, setIsLoadingMeasurement] = useState(false)

  // Active workout state
  const [activeWorkout, setActiveWorkout] = useState(() => workoutsApi.getActiveSession())

  // Rest timer state (optional secondary utility)
  const [restTimerSeconds, setRestTimerSeconds] = useState(0)
  const [isRestTimerRunning, setIsRestTimerRunning] = useState(false)

  // Load user data & refresh workouts from REST API (no fallback/seed workouts)
  const refreshWorkouts = async () => {
    try {
      const list = await workoutsApi.getWorkouts()
      const validList = Array.isArray(list) ? list : []
      setWorkouts(validList)
      setPersonalRecords(workoutsApi.getPersonalRecords(validList))
      setWeeklyMetrics(workoutsApi.getWeeklyMetrics(validList))
    } catch (err) {
      console.error('Error refreshing workouts:', err)
      setWorkouts([])
    }
  }

  // Fetch measurement data
  const refreshMeasurement = async () => {
    setIsLoadingMeasurement(true)
    try {
      const data = await measurementsApi.getMeasurement()
      setMeasurement(data)
    } catch (err) {
      console.error('Error fetching measurements:', err)
    } finally {
      setIsLoadingMeasurement(false)
    }
  }

  const saveMeasurement = async (formData, activityMultiplier) => {
    const res = await measurementsApi.calculateMeasurement(formData, activityMultiplier)
    setMeasurement(res)
    return res
  }

  // Refresh workouts & measurements whenever user changes
  useEffect(() => {
    refreshWorkouts()
    refreshMeasurement()
  }, [user])

  // Verify backend health and validate stored auth token on startup
  useEffect(() => {
    async function checkHealthAndAuth() {
      try {
        const res = await fetch('/api/exercises', { method: 'GET' })
        setIsBackendHealthy(res.status < 500)
      } catch {
        setIsBackendHealthy(false)
      }

      // If user has a stored token, verify it with backend /api/users/me
      const storedToken = authApi.getStoredToken()
      if (storedToken) {
        try {
          const userMe = await authApi.getCurrentUser()
          if (userMe?.email) {
            setUser({
              id: userMe.id,
              email: userMe.email,
              userName: userMe.UserName || userMe.userName || userMe.email.split('@')[0],
            })
          }
        } catch (err) {
          console.warn('Stored token is invalid or expired:', err.message)
          authApi.logout()
          setToken(null)
          setUser(null)
        }
      }
    }
    checkHealthAndAuth()
  }, [])

  // Rest timer countdown
  useEffect(() => {
    let interval = null
    if (isRestTimerRunning && restTimerSeconds > 0) {
      interval = setInterval(() => {
        setRestTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsRestTimerRunning(false)
            playTimerCue()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRestTimerRunning, restTimerSeconds])

  // Rest timer controls
  const startRestTimer = (seconds = 90) => {
    setRestTimerSeconds(seconds)
    setIsRestTimerRunning(true)
  }

  const addRestTime = (additionalSeconds = 30) => {
    setRestTimerSeconds((prev) => prev + additionalSeconds)
    setIsRestTimerRunning(true)
  }

  const stopRestTimer = () => {
    setIsRestTimerRunning(false)
    setRestTimerSeconds(0)
  }

  // Active workout session controls
  const startNewWorkout = (template = null) => {
    const newSession = {
      id: `w_${Date.now()}`,
      title: template?.title || 'Workout Session',
      notes: '',
      exercises: template?.exercises || [],
    }
    setActiveWorkout(newSession)
    workoutsApi.saveActiveSession(newSession)
  }

  const updateActiveWorkout = (updatedSession) => {
    setActiveWorkout(updatedSession)
    workoutsApi.saveActiveSession(updatedSession)
  }

  const finishActiveWorkout = async () => {
    if (!activeWorkout) return null
    const completedWorkout = {
      ...activeWorkout,
      date: new Date().toISOString(),
    }
    const saved = await workoutsApi.saveWorkout(completedWorkout)
    setActiveWorkout(null)
    workoutsApi.clearActiveSession()
    stopRestTimer()
    await refreshWorkouts()
    return saved
  }

  const discardActiveWorkout = () => {
    setActiveWorkout(null)
    workoutsApi.clearActiveSession()
    stopRestTimer()
  }

  // Auth actions
  const loginUser = (authResponse) => {
    setToken(authResponse.accessToken)
    setUser({
      id: authResponse.id,
      email: authResponse.email,
      userName: authResponse.userName,
    })
  }

  const logoutUser = () => {
    authApi.logout()
    setToken(null)
    setUser(null)
    setMeasurement(null)
  }

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        isBackendHealthy,
        loginUser,
        logoutUser,
        measurement,
        isLoadingMeasurement,
        refreshMeasurement,
        saveMeasurement,
        workouts,
        personalRecords,
        weeklyMetrics,
        refreshWorkouts,
        activeWorkout,
        startNewWorkout,
        updateActiveWorkout,
        finishActiveWorkout,
        discardActiveWorkout,
        restTimerSeconds,
        isRestTimerRunning,
        startRestTimer,
        addRestTime,
        stopRestTimer,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
