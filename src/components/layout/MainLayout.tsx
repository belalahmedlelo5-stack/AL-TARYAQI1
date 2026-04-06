'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[var(--gray-100)]" dir="rtl">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 mr-0 md:mr-[var(--sidebar-w)] transition-[margin] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]">
        {/* Topbar */}
        <Topbar />
        
        {/* Page Content */}
        <div className="p-4 md:p-7">
          {children}
        </div>
      </main>
    </div>
  );
}

// Layout with FAB (Floating Action Button) for doctors
export function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--gray-100)]" dir="rtl">
      <Sidebar />
      
      <main className="flex-1 mr-0 md:mr-[var(--sidebar-w)] transition-[margin] duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <Topbar />
        <div className="p-4 md:p-7 pb-24 md:pb-7">
          {children}
        </div>
      </main>

      {/* Floating Action Button */}
      <a
        href="/doctor/orders/new"
        className="
          fixed bottom-6 left-6 md:bottom-8 md:left-8 z-[150]
          h-14 md:h-16 px-5 md:px-7
          bg-gradient-to-br from-[var(--teal)] to-[var(--teal-dark)]
          text-white rounded-full
          font-extrabold text-base
          flex items-center gap-2.5
          shadow-lg shadow-[var(--teal)]/30
          hover:-translate-y-1 hover:scale-105 hover:shadow-xl
          transition-all
        "
      >
        <span className="text-2xl">+</span>
        <span className="hidden sm:inline">إضافة طلبية جديدة</span>
      </a>
    </div>
  );
}

// Minimal layout for auth pages
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #071524 0%, #0f2740 40%, #083028 100%)',
      }}
      dir="rtl"
    >
      {/* Decorative elements */}
      <div 
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(18,184,154,0.12) 0%, transparent 70%)',
          top: '-150px',
          right: '-150px',
        }}
      />
      <div 
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(197,148,31,0.08) 0%, transparent 70%)',
          bottom: '-100px',
          left: '-100px',
        }}
      />

      {/* Logo */}
      <div className="fixed top-6 right-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[var(--gold)] to-[var(--teal)] rounded-xl flex items-center justify-center text-2xl shadow-lg">
            🧪
          </div>
          <div>
            <h1 className="text-white font-black text-lg">AL-TARYAQI</h1>
            <p className="text-white/40 text-xs">منصة المستلزمات الطبية</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-1 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
