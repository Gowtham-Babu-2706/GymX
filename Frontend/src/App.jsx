import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { Navbar } from '@/components/Navbar'
import { RestTimerBar } from '@/components/RestTimerBar'
import { Dashboard } from '@/pages/Dashboard'
import { WorkoutLog } from '@/pages/WorkoutLog'
import { ExerciseLibrary } from '@/pages/ExerciseLibrary'
import { WorkoutHistory } from '@/pages/WorkoutHistory'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-orange-500 selection:text-zinc-950">
          {/* Top & Mobile Navigation */}
          <Navbar />

          {/* Main Application Canvas */}
          <main className="flex-1 max-w-screen w-full mx-auto px-4 sm:px-6 py-5 sm:py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/log" element={<WorkoutLog />} />
              <Route path="/exercises" element={<ExerciseLibrary />} />
              <Route path="/history" element={<WorkoutHistory />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Persistent Floating Rest Timer */}
          <RestTimerBar />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
