import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decoded = decodeJwt(token)
      if (decoded) {
        setUser({
          token,
          name: decoded.name || localStorage.getItem('userName') || '',
          email: decoded.email,
          id: decoded.id,
        })
      }
    }
    setLoading(false)
  }, [])

  const login = (token, name) => {
    localStorage.setItem('token', token)
    const decoded = decodeJwt(token)
    const resolvedName = decoded?.name || name || ''
    if (resolvedName) localStorage.setItem('userName', resolvedName)
    setUser(decoded ? { token, name: resolvedName, email: decoded.email, id: decoded.id } : { token, name })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}
