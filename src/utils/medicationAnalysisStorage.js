export const MEDICATION_ANALYSIS_STORAGE_KEY = 'medicationAnalysisResult'

export function normalizeMedicationResults(value) {
  if (Array.isArray(value)) return value.flatMap(normalizeMedicationResults)
  if (Array.isArray(value?.result)) return normalizeMedicationResults(value.result)
  if (value && typeof value === 'object' && !Array.isArray(value)) return [value]
  return []
}

export function saveMedicationAnalysisResults(value) {
  const results = normalizeMedicationResults(value)
  if (!results.length) return []

  try {
    sessionStorage.setItem(MEDICATION_ANALYSIS_STORAGE_KEY, JSON.stringify(results))
  } catch {
    // Navigation state still carries the same real response when storage is unavailable.
  }
  return results
}

export function loadMedicationAnalysisResults() {
  let saved
  try {
    saved = sessionStorage.getItem(MEDICATION_ANALYSIS_STORAGE_KEY)
  } catch {
    return []
  }
  if (!saved) return []

  try {
    return normalizeMedicationResults(JSON.parse(saved))
  } catch {
    sessionStorage.removeItem(MEDICATION_ANALYSIS_STORAGE_KEY)
    return []
  }
}

export function clearMedicationAnalysisResults() {
  try {
    sessionStorage.removeItem(MEDICATION_ANALYSIS_STORAGE_KEY)
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}
