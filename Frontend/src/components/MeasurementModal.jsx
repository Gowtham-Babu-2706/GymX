import React, { useState, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ACTIVITY_MULTIPLIERS, 
  getBmiCategory, 
  calculateLocalMetrics 
} from '@/api/measurements'
import { 
  X, 
  Scale, 
  Ruler, 
  Check, 
  AlertCircle, 
  Sparkles,
  Info
} from 'lucide-react'

export function MeasurementModal({ isOpen, onClose, onSuccess }) {
  const { measurement, saveMeasurement, token } = useApp()

  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    isFemale: false,
    age: '',
    bodyFat: '',
    neckMeasurement: '',
    chestMeasurement: '',
    shoulderMeasurement: '',
    waistMeasurement: '',
    hipMeasurement: '',
  })

  const [activityMultiplier, setActivityMultiplier] = useState(1.55)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Populate existing measurement if available
  useEffect(() => {
    if (measurement) {
      setFormData({
        weight: measurement.weight != null ? String(measurement.weight) : '',
        height: measurement.height != null ? String(measurement.height) : '',
        isFemale: measurement.isFemale != null ? Boolean(measurement.isFemale) : false,
        age: measurement.age != null ? String(measurement.age) : '',
        bodyFat: measurement.bodyFat != null ? String(measurement.bodyFat) : '',
        neckMeasurement: measurement.neckMeasurement != null ? String(measurement.neckMeasurement) : '',
        chestMeasurement: measurement.chestMeasurement != null ? String(measurement.chestMeasurement) : '',
        shoulderMeasurement: measurement.shoulderMeasurement != null ? String(measurement.shoulderMeasurement) : '',
        waistMeasurement: measurement.waistMeasurement != null ? String(measurement.waistMeasurement) : '',
        hipMeasurement: measurement.hipMeasurement != null ? String(measurement.hipMeasurement) : '',
      })
      if (measurement.activityMultiplier) {
        setActivityMultiplier(measurement.activityMultiplier)
      }
    }
  }, [measurement, isOpen])

  // Reset notifications on modal open
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setSuccessMsg(null)
    }
  }, [isOpen])

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setError(null)
  }

  // Live calculation preview
  const livePreview = calculateLocalMetrics(formData, activityMultiplier)
  const bmiCategory = getBmiCategory(livePreview.bmi)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.weight || Number(formData.weight) <= 0) {
      setError('Please provide a valid weight in kg.')
      return
    }
    if (!formData.height || Number(formData.height) <= 0) {
      setError('Please provide a valid height in cm.')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await saveMeasurement(formData, activityMultiplier)
      setSuccessMsg('Measurements and BMI metrics updated successfully!')
      setTimeout(() => {
        if (onSuccess) onSuccess(res)
        onClose()
      }, 700)
    } catch (err) {
      console.error('Save measurement failed:', err)
      setError(err.message || 'Failed to calculate and save measurements.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#111114] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-100 flex items-center gap-2">
                Body Measurements & Composition
                <span className="text-[10px] font-mono font-normal uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  API Integrated
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Log your body dimensions to calculate BMI, BMR, TDEE and health ratios.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-md bg-red-950/50 border border-red-900/60 text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-md bg-emerald-950/50 border border-emerald-900/60 text-emerald-300">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {!token && (
            <div className="flex items-start gap-2.5 p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-semibold">Guest Mode:</span> You can calculate metrics instantly right here. Sign in to permanently sync and track historical changes to your cloud profile!
              </div>
            </div>
          )}

          {/* Real-time Calculation Preview Card */}
          <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Live Composition Preview</span>
              </div>
              {livePreview.bmi && (
                <Badge variant={bmiCategory.badgeVariant}>
                  {bmiCategory.label}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">BMI</div>
                <div className="text-lg font-bold font-mono text-zinc-100">
                  {livePreview.bmi ? livePreview.bmi : '—'}
                </div>
                <div className="text-[10px] text-zinc-500 truncate">kg / m²</div>
              </div>

              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">BMR (Base)</div>
                <div className="text-lg font-bold font-mono text-orange-400">
                  {livePreview.bmr ? `${Math.round(livePreview.bmr)}` : '—'}
                </div>
                <div className="text-[10px] text-zinc-500 truncate">kcal / day</div>
              </div>

              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">TDEE (Daily)</div>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {livePreview.tdee ? `${livePreview.tdee}` : '—'}
                </div>
                <div className="text-[10px] text-zinc-500 truncate">maintenance kcal</div>
              </div>

              <div className="p-2.5 rounded bg-zinc-950/60 border border-zinc-800/60">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Waist/Height</div>
                <div className="text-lg font-bold font-mono text-zinc-100">
                  {livePreview.waistHeightRatio ? livePreview.waistHeightRatio : '—'}
                </div>
                <div className="text-[10px] text-zinc-500 truncate">ratio</div>
              </div>
            </div>
          </div>

          <form id="measurement-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Core Biometrics */}
            <div>
              <div className="text-xs font-mono text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>1. Core Biometrics</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Weight (kg) <span className="text-orange-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 75"
                    required
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Height (cm) <span className="text-orange-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="1"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="e.g. 180"
                    required
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Age (Years)
                  </label>
                  <Input
                    type="number"
                    step="1"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 26"
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Biological Sex
                  </label>
                  <div className="grid grid-cols-2 gap-2 h-9">
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, isFemale: false }))}
                      className={`px-3 rounded text-xs font-medium border transition-colors flex items-center justify-center cursor-pointer ${
                        !formData.isFemale
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, isFemale: true }))}
                      className={`px-3 rounded text-xs font-medium border transition-colors flex items-center justify-center cursor-pointer ${
                        formData.isFemale
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Estimated Body Fat (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    name="bodyFat"
                    value={formData.bodyFat}
                    onChange={handleChange}
                    placeholder="e.g. 15.0"
                    className="bg-zinc-900 border-zinc-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Activity Multiplier (TDEE)
                  </label>
                  <select
                    value={activityMultiplier}
                    onChange={(e) => setActivityMultiplier(parseFloat(e.target.value))}
                    className="w-full h-9 px-3 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    {ACTIVITY_MULTIPLIERS.map((act) => (
                      <option key={act.value} value={act.value}>
                        {act.label} ({act.value}x)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Circumference Measurements (cm) */}
            <div className="border-t border-zinc-800 pt-4">
              <div className="text-xs font-mono text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                <span>2. Circumference Dimensions (cm - Optional)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Neck (cm)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    name="neckMeasurement"
                    value={formData.neckMeasurement}
                    onChange={handleChange}
                    placeholder="e.g. 38"
                    className="bg-zinc-900 border-zinc-800 h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Chest (cm)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    name="chestMeasurement"
                    value={formData.chestMeasurement}
                    onChange={handleChange}
                    placeholder="e.g. 102"
                    className="bg-zinc-900 border-zinc-800 h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Shoulders (cm)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    name="shoulderMeasurement"
                    value={formData.shoulderMeasurement}
                    onChange={handleChange}
                    placeholder="e.g. 118"
                    className="bg-zinc-900 border-zinc-800 h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Waist (cm)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    name="waistMeasurement"
                    value={formData.waistMeasurement}
                    onChange={handleChange}
                    placeholder="e.g. 82"
                    className="bg-zinc-900 border-zinc-800 h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Hips (cm)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    name="hipMeasurement"
                    value={formData.hipMeasurement}
                    onChange={handleChange}
                    placeholder="e.g. 96"
                    className="bg-zinc-900 border-zinc-800 h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-zinc-950/80">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-zinc-400 hover:text-zinc-200"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="measurement-form"
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-400 text-zinc-950 font-semibold text-xs h-9 px-4 gap-1.5 shadow-md shadow-orange-500/10"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Calculate & Save Metrics
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
