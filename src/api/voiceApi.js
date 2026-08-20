import { getAccessToken } from './session.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

function authHeaders() {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function transcribeAudio(audioBlob) {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')

  const res = await fetch(`${BASE_URL}/api/voice/transcribe`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  })

  if (!res.ok) throw new Error('음성 인식에 실패했습니다.')
  const json = await res.json()
  return json.result
}

export async function recommendByVoice(symptomText, onsetText) {
  const res = await fetch(`${BASE_URL}/api/voice/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ symptomText, onsetText }),
  })

  if (!res.ok) throw new Error('추천 요청에 실패했습니다.')
  const json = await res.json()
  return json.result
}

export async function synthesizeSpeech(text) {
  const res = await fetch(`${BASE_URL}/api/voice/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) throw new Error('음성 합성에 실패했습니다.')
  return await res.blob()
}
