import { describe, expect, it, vi } from 'vitest'
import { getReport, getReports } from './reportApi.js'
import { apiRequest } from './client.js'

vi.mock('./client.js', () => ({
  apiRequest: vi.fn(),
}))

describe('report API', () => {
  it('requests the authenticated user report list', () => {
    getReports()

    expect(apiRequest).toHaveBeenCalledWith('/api/reports')
  })

  it('requests one authenticated user report by id', () => {
    getReport(42)

    expect(apiRequest).toHaveBeenCalledWith('/api/reports/42')
  })
})
