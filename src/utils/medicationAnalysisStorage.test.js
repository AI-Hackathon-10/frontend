import { beforeEach, describe, expect, it } from 'vitest'
import {
  MEDICATION_ANALYSIS_STORAGE_KEY,
  clearMedicationAnalysisResults,
  createMedicationAnalysisRunId,
  loadMedicationAnalysisSnapshot,
  loadMedicationAnalysisResults,
  saveMedicationAnalysisResults,
} from './medicationAnalysisStorage.js'

describe('medication analysis session storage', () => {
  beforeEach(() => sessionStorage.clear())

  it('flattens API result arrays before saving and restores them', () => {
    const first = { itemName: '첫 번째 약' }
    const second = { itemName: '두 번째 약' }

    expect(saveMedicationAnalysisResults([[first], { result: [second] }])).toEqual([first, second])
    expect(JSON.parse(sessionStorage.getItem(MEDICATION_ANALYSIS_STORAGE_KEY))).toEqual([first, second])
    expect(loadMedicationAnalysisResults()).toEqual([first, second])
  })

  it('removes saved analysis results', () => {
    sessionStorage.setItem(MEDICATION_ANALYSIS_STORAGE_KEY, JSON.stringify([{ itemName: '약' }]))
    clearMedicationAnalysisResults()
    expect(loadMedicationAnalysisResults()).toEqual([])
  })

  it('binds stored results to a unique analysis run', () => {
    const analysisRunId = createMedicationAnalysisRunId()
    const results = [{ itemName: '첫 번째 약' }, { itemName: '두 번째 약' }]

    saveMedicationAnalysisResults(results, { analysisRunId })

    expect(loadMedicationAnalysisSnapshot()).toEqual({ analysisRunId, results })
    expect(loadMedicationAnalysisResults()).toEqual(results)
  })
})
