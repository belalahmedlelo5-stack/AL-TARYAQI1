'use client';

import Link from 'next/link';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div 
      className="min-h-screen bg-[var(--gray-100)] flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-black text-[var(--teal)] mb-4">404</div>
          <div className="text-6xl">🔍</div>
        </div>
        
        <h1 className="text-2xl font-black text-[var(--navy)] mb-3">
          الصفحة غير موجودة
        </h1>
        
        <p className="text-[var(--gray-600)] mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو قد تم نقلها.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-[var(--teal)] text-white rounded-xl font-bold hover:bg-[var(--teal-dark)] transition-colors"
          >
            <Home className="w-5 h-5" />
            الصفحة الرئيسية
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--gray-100)] text-[var(--gray-600)] rounded-xl font-bold hover:bg-[var(--gray-200)] transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            رجوع
          </button>
        </div>
      </div>
    </div>
  );
}
