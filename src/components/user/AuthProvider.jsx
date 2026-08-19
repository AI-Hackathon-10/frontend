import { createContext, useContext, useState } from 'react'
import { MOCK_USER_PROFILE } from '../../data/mockData.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [mockPassword, setMockPassword] = useState('')

  const login = ({ id, password }) => {
    setUser({ ...MOCK_USER_PROFILE, id })
    setMockPassword(password)
  }

  const logout = () => {
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
