/**
 * GymX Body Measurement & Composition API Client
 * 
 * Connected to Spring Boot REST API:
 *   - GET  /api/body            (get user's current measurements & metrics)
 *   - POST /api/body/calculate  (save & calculate BMI, BMR, TDEE, ratios)
 */

import { apiRequest, ApiError } from './client'
import { authApi } from './auth'

export const ACTIVITY_MULTIPLIERS = [
  { value: 1.2, label: 'Sedentary', desc: 'Little to no exercise, desk job' },
  { value: 1.375, label: 'Light Exercise', desc: 'Light workouts 1-3 days/week' },
  { value: 1.55, label: 'Moderate Training', desc: 'Moderate exercise 3-5 days/week' },
  { value: 1.725, label: 'Heavy Training', desc: 'Hard training 6-7 days/week' },
  { value: 1.9, label: 'Athlete / Physical Job', desc: 'Intense daily training or physical job' },
]

export function getBmiCategory(bmi) {
  if (!bmi || isNaN(bmi)) return { label: 'Unknown', color: 'text-zinc-400', badgeVariant: 'outline', desc: 'Enter height and weight' }
  const val = Number(bmi)
  if (val < 18.5) {
    return {
      label: 'Underweight',
      color: 'text-sky-400',
      badgeVariant: 'secondary',
      desc: 'Below standard body mass threshold (< 18.5). Consider caloric surplus for hypertrophy.',
    }
  }
  if (val < 25) {
    return {
      label: 'Normal Weight',
      color: 'text-emerald-400',
      badgeVariant: 'success',
      desc: 'Healthy body mass index range (18.5 - 24.9). Optimal baseline for athletic conditioning.',
    }
  }
  if (val < 30) {
    return {
      label: 'Overweight',
      color: 'text-amber-400',
      badgeVariant: 'warning',
      desc: 'Above standard threshold (25.0 - 29.9). Common for muscular strength athletes.',
    }
  }
  return {
    label: 'Obese',
    color: 'text-red-400',
    badgeVariant: 'danger',
    desc: 'High body mass index range (≥ 30.0). Focus on sustainable deficit and resistance training.',
  }
}

export function getWaistToHeightCategory(ratio) {
  if (!ratio || isNaN(ratio)) return null
  const val = Number(ratio)
  if (val < 0.4) return { label: 'Below Ideal', color: 'text-sky-400', badgeVariant: 'secondary' }
  if (val <= 0.49) return { label: 'Optimal Health', color: 'text-emerald-400', badgeVariant: 'success' }
  if (val <= 0.59) return { label: 'Increased Risk', color: 'text-amber-400', badgeVariant: 'warning' }
  return { label: 'High Risk', color: 'text-red-400', badgeVariant: 'danger' }
}

export function getWaistToHipCategory(ratio, isFemale = true) {
  if (!ratio || isNaN(ratio)) return null
  const val = Number(ratio)
  if (isFemale) {
    if (val <= 0.8) return { label: 'Low Risk', color: 'text-emerald-400', badgeVariant: 'success' }
    if (val <= 0.84) return { label: 'Moderate Risk', color: 'text-amber-400', badgeVariant: 'warning' }
    return { label: 'High Risk', color: 'text-red-400', badgeVariant: 'danger' }
  } else {
    if (val <= 0.9) return { label: 'Low Risk', color: 'text-emerald-400', badgeVariant: 'success' }
    if (val <= 0.99) return { label: 'Moderate Risk', color: 'text-amber-400', badgeVariant: 'warning' }
    return { label: 'High Risk', color: 'text-red-400', badgeVariant: 'danger' }
  }
}

export function calculateLocalMetrics(data, activityMultiplier = 1.55) {
  const weight = Number(data.weight) || 0
  const height = Number(data.height) || 0
  const age = Number(data.age) || 0
  const isFemale = Boolean(data.isFemale)
  const waist = Number(data.waistMeasurement) || 0
  const hip = Number(data.hipMeasurement) || 0

  let bmi = null
  if (weight > 0 && height > 0) {
    const hM = height / 100
    bmi = Number((weight / (hM * hM)).toFixed(2))
  }

  let bmr = null
  if (weight > 0 && height > 0 && age > 0) {
    const baseBmr = 10 * weight + 6.25 * height - 5 * age
    bmr = Number((isFemale ? baseBmr - 161 : baseBmr + 5).toFixed(1))
  }

  let tdee = null
  if (bmr && activityMultiplier) {
    tdee = Math.round(bmr * activityMultiplier)
  }

  let waistHipRatio = null
  if (waist > 0 && hip > 0) {
    waistHipRatio = Number((waist / hip).toFixed(3))
  }

  let waistHeightRatio = null
  if (waist > 0 && height > 0) {
    waistHeightRatio = Number((waist / height).toFixed(3))
  }

  return { bmi, bmr, tdee, waistHipRatio, waistHeightRatio }
}

export const measurementsApi = {
  /**
   * Fetch current user's body measurements from backend
   */
  async getMeasurement() {
    const token = authApi.getStoredToken()
    if (!token) {
      // Guest fallback to localStorage
      try {
        const local = localStorage.getItem('gymx_guest_measurement')
        return local ? JSON.parse(local) : null
      } catch {
        return null
      }
    }

    try {
      const data = await apiRequest('/api/body', { method: 'GET' })
      return data
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
        return null
      }
      // If unauthorized, return null
      if (err.status === 401 || err.status === 403) {
        return null
      }
      throw err
    }
  },

  /**
   * Save body measurement & calculate composition metrics
   */
  async calculateMeasurement(formData, activityMultiplier = 1.55) {
    const token = authApi.getStoredToken()

    const payload = {
      weight: formData.weight ? parseInt(formData.weight, 10) : null,
      height: formData.height ? parseInt(formData.height, 10) : null,
      isFemale: formData.isFemale !== undefined ? Boolean(formData.isFemale) : true,
      age: formData.age ? parseInt(formData.age, 10) : null,
      bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
      neckMeasurement: formData.neckMeasurement ? parseFloat(formData.neckMeasurement) : null,
      chestMeasurement: formData.chestMeasurement ? parseFloat(formData.chestMeasurement) : null,
      shoulderMeasurement: formData.shoulderMeasurement ? parseFloat(formData.shoulderMeasurement) : null,
      waistMeasurement: formData.waistMeasurement ? parseFloat(formData.waistMeasurement) : null,
      hipMeasurement: formData.hipMeasurement ? parseFloat(formData.hipMeasurement) : null,
    }

    if (!token) {
      // Local calculation for unauthenticated / guest users
      const calculated = calculateLocalMetrics(payload, activityMultiplier)
      const completeRecord = {
        ...payload,
        ...calculated,
        activityMultiplier,
        measuredAt: new Date().toISOString(),
      }
      localStorage.setItem('gymx_guest_measurement', JSON.stringify(completeRecord))
      return completeRecord
    }

    // Call Spring Boot backend
    const response = await apiRequest('/api/body/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    // Compute TDEE if backend tdee is null
    const computedTdee = response.tdee || (response.bmr ? Math.round(response.bmr * activityMultiplier) : null)

    return {
      ...payload,
      bmi: response.bmi,
      bmr: response.bmr,
      tdee: computedTdee,
      waistHipRatio: response.waistHipRatio,
      waistHeightRatio: response.waistHeightRatio,
      activityMultiplier,
      measuredAt: new Date().toISOString(),
    }
  },
}
