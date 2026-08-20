export const MEDICATION_ANALYSIS_STORAGE_KEY = 'medicationAnalysisResult'

function isAnalysisRunId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 128
}

export function normalizeMedicationResults(value) {
  if (Array.isArray(value)) return value.flatMap(normalizeMedicationResults)
  if (Array.isArray(value?.result)) return normalizeMedicationResults(value.result)
  if (value && typeof value === 'object' && !Array.isArray(value)) return [value]
  return []
}

export function createMedicationAnalysisRunId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function saveMedicationAnalysisResults(value, { analysisRunId } = {}) {
  const results = normalizeMedicationResults(value)
  if (!results.length) return []

  try {
    const storedValue = isAnalysisRunId(analysisRunId)
      ? { analysisRunId, results }
      : results
    sessionStorage.setItem(MEDICATION_ANALYSIS_STORAGE_KEY, JSON.stringify(storedValue))
  } catch {
    // Navigation state still carries the same real response when storage is unavailable.
  }
  return results
}

export function loadMedicationAnalysisSnapshot() {
  let saved
  try {
    saved = sessionStorage.getItem(MEDICATION_ANALYSIS_STORAGE_KEY)
  } catch {
    return { analysisRunId: null, results: [] }
  }
  if (!saved) return { analysisRunId: null, results: [] }

  try {
    const parsed = JSON.parse(saved)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.results)) {
      return {
        analysisRunId: isAnalysisRunId(parsed.analysisRunId) ? parsed.analysisRunId : null,
        results: normalizeMedicationResults(parsed.results),
      }
    }

    return { analysisRunId: null, results: normalizeMedicationResults(parsed) }
  } catch {
    sessionStorage.removeItem(MEDICATION_ANALYSIS_STORAGE_KEY)
    return { analysisRunId: null, results: [] }
  }
}

export function loadMedicationAnalysisResults() {
  return loadMedicationAnalysisSnapshot().results
}

export function clearMedicationAnalysisResults() {
  try {
    sessionStorage.removeItem(MEDICATION_ANALYSIS_STORAGE_KEY)
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}
