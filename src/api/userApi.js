import { apiRequest } from './client.js'

export function signUp({ name, loginId, password, gender, birthDate }) {
  return apiRequest('/api/user', {
    method: 'POST',
    body: { name, loginId, password, gender, birthDate },
  })
}
