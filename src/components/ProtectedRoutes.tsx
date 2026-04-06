'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Shield, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

// Loading screen component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[var(--gray-100)] flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[var(--teal)] animate-spin mx-auto mb-4" />
        <p className="text-[var(--gray-600)] font-bold">جاري التحميل...</p>
      </div>
    </div>
  );
}

// Unauthorized screen component
function UnauthorizedScreen() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-[var(--gray-100)] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-[var(--danger-light)] rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-[var(--danger)]" />
        </div>
        
        <h1 className="text-2xl font-black text-[var(--navy)] mb-3">
          وصول غير مصرح
        </h1>
        
        <p className="text-[var(--gray-600)] mb-6">
          عذراً، ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-[var(--teal)] text-white rounded-xl font-bold hover:bg-[var(--teal-dark)] transition-colors"
          >
            الصفحة الرئيسية
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-[var(--gray-100)] text-[var(--gray-600)] rounded-xl font-bold hover:bg-[var(--gray-200)] transition-colors"
          >
            رجوع
          </button>
        </div>
      </div>
    </div>
  );
}

// Login redirect screen
function LoginRedirectScreen() {
  const router = useRouter();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen bg-[var(--gray-100)] flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[var(--teal)] animate-spin mx-auto mb-4" />
        <p className="text-[var(--gray-600)] font-bold">جاري إعادة التوجيه...</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, authUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setIsAuthorized(false);
      } else if (allowedRoles && !hasRole(allowedRoles)) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [isLoading, isAuthenticated, hasRole, allowedRoles]);

  // Show loading screen while checking auth
  if (isLoading || isAuthorized === null) {
    return fallback || <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <LoginRedirectScreen />;
  }

  // Show unauthorized screen if role doesn't match
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <UnauthorizedScreen />;
  }

  // Render children if authorized
  return <>{children}</>;
}

// Role-based route guards
export function DoctorRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      {children}
    </ProtectedRoute>
  );
}

export function SupplierRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['supplier']}>
      {children}
    </ProtectedRoute>
  );
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}

// Multi-role route guard
export function MultiRoleRoute({ 
  children, 
  roles 
}: { 
  children: React.ReactNode; 
  roles: UserRole[] 
}) {
  return (
    <ProtectedRoute allowedRoles={roles}>
      {children}
    </ProtectedRoute>
  );
}

// Public route that redirects authenticated users
export function PublicRoute({ 
  children, 
  redirectTo = '/dashboard' 
}: { 
  children: React.ReactNode; 
  redirectTo?: string 
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--gray-100)] flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[var(--teal)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--gray-600)] font-bold">جاري إعادة التوجيه...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Layout wrapper that handles role-based redirects
export function RoleBasedLayout({ children }: { children: React.ReactNode }) {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && authUser) {
      // Redirect to appropriate dashboard based on role
      const roleDashboards: Record<string, string> = {
        doctor: '/doctor',
        supplier: '/supplier',
        admin: '/admin',
      };

      const currentPrefix = pathname.split('/')[1];
      const expectedPrefix = authUser.role;

      // If user is on wrong role's pages, redirect to their dashboard
      if (currentPrefix !== expectedPrefix && currentPrefix !== 'dashboard') {
        router.push(roleDashboards[authUser.role] || '/dashboard');
      }
    }
  }, [isLoading, authUser, router, pathname]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
