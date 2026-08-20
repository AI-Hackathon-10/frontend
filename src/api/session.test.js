import { beforeEach, describe, expect, it } from 'vitest'
import { clearSession, saveSession } from './session.js'
import { loadMedicationAnalysisResults, saveMedicationAnalysisResults } from '../utils/medicationAnalysisStorage.js'
import { loadReportCreationContext, saveReportCreationContext } from '../utils/reportCreationStorage.js'

function saveTransientContext() {
  saveMedicationAnalysisResults([{ itemName: '약' }], { analysisRunId: 'run-a' })
  saveReportCreationContext({
    analysisRunId: 'run-a',
    medicationIdsByResultIndex: [29],
    symptomTypes: ['HEADACHE'],
    startedAt: '2026-08-20T10:30:00.000Z',
    memo: '',
  })
}

describe('auth session transient analysis cleanup', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('keeps transient data on token refresh but clears it when the login identity changes', () => {
    saveSession({ accessToken: 'token-a', refreshToken: 'refresh-a', loginId: 'user-a' })
    saveTransientContext()

    saveSession({ accessToken: 'token-a2', refreshToken: 'refresh-a', loginId: 'user-a' })
    expect(loadReportCreationContext()).not.toBeNull()

    saveSession({ accessToken: 'token-b', refreshToken: 'refresh-b', loginId: 'user-b' })
    expect(loadReportCreationContext()).toBeNull()
    expect(loadMedicationAnalysisResults()).toEqual([])
  })

  it('clears transient data on logout or session expiry', () => {
    saveSession({ accessToken: 'token-a', refreshToken: 'refresh-a', loginId: 'user-a' })
    saveTransientContext()

    clearSession()

    expect(loadReportCreationContext()).toBeNull()
    expect(loadMedicationAnalysisResults()).toEqual([])
  })
})
