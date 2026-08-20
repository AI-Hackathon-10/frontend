import { beforeEach, describe, expect, it } from 'vitest'
import {
  REPORT_CREATION_STORAGE_KEY,
  buildMedicationIdsByResultIndex,
  clearReportCreationContext,
  loadReportCreationContext,
  saveReportCreationContext,
  saveReportCreationProgress,
} from './reportCreationStorage.js'

describe('report creation session storage', () => {
  beforeEach(() => sessionStorage.clear())

  it('stores only the fields needed to create a report', () => {
    const context = saveReportCreationContext({
      analysisRunId: 'run-20260820-a',
      medicationIdsByResultIndex: [101, 101, 202, null],
      symptomTypes: ['HEADACHE', 'FEVER'],
      startedAt: '2026-08-20T10:30:00.000Z',
      memo: '머리가 아픕니다.',
      accessToken: 'must-not-be-saved',
      frontUploadUrl: 'https://example.com/presigned',
    })

    expect(context).toEqual({
      analysisRunId: 'run-20260820-a',
      medicationIdsByResultIndex: [101, 101, 202, null],
      symptomTypes: ['HEADACHE', 'FEVER'],
      startedAt: '2026-08-20T10:30:00.000Z',
      memo: '머리가 아픕니다.',
    })
    expect(JSON.parse(sessionStorage.getItem(REPORT_CREATION_STORAGE_KEY))).toEqual(context)
    expect(loadReportCreationContext()).toEqual(context)
  })

  it('maps one medication id to every candidate returned for that upload', () => {
    expect(buildMedicationIdsByResultIndex([
      { medicationId: 101, results: [{ itemName: '후보 A' }, { itemName: '후보 B' }] },
      { medicationId: 202, results: [{ itemName: '후보 C' }] },
      { medicationId: null, results: [{ ok: false }] },
    ])).toEqual([101, 101, 202, null])
  })

  it('removes invalid or explicitly cleared context', () => {
    sessionStorage.setItem(REPORT_CREATION_STORAGE_KEY, '{invalid-json')

    expect(loadReportCreationContext()).toBeNull()
    expect(sessionStorage.getItem(REPORT_CREATION_STORAGE_KEY)).toBeNull()

    saveReportCreationContext({
      analysisRunId: 'run-20260820-a',
      medicationIdsByResultIndex: [101],
      symptomTypes: ['HEADACHE'],
      startedAt: '2026-08-20T10:30:00.000Z',
      memo: '',
    })
    clearReportCreationContext()

    expect(loadReportCreationContext()).toBeNull()
  })

  it('rejects invalid symptom types and timestamps before they can be used', () => {
    expect(saveReportCreationContext({
      analysisRunId: 'run-20260820-a',
      medicationIdsByResultIndex: [101],
      symptomTypes: ['NOT_A_REAL_SYMPTOM'],
      startedAt: 'not-a-date',
      memo: '',
    })).toBeNull()
    expect(loadReportCreationContext()).toBeNull()
  })

  it('rejects duplicate symptom types', () => {
    expect(saveReportCreationContext({
      analysisRunId: 'run-20260820-a',
      medicationIdsByResultIndex: [101],
      symptomTypes: ['HEADACHE', 'HEADACHE'],
      startedAt: '2026-08-20T10:30:00.000Z',
      memo: '',
    })).toBeNull()
    expect(loadReportCreationContext()).toBeNull()
  })

  it('persists completed write steps so a retry can resume', () => {
    saveReportCreationContext({
      analysisRunId: 'run-20260820-a',
      medicationIdsByResultIndex: [101],
      symptomTypes: ['HEADACHE'],
      startedAt: '2026-08-20T10:30:00.000Z',
      memo: '',
    })

    saveReportCreationProgress({
      analysisRunId: 'run-20260820-a',
      resultIndex: 0,
      medicationId: 101,
      symptomRecordId: 17,
      intakeRecorded: true,
    })

    expect(loadReportCreationContext()?.progressByResultIndex).toEqual({
      0: { medicationId: 101, symptomRecordId: 17, intakeRecorded: true },
    })
  })
})
