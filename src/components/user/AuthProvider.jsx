import { createContext, useContext, useEffect, useState } from 'react'
import { login as loginRequest, logout as logoutRequest, me as meRequest } from '../../api/authApi.js'
import { setOnSessionExpired } from '../../api/client.js'
import { clearSession, getAccessToken, getUserFromSession, mapUserInfo, saveSession } from '../../api/session.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUserFromSession())
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const [mockPassword, setMockPassword] = useState('')

  useEffect(() => {
    setOnSessionExpired(() => {
      setUser(null)
      setMockPassword('')
    })
    return () => setOnSessionExpired(null)
  }, [])

  useEffect(() => {
    let cancelled = false

    if (!getAccessToken()) {
      setIsAuthChecked(true)
      return undefined
    }

    meRequest()
      .then((userInfo) => {
        if (!cancelled) setUser(mapUserInfo(userInfo))
      })
      .catch(() => {
        if (!cancelled) {
          clearSession()
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setIsAuthChecked(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = async ({ id, password }) => {
    const { accessToken, refreshToken } = await loginRequest({ loginId: id, password })
    saveSession({ accessToken, refreshToken, loginId: id })
    const userInfo = await meRequest()
    setUser(mapUserInfo(userInfo))
    setIsAuthChecked(true)
    setMockPassword(password)
  }

  const logout = () => {
    logoutRequest().catch(() => {})
    clearSession()
    setUser(null)
    setMockPassword('')
  }

  const changePassword = (currentPassword, newPassword) => {
    if (!user || currentPassword !== mockPassword) return false

    setMockPassword(newPassword)
    return true
  }

  return (
    <AuthContext.Provider value={{ user, isAuthChecked, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
