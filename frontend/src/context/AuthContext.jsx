import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Try to restore session on mount
  useEffect(() => {
    fetch('/api.php?route=me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user) setUser(d.user) })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const r = await fetch('/api.php?route=login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Login failed')
    setUser(d.user)
    return d.user
  }

  const register = async (name, email, password, role) => {
    const r = await fetch('/api.php?route=register', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Registration failed')
    setUser(d.user)
    return d.user
  }

  const logout = async () => {
    await fetch('/api.php?route=logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
