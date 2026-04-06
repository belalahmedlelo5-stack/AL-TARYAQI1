'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChevronRight, 
  Bell, 
  Plus, 
  Menu,
  ArrowRight
} from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const breadcrumbMap: Record<string, Record<string, string>> = {
  doctor: {
    '': 'الرئيسية',
    'orders': 'طلباتي',
    'orders/new': 'طلبية جديدة',
    'offers': 'العروض المقدمة',
    'wallet': 'المحفظة والتقارير',
    'ratings': 'التقييمات',
    'settings': 'الإعدادات',
  },
  supplier: {
    '': 'الرئيسية',
    'requests': 'طلبات السوق',
    'offers': 'عروضي المقدمة',
    'confirmed': 'الطلبات المؤكدة',
    'featured': 'المنتجات المميزة',
    'income': 'تقرير الدخل',
  },
  admin: {
    '': 'لوحة التحكم',
    'orders': 'كل الطلبات',
    'notes': 'مراقبة الملاحظات',
    'users': 'إدارة المستخدمين',
    'suppliers': 'إدارة الموردين',
    'commission': 'العمولات',
    'reports': 'التقارير',
  },
};

export function Topbar() {
  const { authUser, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!authUser || !user) return null;

  const role = authUser.role;
  
  // Generate breadcrumbs
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathParts = pathname.replace(`/${role}`, '').split('/').filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ label: breadcrumbMap[role][''] || 'الرئيسية', href: `/${role}` }];
    
    let currentPath = '';
    pathParts.forEach((part) => {
      currentPath += `/${part}`;
      const label = breadcrumbMap[role][currentPath.substring(1)] || part;
      crumbs.push({ label });
    });

    return crumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const isHome = pathname === `/${role}`;

  const handleBack = () => {
    router.back();
  };

  return (
    <header 
      className="
        h-[var(--topbar-h)] bg-white px-7 
        flex items-center justify-between
        border-b-2 border-[var(--gray-200)]
        sticky top-0 z-[100]
        shadow-sm
        gap-4
      "
      dir="rtl"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Back Button - Hidden on home */}
        <button
          onClick={handleBack}
          className={`
            flex items-center gap-2 h-[var(--btn-h-sm)] px-4
            bg-[var(--gray-100)] border-2 border-[var(--gray-200)]
            rounded-[var(--radius-sm)] text-[var(--gray-600)]
            font-extrabold text-sm
            hover:bg-[var(--teal-light)] hover:border-[var(--teal)] hover:text-[var(--teal-dark)]
            transition-colors whitespace-nowrap flex-shrink-0
            ${isHome ? 'invisible pointer-events-none' : ''}
          `}
        >
          <ArrowRight className="w-4 h-4" />
          <span className="hidden sm:inline">رجوع</span>
        </button>

        {/* Breadcrumbs - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-2 text-sm text-[var(--gray-400)] flex-wrap overflow-hidden">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-[var(--gray-200)]" />
              )}
              {crumb.href && index < breadcrumbs.length - 1 ? (
                <Link 
                  href={crumb.href}
                  className="font-bold hover:text-[var(--teal-dark)] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-bold text-[var(--navy)]">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Notifications */}
        <button 
          className="
            w-12 h-12 rounded-xl
            bg-[var(--gray-100)] border border-[var(--gray-200)]
            flex items-center justify-center text-xl
            hover:bg-[var(--teal-light)] hover:border-[var(--teal)]
            transition-colors relative
          "
          aria-label="الإشعارات"
        >
          <Bell className="w-5 h-5 text-[var(--gray-600)]" />
          {/* Notification dot */}
          <span className="absolute top-2 left-2 w-2.5 h-2.5 bg-[var(--danger)] rounded-full border-2 border-white"></span>
        </button>

        {/* New Order Button - Only for doctors */}
        {role === 'doctor' && (
          <Link
            href="/doctor/orders/new"
            className="
              hidden sm:flex items-center gap-2 h-10 px-4
              bg-gradient-to-br from-[var(--teal)] to-[var(--teal-dark)]
              text-white rounded-[var(--radius-sm)]
              font-extrabold text-sm
              hover:shadow-lg hover:-translate-y-0.5
              transition-all
            "
          >
            <Plus className="w-4 h-4" />
            <span>طلب جديد</span>
          </Link>
        )}

        {/* Live Indicator - Only for admin */}
        {role === 'admin' && (
          <span className="
            hidden sm:flex items-center gap-2 px-4 py-2
            bg-[var(--danger)]/10 text-[var(--danger)]
            rounded-full text-sm font-extrabold
          ">
            <span className="w-2 h-2 bg-[var(--danger)] rounded-full animate-pulse"></span>
            مراقبة حية
          </span>
        )}
      </div>
    </header>
  );
}

// Simplified topbar for auth pages
export function AuthTopbar() {
  return (
    <header 
      className="fixed top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-50"
      dir="rtl"
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--gold)] to-[var(--teal)] rounded-lg flex items-center justify-center">
          <span className="text-white text-xl">🧪</span>
        </div>
        <span className="text-white font-black text-lg">AL-TARYAQI</span>
      </Link>
    </header>
  );
}
