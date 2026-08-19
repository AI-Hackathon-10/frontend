import { clearSession, getAccessToken, getRefreshToken, loadSession, saveSession } from './session.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''
const REISSUE_PATH = '/api/auth/reissue'

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

let onSessionExpired = null

export function setOnSessionExpired(handler) {
  onSessionExpired = handler
}

async function sendRequest(path, { method, body, headers, accessToken, ...rest }) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  })

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  return { response, data }
}

let reissuePromise = null

function reissueAccessToken() {
  if (!reissuePromise) {
    reissuePromise = (async () => {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        throw new ApiError('로그인이 필요합니다.', 401, 'NO_REFRESH_TOKEN')
      }

      const { response, data } = await sendRequest(REISSUE_PATH, {
        method: 'POST',
        body: { refreshToken },
      })

      const newAccessToken = data?.result?.accessToken
      if (!response.ok || data?.isSuccess === false || !newAccessToken) {
        throw new ApiError(data?.message ?? '세션이 만료되었습니다. 다시 로그인해 주세요.', response.status, data?.code)
      }

      saveSession({
        accessToken: newAccessToken,
        refreshToken: data.result.refreshToken ?? refreshToken,
        loginId: loadSession()?.loginId,
      })

      return newAccessToken
    })().finally(() => {
      reissuePromise = null
    })
  }

  return reissuePromise
}

export async function apiRequest(path, { method = 'GET', body, headers, ...rest } = {}) {
  const { response, data } = await sendRequest(path, { method, body, headers, accessToken: getAccessToken(), ...rest })

  if (response.status === 401 && path !== REISSUE_PATH) {
    let newAccessToken
    try {
      newAccessToken = await reissueAccessToken()
    } catch {
      clearSession()
      onSessionExpired?.()
      throw new ApiError('세션이 만료되었습니다. 다시 로그인해 주세요.', 401, 'SESSION_EXPIRED')
    }

    const retry = await sendRequest(path, { method, body, headers, accessToken: newAccessToken, ...rest })
    if (!retry.response.ok || retry.data?.isSuccess === false) {
      throw new ApiError(retry.data?.message ?? '요청을 처리하지 못했습니다.', retry.response.status, retry.data?.code)
    }

    return retry.data?.result
  }

  if (!response.ok || data?.isSuccess === false) {
    throw new ApiError(data?.message ?? '요청을 처리하지 못했습니다.', response.status, data?.code)
  }

  return data?.result
}
