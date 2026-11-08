import { apiRequest } from './client'

// Fallback catalog conforming to ExerciseResponseDto


export const exercisesApi = {
  async getExercises({ muscleGroup, equipment, search } = {}) {
    const params = new URLSearchParams()
    if (muscleGroup) params.append('muscleGroup', muscleGroup)
    if (equipment) params.append('equipment', equipment)
    if (search) params.append('search', search)

    const queryString = params.toString()
    const endpoint = queryString ? `/api/exercises/?${queryString}` : '/api/exercises'

    try {
      const data = await apiRequest(endpoint)
      if (Array.isArray(data) && data.length > 0) {
        return { data, source: 'backend' }
      }
    } catch (err) {
      console.warn('Backend exercise query failed, falling back to local library:', err.message)
    }

    // Filter fallback library to preserve full search & filter behavior
    let filtered = [...DEFAULT_EXERCISES]
    if (muscleGroup) {
      filtered = filtered.filter(e => e.primaryMuscle === muscleGroup || e.secondaryMuscles?.includes(muscleGroup))
    }
    if (equipment) {
      filtered = filtered.filter(e => e.equipment === equipment)
    }
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(e => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
    }

    return { data: filtered, source: 'catalog' }
  },

  async getExerciseById(id) {
    try {
      const data = await apiRequest(`/api/exercises/${id}`)
      if (data) return data
    } catch {
      // Fallback
    }
    return DEFAULT_EXERCISES.find(e => String(e.id) === String(id)) || null
  }
}
