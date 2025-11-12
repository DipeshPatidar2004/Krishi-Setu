import { useState, useEffect } from 'react'
import { AuthContext } from './AuthContext'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('krishiSetuUser')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('krishiSetuUsers') || '[]')
    const foundUser = users.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem('krishiSetuUser', JSON.stringify(userWithoutPassword))
      return { success: true }
    }
    return { success: false, error: 'Invalid email or password' }
  }

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('krishiSetuUsers') || '[]')
    
    if (users.find(u => u.email === userData.email)) {
      return { success: false, error: 'Email already exists' }
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      registeredAt: new Date().toISOString()
    }

    users.push(newUser)
    localStorage.setItem('krishiSetuUsers', JSON.stringify(users))

    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem('krishiSetuUser', JSON.stringify(userWithoutPassword))
    
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('krishiSetuUser')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}