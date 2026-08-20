import { apiRequest } from './client.js'

export function getReports() {
  return apiRequest('/api/reports')
}

export function getReport(reportId) {
  return apiRequest(`/api/reports/${reportId}`)
}
