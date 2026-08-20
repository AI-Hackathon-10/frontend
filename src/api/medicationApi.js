import { apiRequest } from './client.js'

export function getPresignedUrl() {
  return apiRequest('/api/medications/upload/presigned-url', {
    method: 'POST',
    body: {},
  })
}

export function identifyMedication({ requestId, symptoms }) {
  return apiRequest('/api/medications/identify', {
    method: 'POST',
    body: { requestId, symptoms },
  })
}