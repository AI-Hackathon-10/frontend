import { describe, expect, it, vi } from 'vitest'
import { markMedicationTaken } from './medicationApi.js'
import { apiRequest } from './client.js'

vi.mock('./client.js', () => ({
  ApiError: class ApiError extends Error {},
  apiRequest: vi.fn(),
}))

describe('medication API', () => {
  it('records medication intake for the selected medication', () => {
    markMedicationTaken(29)

    expect(apiRequest).toHaveBeenCalledWith('/api/medications/29/intake', {
      method: 'POST',
      body: {},
    })
  })
})
