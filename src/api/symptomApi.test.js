import { describe, expect, it, vi } from 'vitest'
import { createSymptomRecord } from './symptomApi.js'
import { apiRequest } from './client.js'

vi.mock('./client.js', () => ({
  apiRequest: vi.fn(),
}))

describe('symptom API', () => {
  it('creates a symptom record with the analysis input', () => {
    createSymptomRecord({
      symptomTypes: ['HEADACHE', 'FEVER'],
      startedAt: '2026-08-20T10:30:00.000Z',
      memo: '머리가 아픕니다.',
    })

    expect(apiRequest).toHaveBeenCalledWith('/api/symptoms/records', {
      method: 'POST',
      body: {
        symptomTypes: ['HEADACHE', 'FEVER'],
        startedAt: '2026-08-20T10:30:00.000Z',
        memo: '머리가 아픕니다.',
      },
    })
  })
})
