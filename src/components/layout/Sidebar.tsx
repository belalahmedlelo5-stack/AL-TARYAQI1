'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { 
  Home, 
  PlusCircle, 
  ClipboardList, 
  Tag, 
  Wallet, 
  Star, 
  Settings, 
  ShoppingCart,
  Send,
  CheckSquare,
  Sparkles,
  TrendingUp,
  BarChart3,
  Users,
  Store,
  Percent,
  FileText,
  Eye,
  LogOut,
  Menu,
  X,
  FlaskConical,
  Building2,
  Shield
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationConfig: Record<UserRole, NavSection[]> = {
  doctor: [
    {
      title: 'الرئيسية',
      items: [
        { label: 'الرئيسية', href: '/doctor', icon: <Home className="w-5 h-5" /> },
      ],
    },
    {
      title: 'الطلبات',
      items: [
        { label: 'طلب جديد', href: '/doctor/orders/new', icon: <PlusCircle className="w-5 h-5" /> },
        { label: 'طلباتي', href: '/doctor/orders', icon: <ClipboardList className="w-5 h-5" />, badge: 3 },
        { label: 'عروض مقدمة', href: '/doctor/offers', icon: <Tag className="w-5 h-5" />, badge: 2 },
      ],
    },
    {
      title: 'حسابي',
      items: [
        { label: 'المحفظة والتقارير', href: '/doctor/wallet', icon: <Wallet className="w-5 h-5" /> },
        { label: 'التقييمات', href: '/doctor/ratings', icon: <Star className="w-5 h-5" /> },
        { label: 'الإعدادات', href: '/doctor/settings', icon: <Settings className="w-5 h-5" /> },
      ],
    },
  ],
  supplier: [
    {
      title: 'الرئيسية',
      items: [
        { label: 'الرئيسية', href: '/supplier', icon: <Home className="w-5 h-5" /> },
      ],
    },
    {
      title: 'الطلبات',
      items: [
        { label: 'طلبات السوق', href: '/supplier/requests', icon: <ShoppingCart className="w-5 h-5" />, badge: 3 },
        { label: 'عروضي المقدمة', href: '/supplier/offers', icon: <Send className="w-5 h-5" /> },
        { label: 'طلبات مؤكدة', href: '/supplier/confirmed', icon: <CheckSquare className="w-5 h-5" /> },
      ],
    },
    {
      title: 'المنتجات',
      items: [
        { label: 'منتجاتي المميزة', href: '/supplier/featured', icon: <Sparkles className="w-5 h-5" /> },
      ],
    },
    {
      title: 'الحساب',
      items: [
        { label: 'تقرير الدخل', href: '/supplier/income', icon: <TrendingUp className="w-5 h-5" /> },
      ],
    },
  ],
  admin: [
    {
      title: 'المراقبة',
      items: [
        { label: 'لوحة التحكم', href: '/admin', icon: <BarChart3 className="w-5 h-5" /> },
        { label: 'كل الطلبات', href: '/admin/orders', icon: <ClipboardList className="w-5 h-5" /> },
        { label: 'مراقبة الملاحظات', href: '/admin/notes', icon: <Eye className="w-5 h-5" /> },
      ],
    },
    {
      title: 'الإدارة',
      items: [
        { label: 'إدارة المستخدمين', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
        { label: 'إدارة الموردين', href: '/admin/suppliers', icon: <Store className="w-5 h-5" /> },
      ],
    },
    {
      title: 'المالية',
      items: [
        { label: 'العمولات', href: '/admin/commission', icon: <Percent className="w-5 h-5" /> },
        { label: 'التقارير', href: '/admin/reports', icon: <FileText className="w-5 h-5" /> },
      ],
    },
  ],
};

const roleConfig: Record<UserRole, { avatar: string; avatarClass: string; subtitle: string }> = {
  doctor: {
    avatar: 'د',
    avatarClass: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    subtitle: 'طبيب مشترك ✦',
  },
  supplier: {
    avatar: 'م',
    avatarClass: 'bg-gradient-to-br from-[var(--teal)] to-[var(--teal-dark)]',
    subtitle: 'مورد موثق ★★★★☆',
  },
  admin: {
    avatar: 'A',
    avatarClass: 'bg-gradient-to-br from-[var(--gold)] to-amber-600',
    subtitle: 'وصول كامل 🔑',
  },
};

export function Sidebar() {
  const { user, authUser, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!authUser || !user) return null;

  const role = authUser.role;
  const navSections = navigationConfig[role];
  const config = roleConfig[role];

  const isActive = (href: string) => {
    if (href === `/${role}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[190] backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 right-4 z-[210] md:hidden w-12 h-12 bg-[var(--navy)] rounded-xl flex flex-col items-center justify-center gap-1.5"
        aria-label="القائمة"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <span className="w-5 h-0.5 bg-white rounded"></span>
            <span className="w-5 h-0.5 bg-white rounded"></span>
            <span className="w-5 h-0.5 bg-white rounded"></span>
          </>
        )}
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 right-0 h-screen w-[var(--sidebar-w)] bg-[var(--navy)] z-[200]
          flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.2)]
          transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
        dir="rtl"
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link href={`/${role}`} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--gold)] to-amber-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              {role === 'doctor' && <FlaskConical className="w-6 h-6 text-white" />}
              {role === 'supplier' && <Building2 className="w-6 h-6 text-white" />}
              {role === 'admin' && <Shield className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h2 className="text-white font-black text-base leading-tight">AL-TARYAQI</h2>
              <p className="text-white/40 text-xs">
                {role === 'doctor' && 'منصة المستلزمات'}
                {role === 'supplier' && 'بوابة الموردين'}
                {role === 'admin' && 'Super Admin'}
              </p>
            </div>
          </Link>
        </div>

        {/* User Badge */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-extrabold text-white flex-shrink-0 ${config.avatarClass}`}>
              {config.avatar}
            </div>
            <div className="min-w-0">
              <h4 className="text-white font-extrabold text-sm truncate">{user.name}</h4>
              <p className="text-white/40 text-xs">{config.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {navSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-2">
              <div className="text-white/20 text-xs font-extrabold uppercase tracking-wider px-3 py-2">
                {section.title}
              </div>
              {section.items.map((item, itemIndex) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl mb-1
                      text-sm font-bold transition-all duration-250
                      ${active 
                        ? 'bg-gradient-to-br from-[var(--teal)]/20 to-[var(--teal)]/10 text-[#4ee8c8] border border-[var(--teal)]/25' 
                        : 'text-white/60 hover:bg-white/5 hover:text-white/90 border border-transparent'
                      }
                    `}
                  >
                    <span className="w-5 text-center">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-[var(--teal)] text-white text-xs font-extrabold px-2 py-0.5 rounded-full min-w-[24px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="
              flex items-center gap-3 w-full px-4 py-3 rounded-xl
              text-white/40 font-bold text-sm
              hover:bg-[var(--danger)]/10 hover:text-[#fc8181]
              transition-colors duration-250
            "
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// Compact sidebar for smaller screens (optional)
export function CompactSidebar() {
  const { authUser } = useAuth();
  const pathname = usePathname();

  if (!authUser) return null;

  const role = authUser.role;
  const navSections = navigationConfig[role];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <aside 
      className="fixed top-0 right-0 h-screen w-16 bg-[var(--navy)] z-[200] flex flex-col items-center py-4 shadow-[-4px_0_24px_rgba(0,0,0,0.2)] hidden lg:hidden md:flex"
      dir="rtl"
    >
      {/* Logo */}
      <div className="mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--gold)] to-amber-500 rounded-lg flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {navSections.flatMap(section => section.items).map((item, index) => {
          const active = isActive(item.href);
          return (
            <Link
              key={index}
              href={item.href}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                transition-all duration-250 relative
                ${active 
                  ? 'bg-[var(--teal)]/20 text-[#4ee8c8]' 
                  : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                }
              `}
              title={item.label}
            >
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -left-1 w-4 h-4 bg-[var(--danger)] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
