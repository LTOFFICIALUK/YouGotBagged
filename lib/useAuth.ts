import { useState, useEffect } from 'react'
import { UserSession, getUserSession } from '@/lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for user session in localStorage or cookies
        const storedUserId = localStorage.getItem('twitter_user_id')
        
        if (storedUserId) {
          const session = await getUserSession(storedUserId)
          if (session && Date.now() < session.expires_at) {
            setUser(session)
          } else {
            // Session expired, clear storage
            localStorage.removeItem('twitter_user_id')
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (session: UserSession) => {
    setUser(session)
    localStorage.setItem('twitter_user_id', session.twitter_id)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('twitter_user_id')
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }
} 