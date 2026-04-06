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
ng): { sub: string; role: UserRole } | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) return null;
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state from cookies
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = Cookies.get(TOKEN_KEY);
        const savedUser = Cookies.get(USER_KEY);

        if (token && savedUser) {
          const verified = verifyToken(token);
          if (verified) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setAuthUser({
              id: verified.sub,
              role: verified.role,
              token,
            });
          } else {
            // Token expired, clear cookies
            Cookies.remove(TOKEN_KEY);
            Cookies.remove(USER_KEY);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (
    username: string, 
    password: string, 
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Demo authentication (replace with Supabase Auth in production)
      const demoUser = DEMO_USERS[username];
      
      if (!demoUser) {
        return { success: false, error: 'اسم المستخدم غير موجود' };
      }

      if (demoUser.password !== password) {
        return { success: false, error: 'كلمة المرور غير صحيحة' };
      }

      if (demoUser.role !== role) {
        return { success: false, error: 'نوع الحساب غير متطابق' };
      }

      // Generate token
      const token = generateToken(username, role);
      
      // Set cookies
      Cookies.set(TOKEN_KEY, token, { expires: 1, secure: true, sameSite: 'strict' });
      Cookies.set(USER_KEY, JSON.stringify(demoUser.userData), { expires: 1, secure: true, sameSite: 'strict' });

      // Update state
      setUser(demoUser.userData);
      setAuthUser({
        id: username,
        role,
        token,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Clear cookies
      Cookies.remove(TOKEN_KEY);
      Cookies.remove(USER_KEY);

      // Clear state
      setUser(null);
      setAuthUser(null);

      // Sign out from Supabase (if using Supabase Auth)
      await supabase.auth.signOut();

      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Check if user has required role
  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!authUser) return false;
    return roles.includes(authUser.role);
  }, [authUser]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      if (!authUser) return;

      // In production, fetch fresh user data from Supabase
      // const { data, error } = await supabase
      //   .from('users')
      //   .select('*')
      //   .eq('id', authUser.id)
      //   .single();
      
      // if (data) {
      //   setUser(data);
      //   Cookies.set(USER_KEY, JSON.stringify(data), { expires: 1 });
      // }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, [authUser]);

  const value: AuthContextType = {
    user,
    authUser,
    isLoading,
    isAuthenticated: !!authUser,
    login,
    logout,
    hasRole,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) {
  return function WithAuthComponent(props: P) {
    const { isAuthenticated, isLoading, hasRole, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/login');
        } else if (allowedRoles && !hasRole(allowedRoles)) {
          router.push('/unauthorized');
        }
      }
    }, [isLoading, isAuthenticated, hasRole, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
      return null;
    }

    return <Component {...props} user={user} />;
  };
}
