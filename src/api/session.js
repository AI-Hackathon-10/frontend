import { clearMedicationAnalysisResults } from '../utils/medicationAnalysisStorage.js'
import { clearReportCreationContext } from '../utils/reportCreationStorage.js'

const STORAGE_KEY = 'pillcare.session'

function clearTransientAnalysisData() {
  clearMedicationAnalysisResults()
  clearReportCreationContext()
}

function decodeAccessToken(accessToken) {
  const payload = accessToken?.split('.')[1]
  if (!payload) return null

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function saveSession({ accessToken, refreshToken, loginId }) {
  const previousSession = loadSession()
  if (!previousSession || previousSession.loginId !== loginId) {
    clearTransientAnalysisData()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken, refreshToken, loginId }))
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
  clearTransientAnalysisData()
}

export function loadSession() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function getAccessToken() {
  return loadSession()?.accessToken ?? null
}

export function getRefreshToken() {
  return loadSession()?.refreshToken ?? null
}

export function getUserFromSession() {
  const session = loadSession()
  if (!session?.accessToken) return null

  const claims = decodeAccessToken(session.accessToken)
  if (!claims || (claims.exp && Date.now() >= claims.exp * 1000)) {
    clearSession()
    return null
  }

  return {
    userId: Number(claims.sub),
    name: claims.name,
    id: session.loginId,
  }
}

export function mapUserInfo(userInfo) {
  return {
    userId: userInfo.userId,
    id: userInfo.loginId,
    name: userInfo.name,
    gender: userInfo.gender,
    birthDate: userInfo.birthDate,
  }
}
