import { apiRequest } from './client.js'

export function login({ loginId, password }) {
  return apiRequest('/api/auth', {
    method: 'POST',
    body: { loginId, password },
  })
}

export function logout() {
  return apiRequest('/api/auth', { method: 'DELETE' })
}
