import { apiRequest } from './client.js'

export function createSymptomRecord({ symptomTypes, startedAt, memo }) {
  return apiRequest('/api/symptoms/records', {
    method: 'POST',
    body: { symptomTypes, startedAt, memo },
  })
}
