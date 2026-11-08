import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MeasurementModal } from '@/components/MeasurementModal'
import { 
  getBmiCategory, 
  getWaistToHeightCategory, 
  getWaistToHipCategory 
} from '@/api/measurements'
import { 
  Scale, 
  Ruler, 
  Flame, 
  Activity, 
  TrendingUp, 
  Dumbbell, 
  Calendar, 
  Plus, 
  Play, 
  Award, 
  Sparkles, 
  HeartPulse, 
  ChevronRight,
  Zap
} from 'lucide-react'

export function Dashboard() {
  const { 
    user, 
    measurement, 
    isLoadingMeasurement,
    workouts, 
    weeklyMetrics, 
    personalRecords,
    activeWorkout 
  } = useApp()

  const [isModalOpen, setIsModalOpen] = useState(false)

  // Calculate BMI category & color
  const bmi = measurement?.bmi != null ? Number(measurement.bmi) : null
  const bmiCategory = getBmiCategory(bmi)

  // Calculate healthy weight range based on height
  const heightCm = measurement?.height ? Number(measurement.height) : null
  const minHealthyWeight = heightCm ? Math.round(18.5 * Math.pow(heightCm / 100, 2)) : null
  const maxHealthyWeight = heightCm ? Math.round(24.9 * Math.pow(heightCm / 100, 2)) : null

  // Waist ratios
  const waistHeightRatio = measurement?.waistHeightRatio != null ? Number(measurement.waistHeightRatio) : null
  const whtrCategory = getWaistToHeightCategory(waistHeightRatio)

  const waistHipRatio = measurement?.waistHipRatio != null ? Number(measurement.waistHipRatio) : null
  const whrCategory = getWaistToHipCategory(waistHipRatio, measurement?.isFemale)

  // Caloric projections based on BMR / TDEE
  const bmr = measurement?.bmr != null ? Math.round(measurement.bmr) : null
  const tdee = measurement?.tdee != null 
    ? Math.round(measurement.tdee) 
    : (bmr ? Math.round(bmr * (measurement?.activityMultiplier || 1.55)) : null)

  // Top personal records (up to 4)
  const prEntries = Object.entries(personalRecords || {}).slice(0, 4)

  // Recent 3 workouts
  const recentWorkouts = [...workouts].slice(0, 3)

  // BMI Gauge position calculation (range: 15 to 35)
  const calculateGaugePercent = (val) => {
    if (!val) return 0
    const clamped = Math.max(15, Math.min(35, val))
    return ((clamped - 15) / (35 - 15)) * 100
  }

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-screen mx-auto mx-20">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-zinc-300">
              {user ? `User : ${user.userName || user.email.split('@')[0]}` : 'Guest Session'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 m-0">
            Performance & Body Metrics
          </h1>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs border-zinc-700 hover:bg-zinc-800 text-zinc-200 h-9 gap-1.5 cursor-pointer shadow-sm"
          >
            <Scale className="w-4 h-4 text-orange-400" />
            <span>{measurement ? 'Update Measurements' : 'Log Measurements'}</span>
          </Button>

          <Link to="/log">
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs h-9 gap-1.5 shadow-md shadow-orange-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Start Workout</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Workout Banner (if in session) */}
      {activeWorkout && (
        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            <div>
              <div className="text-xs font-mono uppercase text-orange-400 font-semibold">
                Live Workout Session In Progress
              </div>
              <div className="text-sm font-medium text-zinc-100">
                {activeWorkout.title || 'Workout Session'} — {activeWorkout.exercises?.length || 0} exercises queued
              </div>
            </div>
          </div>
          <Link to="/log">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-400 text-zinc-950 text-xs font-semibold h-8 gap-1.5">
              <Play className="w-3.5 h-3.5" />
              Resume Session
            </Button>
          </Link>
        </div>
      )}

      {/* Hero Body Composition Alert if no data */}
      {!measurement && !isLoadingMeasurement && (
        <div className="p-5 sm:p-6 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-orange-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Biometric Hub Awaiting Baseline</span>
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">
              Calculate your BMI, BMR & Anthropometric Targets
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Enter your current height, weight, and circumferences. The GymX calculation engine will assess your Body Mass Index (BMI), Basal Metabolic Rate (BMR), and Daily Energy Expenditure (TDEE).
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs h-10 px-4 shrink-0 gap-2"
          >
            <Scale className="w-4 h-4" />
            Calculate Body Metrics Now
          </Button>
        </div>
      )}

      {/* Primary Biometrics & Health Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* BMI Card */}
        <Card className="bg-[#111114] border-zinc-800/90 relative overflow-hidden flex flex-col justify-between">
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5 text-orange-400" />
                  <span>Body Mass Index (BMI)</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-zinc-100">
                    {bmi ? bmi.toFixed(1) : '—'}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">kg/m²</span>
                </div>
              </div>
              {bmi && (
                <Badge variant={bmiCategory.badgeVariant} className="text-xs px-2.5 py-1">
                  {bmiCategory.label}
                </Badge>
              )}
            </div>

            {/* Visual Gauge Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="relative h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden flex">
                <div className="h-full bg-sky-500/80 w-[17.5%]" title="Underweight (< 18.5)" />
                <div className="h-full bg-emerald-500/80 w-[32%]" title="Normal (18.5 - 24.9)" />
                <div className="h-full bg-amber-500/80 w-[25.5%]" title="Overweight (25 - 29.9)" />
                <div className="h-full bg-red-500/80 w-[25%]" title="Obese (≥ 30)" />
              </div>

              {bmi && (
                <div className="relative w-full h-3">
                  <div 
                    className="absolute -top-1 -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                    style={{ left: `${calculateGaugePercent(bmi)}%` }}
                  >
                    <span className="w-2 h-2 rounded-full bg-white ring-2 ring-orange-500" />
                  </div>
                </div>
              )}

              <div className="flex justify-between text-[10px] font-mono text-zinc-500 px-0.5">
                <span>15.0</span>
                <span>18.5</span>
                <span>25.0</span>
                <span>30.0</span>
                <span>35.0</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              {bmiCategory.desc}
            </p>
          </div>

          <div className="p-4 bg-zinc-950/60 border-t border-zinc-800/70 text-xs text-zinc-400 flex items-center justify-between">
            <span>Healthy weight range:</span>
            <span className="font-mono text-zinc-200 font-medium">
              {minHealthyWeight && maxHealthyWeight ? `${minHealthyWeight} – ${maxHealthyWeight} kg` : 'Input height'}
            </span>
          </div>
        </Card>

        {/* Metabolic Energy Card (BMR & TDEE) */}
        <Card className="bg-[#111114] border-zinc-800/90 relative overflow-hidden flex flex-col justify-between">
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Energy & Metabolism</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono text-zinc-100">
                    {tdee ? tdee.toLocaleString() : '—'}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">kcal / day (TDEE)</span>
                </div>
              </div>
              <Badge variant="accent" className="text-xs">
                Mifflin-St Jeor
              </Badge>
            </div>

            {/* BMR vs TDEE Comparison */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/70">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Basal Rate (BMR)</div>
                <div className="text-base font-bold font-mono text-orange-400 mt-0.5">
                  {bmr ? `${bmr.toLocaleString()} kcal` : '—'}
                </div>
                <div className="text-[10px] text-zinc-500">Resting burn</div>
              </div>

              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/70">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Activity Tier</div>
                <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                  {measurement?.activityMultiplier ? `${measurement.activityMultiplier}x` : '1.55x'}
                </div>
                <div className="text-[10px] text-zinc-500">Moderate Training</div>
              </div>
            </div>

            {/* Target Calorie Splits */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-400 py-0.5">
                <span>Fat Loss Deficit (-500):</span>
                <span className="font-mono text-amber-400 font-medium">
                  {tdee ? `${(tdee - 500).toLocaleString()} kcal` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400 py-0.5">
                <span>Lean Muscle Surplus (+300):</span>
                <span className="font-mono text-emerald-400 font-medium">
                  {tdee ? `${(tdee + 300).toLocaleString()} kcal` : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-950/60 border-t border-zinc-800/70 text-xs text-zinc-400 flex items-center justify-between">
            <span>Biological Profile:</span>
            <span className="font-mono text-zinc-200">
              {measurement ? `${measurement.isFemale ? 'Female' : 'Male'}, ${measurement.age || '—'} yrs` : 'Not configured'}
            </span>
          </div>
        </Card>

        {/* Health Ratios & Anthropometrics Card */}
        <Card className="bg-[#111114] border-zinc-800/90 relative overflow-hidden flex flex-col justify-between">
          <div className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  <HeartPulse className="w-3.5 h-3.5 text-orange-400" />
                  <span>Cardiovascular Ratios</span>
                </div>
                <div className="text-base font-semibold text-zinc-100 mt-2">
                  Body Distribution & Risk
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Clinical Indices
              </Badge>
            </div>

            <div className="space-y-3 pt-1">
              {/* Waist to Height */}
              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/70 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-zinc-200">Waist-to-Height (WHtR)</div>
                  <div className="text-[10px] text-zinc-400">Target &lt; 0.5 for optimal longevity</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-zinc-100">
                    {waistHeightRatio ? waistHeightRatio.toFixed(3) : '—'}
                  </div>
                  {whtrCategory && (
                    <Badge variant={whtrCategory.badgeVariant} className="text-[10px] py-0 px-1.5">
                      {whtrCategory.label}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Waist to Hip */}
              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/70 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-zinc-200">Waist-to-Hip (WHR)</div>
                  <div className="text-[10px] text-zinc-400">
                    Target &le; {measurement?.isFemale ? '0.80' : '0.90'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-zinc-100">
                    {waistHipRatio ? waistHipRatio.toFixed(3) : '—'}
                  </div>
                  {whrCategory && (
                    <Badge variant={whrCategory.badgeVariant} className="text-[10px] py-0 px-1.5">
                      {whrCategory.label}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Body Fat % */}
              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/70 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-zinc-200">Estimated Body Fat</div>
                  <div className="text-[10px] text-zinc-400">Adipose tissue ratio</div>
                </div>
                <div className="font-mono font-bold text-zinc-100">
                  {measurement?.bodyFat ? `${measurement.bodyFat}%` : 'Not recorded'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-950/60 border-t border-zinc-800/70 text-xs text-zinc-400 flex items-center justify-between">
            <span>Last calibrated:</span>
            <span className="font-mono text-zinc-200">
              {measurement?.measuredAt 
                ? new Date(measurement.measuredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Never'}
            </span>
          </div>
        </Card>
      </div>

      {/* Circumference Measurements & Training Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Circumference Dimension Tape Readings */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#111114] border-zinc-800/90">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  <Ruler className="w-3.5 h-3.5 text-orange-400" />
                  <span>Anthropometric Dimensions</span>
                </div>
                <CardTitle className="text-base font-semibold mt-1 text-zinc-100">
                  Tape Circumference Measurements (cm)
                </CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="text-xs h-8 border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
              >
                <Scale className="w-3.5 h-3.5 text-orange-400" />
                Edit Measurements
              </Button>
            </CardHeader>

            <CardContent className="pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/70 text-center">
                  <div className="text-[11px] font-mono uppercase text-zinc-400">Neck</div>
                  <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
                    {measurement?.neckMeasurement ? `${measurement.neckMeasurement}` : '—'}
                  </div>
                  <div className="text-[10px] text-zinc-500">cm</div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/70 text-center">
                  <div className="text-[11px] font-mono uppercase text-zinc-400">Chest</div>
                  <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
                    {measurement?.chestMeasurement ? `${measurement.chestMeasurement}` : '—'}
                  </div>
                  <div className="text-[10px] text-zinc-500">cm</div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/70 text-center">
                  <div className="text-[11px] font-mono uppercase text-zinc-400">Shoulders</div>
                  <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
                    {measurement?.shoulderMeasurement ? `${measurement.shoulderMeasurement}` : '—'}
                  </div>
                  <div className="text-[10px] text-zinc-500">cm</div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/70 text-center">
                  <div className="text-[11px] font-mono uppercase text-zinc-400">Waist</div>
                  <div className="text-xl font-bold font-mono text-orange-400 mt-1">
                    {measurement?.waistMeasurement ? `${measurement.waistMeasurement}` : '—'}
                  </div>
                  <div className="text-[10px] text-zinc-500">cm</div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/70 text-center">
                  <div className="text-[11px] font-mono uppercase text-zinc-400">Hips</div>
                  <div className="text-xl font-bold font-mono text-zinc-100 mt-1">
                    {measurement?.hipMeasurement ? `${measurement.hipMeasurement}` : '—'}
                  </div>
                  <div className="text-[10px] text-zinc-500">cm</div>
                </div>
              </div>

              {/* Base Dimension Info Banner */}
              <div className="mt-4 p-3 rounded-md bg-zinc-950/70 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-zinc-500">Weight: </span>
                    <span className="font-mono font-semibold text-zinc-200">
                      {measurement?.weight ? `${measurement.weight} kg` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Height: </span>
                    <span className="font-mono font-semibold text-zinc-200">
                      {measurement?.height ? `${measurement.height} cm` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Age: </span>
                    <span className="font-mono font-semibold text-zinc-200">
                      {measurement?.age ? `${measurement.age} yrs` : '—'}
                    </span>
                  </div>
                </div>
                <div className="text-zinc-400 font-mono text-[11px]">
                  Engine: <span className="text-emerald-400">Spring Boot REST API</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Training Sessions */}
          <Card className="bg-[#111114] border-zinc-800/90">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-orange-400" />
                  <span>Session History</span>
                </div>
                <CardTitle className="text-base font-semibold mt-1 text-zinc-100">
                  Recent Workout Logs
                </CardTitle>
              </div>
              <Link to="/history">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-orange-400 hover:text-orange-300 gap-1 h-8"
                >
                  <span>View All Logs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="pt-2">
              {recentWorkouts.length === 0 ? (
                <div className="text-center py-8 space-y-2 border border-dashed border-zinc-800/80 rounded-lg">
                  <Dumbbell className="w-8 h-8 mx-auto text-zinc-600" />
                  <div className="text-xs text-zinc-400 font-medium">No workout sessions logged yet</div>
                  <Link to="/log">
                    <Button size="sm" className="bg-orange-500 text-zinc-950 font-semibold text-xs h-8 mt-2">
                      Start First Workout
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentWorkouts.map((w) => (
                    <div
                      key={w.id}
                      className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/70 flex items-center justify-between hover:border-zinc-700 transition-colors"
                    >
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">{w.title}</div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                          <span>{new Date(w.date || w.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{w.exercises?.length || 0} exercises</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-orange-400">
                          {(w.totalVolumeKg || 0).toLocaleString()} kg
                        </div>
                        <div className="text-[10px] text-zinc-500">Total Volume</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Personal Records & Quick Training Metrics */}
        <div className="space-y-6">
          {/* Weekly Training Load */}
          <Card className="bg-[#111114] border-zinc-800/90">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                <span>Training Volume</span>
              </div>
              <CardTitle className="text-base font-semibold mt-1 text-zinc-100">
                Weekly Benchmark
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/70">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">Workouts (7d)</div>
                  <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                    {weeklyMetrics?.workoutCount || workouts.length}
                  </div>
                  <div className="text-[10px] text-zinc-500">Sessions</div>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/70">
                  <div className="text-[10px] font-mono text-zinc-400 uppercase">Volume (7d)</div>
                  <div className="text-2xl font-bold font-mono text-orange-400 mt-1">
                    {((weeklyMetrics?.totalVolumeKg || 0) / 1000).toFixed(1)}t
                  </div>
                  <div className="text-[10px] text-zinc-500">Total Tonnage</div>
                </div>
              </div>

              <div className="p-3 rounded-md bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-400">
                <div className="flex justify-between py-1">
                  <span>Sets Completed:</span>
                  <span className="font-mono text-zinc-200">{weeklyMetrics?.setCount || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-zinc-800/60">
                  <span>Total Workouts Logged:</span>
                  <span className="font-mono text-zinc-200">{workouts.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benchmark Personal Records (PRs) */}
          <Card className="bg-[#111114] border-zinc-800/90">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-orange-400" />
                  <span>Hall of Records</span>
                </div>
                <CardTitle className="text-base font-semibold mt-1 text-zinc-100">
                  Personal Records (PR)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              {prEntries.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">
                  Log exercises with weight & reps to populate your PR benchmark leaderboard.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {prEntries.map(([exerciseName, pr]) => (
                    <div
                      key={exerciseName}
                      className="p-2.5 rounded bg-zinc-900/60 border border-zinc-800/70 flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-medium text-zinc-200 truncate">{exerciseName}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {pr.reps} {pr.reps === 1 ? 'rep' : 'reps'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-orange-400 text-sm">
                          {pr.maxWeight} kg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Measurement & BMI Calculation Modal */}
      <MeasurementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}