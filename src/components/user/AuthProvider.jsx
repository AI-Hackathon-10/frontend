import { createContext, useContext, useEffect, useState } from 'react'
import { login as loginRequest, logout as logoutRequest } from '../../api/authApi.js'
import { setOnSessionExpired } from '../../api/client.js'
import { clearSession, getUserFromSession, saveSession } from '../../api/session.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUserFromSession())
  const [mockPassword, setMockPassword] = useState('')

  useEffect(() => {
    setOnSessionExpired(() => {
      setUser(null)
      setMockPassword('')
    })
    return () => setOnSessionExpired(null)
  }, [])

  const login = async ({ id, password }) => {
    const { accessToken, refreshToken } = await loginRequest({ loginId: id, password })
    saveSession({ accessToken, refreshToken, loginId: id })
    setUser(getUserFromSession())
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
    <AuthContext.Provider value={{ user, login, logout, changePassword }}>
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
