import { isMedicationSymptomType } from '../data/medicationSymptoms.js'

export const REPORT_CREATION_STORAGE_KEY = 'reportCreationContext'

function isMedicationId(value) {
  return Number.isSafeInteger(value) && value > 0
}

function isAnalysisRunId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 128
}

function isInstant(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T/.test(value)
    && /(Z|[+-]\d{2}:\d{2})$/.test(value)
    && !Number.isNaN(Date.parse(value))
}

function normalizeProgress(progressByResultIndex, medicationIds) {
  if (progressByResultIndex === undefined) return { valid: true, value: undefined }
  if (!progressByResultIndex || typeof progressByResultIndex !== 'object' || Array.isArray(progressByResultIndex)) {
    return { valid: false }
  }

  const normalized = {}
  for (const [key, progress] of Object.entries(progressByResultIndex)) {
    const resultIndex = Number(key)
    if (!Number.isSafeInteger(resultIndex) || resultIndex < 0 || resultIndex >= medicationIds.length) {
      return { valid: false }
    }
    if (!progress || typeof progress !== 'object' || Array.isArray(progress)) return { valid: false }
    if (!isMedicationId(progress.medicationId) || progress.medicationId !== medicationIds[resultIndex]) return { valid: false }
    if (!Number.isSafeInteger(progress.symptomRecordId) || progress.symptomRecordId <= 0) return { valid: false }
    if (typeof progress.intakeRecorded !== 'boolean') return { valid: false }

    normalized[resultIndex] = {
      medicationId: progress.medicationId,
      symptomRecordId: progress.symptomRecordId,
      intakeRecorded: progress.intakeRecorded,
    }
  }

  return {
    valid: true,
    value: Object.keys(normalized).length ? normalized : undefined,
  }
}

function normalizeReportCreationContext(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  if (!isAnalysisRunId(value.analysisRunId)) return null
  if (!Array.isArray(value.medicationIdsByResultIndex) || !value.medicationIdsByResultIndex.length) return null
  if (!value.medicationIdsByResultIndex.every((id) => id === null || isMedicationId(id))) return null
  if (!Array.isArray(value.symptomTypes) || !value.symptomTypes.length || value.symptomTypes.length > 10) return null
  if (!value.symptomTypes.every(isMedicationSymptomType)) return null
  if (new Set(value.symptomTypes).size !== value.symptomTypes.length) return null
  if (!isInstant(value.startedAt)) return null
  if (value.memo !== undefined && (typeof value.memo !== 'string' || value.memo.length > 10000)) return null

  const progress = normalizeProgress(value.progressByResultIndex, value.medicationIdsByResultIndex)
  if (!progress.valid) return null

  const context = {
    analysisRunId: value.analysisRunId,
    medicationIdsByResultIndex: [...value.medicationIdsByResultIndex],
    symptomTypes: [...value.symptomTypes],
    startedAt: value.startedAt,
    memo: typeof value.memo === 'string' ? value.memo : '',
  }
  if (progress.value) context.progressByResultIndex = progress.value
  return context
}

export function buildMedicationIdsByResultIndex(groups) {
  if (!Array.isArray(groups)) return []

  return groups.flatMap((group) => {
    const results = Array.isArray(group?.results) ? group.results : []
    const medicationId = isMedicationId(group?.medicationId) ? group.medicationId : null
    return results.map(() => medicationId)
  })
}

export function saveReportCreationContext(value) {
  const context = normalizeReportCreationContext(value)
  if (!context) {
    clearReportCreationContext()
    return null
  }

  try {
    sessionStorage.setItem(REPORT_CREATION_STORAGE_KEY, JSON.stringify(context))
  } catch {
    // The current navigation can still continue even when browser storage is unavailable.
  }
  return context
}

export function saveReportCreationProgress({
  analysisRunId,
  resultIndex,
  medicationId,
  symptomRecordId,
  intakeRecorded,
}) {
  const context = loadReportCreationContext()
  if (!context || context.analysisRunId !== analysisRunId) return null
  if (!Number.isSafeInteger(resultIndex) || resultIndex < 0 || resultIndex >= context.medicationIdsByResultIndex.length) return null
  if (context.medicationIdsByResultIndex[resultIndex] !== medicationId) return null

  return saveReportCreationContext({
    ...context,
    progressByResultIndex: {
      ...context.progressByResultIndex,
      [resultIndex]: {
        medicationId,
        symptomRecordId,
        intakeRecorded,
      },
    },
  })
}

export function loadReportCreationContext() {
  let saved
  try {
    saved = sessionStorage.getItem(REPORT_CREATION_STORAGE_KEY)
  } catch {
    return null
  }
  if (!saved) return null

  try {
    const context = normalizeReportCreationContext(JSON.parse(saved))
    if (context) return context
  } catch {
    // Invalid session data is cleared below.
  }

  clearReportCreationContext()
  return null
}

export function clearReportCreationContext() {
  try {
    sessionStorage.removeItem(REPORT_CREATION_STORAGE_KEY)
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}
