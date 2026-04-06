'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, profilesApi } from '@/lib/supabase'
import { Profile } from '@/types/database'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: {
    name: string
    role: 'doctor' | 'supplier'
    phone?: string
    company_name?: string
  }) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    try {
      const profile = await profilesApi.getCurrent()
      setUser(profile)
    } catch (error) {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    // Check session on mount
    const initAuth = async () => {
      try {
        const session = await authApi.getSession()
        if (session) {
          await refreshUser()
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = authApi.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await refreshUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refreshUser])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await authApi.signIn(email, password)
      await refreshUser()
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: {
    name: string
    role: 'doctor' | 'supplier'
    phone?: string
    company_name?: string
  }) => {
    setIsLoading(true)
    try {
      await authApi.signUp(email, password, userData)
      await refreshUser()
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await authApi.signOut()
      setUser(null)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
