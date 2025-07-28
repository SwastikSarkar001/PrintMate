'use client'

import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthContext, { AuthContextType } from '@/contexts/AuthContext'
import { LoaderOne } from '@/components/ui/loader'
import { UserWithoutPassword } from '@/types/types'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithoutPassword | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check for existing user session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get user from server session
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // Include cookies
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.user) {
            setUser(result.user)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData: UserWithoutPassword) => {
    setUser(userData)
    // Optionally store in localStorage as backup
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = async () => {
    try {
      // Call server logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('user')
      router.push('/auth')
    }
  }

  const updateUser = (userData: Partial<UserWithoutPassword>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protected routes
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  return { user, loading }
}

// Utility component for protected routes
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth()

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <LoaderOne />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useRequireAuth
  }

  return <>{children}</>
}