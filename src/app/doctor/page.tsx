'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DoctorLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoutes';
import { StatsGridSkeleton, CardSkeleton } from '@/components/ui/skeletons';
import { Order, OrderStatus } from '@/types';
import { 
  Package, 
  DollarSign, 
  CheckCircle, 
  Clock,
  TrendingUp,
  ChevronLeft
} from 'lucide-react';

// Mock data - replace with API calls
const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    doctorId: 'doctor1',
    date: '2026-03-20',
    status: 'offered',
    products: [
      { id: '1', name: 'قفازات لاتكس', qty: 10, brand: 'Mediglove', unit: 'علبة' },
      { id: '2', name: 'شاش طبي', qty: 5, brand: 'Hartmann', unit: 'كيس' },
    ],
    notes: '',
    offers: {
      supplier1: {
        items: [
          { name: 'قفازات لاتكس', available: true, unitPrice: 45, qty: 10, altBrand: null },
          { name: 'شاش طبي', available: true, unitPrice: 28, qty: 5, altBrand: null },
        ],
        submitted: true,
        deliveryCode: null,
      },
      supplier2: {
        items: [
          { name: 'قفازات لاتكس', available: true, unitPrice: 42, qty: 10, altBrand: 'SafeGlove' },
          { name: 'شاش طبي', available: false, unitPrice: 0, qty: 5, altBrand: null },
        ],
        submitted: true,
        deliveryCode: null,
      },
    },
    selectedSuppliers: null,
    paymentMethod: null,
    total: null,
    createdAt: '2026-03-20',
    updatedAt: '2026-03-20',
  },
  {
    id: 'ORD-002',
    doctorId: 'doctor1',
    date: '2026-03-18',
    status: 'pending',
    products: [
      { id: '3', name: 'إبرة وريدية', qty: 50, brand: 'Terumo', unit: 'قطعة' },
    ],
    notes: '',
    offers: {},
    selectedSuppliers: null,
    paymentMethod: null,
    total: null,
    createdAt: '2026-03-18',
    updatedAt: '2026-03-18',
  },
  {
    id: 'ORD-003',
    doctorId: 'doctor1',
    date: '2026-03-10',
    status: 'delivering',
    products: [
      { id: '4', name: 'ماسك N95', qty: 30, brand: '3M', unit: 'قطعة' },
    ],
    notes: '',
    offers: {
      supplier1: {
        items: [
          { name: 'ماسك N95', available: true, unitPrice: 25, qty: 30, altBrand: null },
        ],
        submitted: true,
        deliveryCode: '7284',
      },
    },
    selectedSuppliers: { supplier1: ['ماسك N95'] },
    paymentMethod: 'instapay',
    total: 788,
    createdAt: '2026-03-10',
    updatedAt: '2026-03-10',
  },
];

const statusBadge = (status: OrderStatus) => {
  const styles: Record<OrderStatus, string> = {
    pending: 'bg-[var(--warning-light)] text-[var(--warning)]',
    offered: 'bg-[var(--teal-light)] text-[var(--teal-dark)]',
    delivering: 'bg-[var(--blue-light)] text-[var(--blue)]',
    completed: 'bg-[var(--success-light)] text-[var(--success)]',
    cancelled: 'bg-[var(--danger-light)] text-[var(--danger)]',
  };
  
  const labels: Record<OrderStatus, string> = {
    pending: '🟡 معلق',
    offered: '💰 عرض مقدم',
    delivering: '🔵 جاري الشحن',
    completed: '🟢 مكتمل',
    cancelled: '❌ ملغي',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  trend,
  variant = 'teal' 
}: { 
  icon: React.ElementType; 
  value: string | number; 
  label: string;
  trend?: { value: string; positive: boolean };
  variant?: 'teal' | 'gold' | 'navy' | 'danger';
}) {
  const variantStyles = {
    teal: 'after:bg-[var(--teal)]',
    gold: 'after:bg-[var(--gold)]',
    navy: 'after:bg-[var(--navy)]',
    danger: 'after:bg-[var(--danger)]',
  };

  const iconBgStyles = {
    teal: 'bg-[var(--teal)]/10',
    gold: 'bg-[var(--gold)]/10',
    navy: 'bg-[var(--navy)]/10',
    danger: 'bg-[var(--danger)]/10',
  };

  return (
    <div className={`stat-card ${variant} ${variantStyles[variant]}`}>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3.5 ${iconBgStyles[variant]}`}>
        <Icon className={`w-7 h-7 text-[var(--${variant})]`} style={{ color: `var(--${variant})` }} />
      </div>
      <div className="text-3xl font-black text-[var(--navy)] mb-1">{value}</div>
      <div className="text-sm font-bold text-[var(--gray-400)]">{label}</div>
      {trend && (
        <div className={`text-sm font-extrabold mt-2 flex items-center gap-1 ${trend.positive ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
          {trend.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
          {trend.value}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const supplierCount = Object.keys(order.offers || {}).length;
  
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[var(--gray-100)] last:border-0">
      <div>
        <div className="font-extrabold text-[var(--navy)]">{order.id}</div>
        <div className="text-sm text-[var(--gray-400)]">
          {order.products.length} منتجات · {order.date}
        </div>
      </div>
      {statusBadge(order.status)}
    </div>
  );
}

function OfferRow({ order }: { order: Order }) {
  const supplierCount = Object.keys(order.offers || {}).length;
  
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[var(--gray-100)] last:border-0">
      <div>
        <div className="font-extrabold text-[var(--navy)]">{order.id}</div>
        <div className="text-sm text-[var(--gray-400)]">
          {supplierCount} مورد قدموا عروضاً
        </div>
      </div>
      <Link 
        href={`/doctor/offers?order=${order.id}`}
        className="px-4 py-2 bg-[var(--teal)] text-white rounded-lg text-sm font-bold hover:bg-[var(--teal-dark)] transition-colors"
      >
        عرض العروض
      </Link>
    </div>
  );
}

function DoctorDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const activeOrders = orders.filter(o => ['pending', 'offered', 'delivering'].includes(o.status));
  const offeredOrders = orders.filter(o => o.status === 'offered');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const stats = {
    total: orders.length,
    expenses: '8,450',
    completed: completedOrders.length,
    pending: orders.filter(o => o.status === 'pending').length,
  };

  if (isLoading) {
    return (
      <DoctorLayout>
        <StatsGridSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[var(--navy)] mb-1">
          مرحباً، د. أحمد 👋
        </h1>
        <p className="text-[var(--gray-400)]">
          {new Date().toLocaleDateString('ar-EG', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          icon={Package} 
          value={stats.total} 
          label="إجمالي الطلبات"
          trend={{ value: '+3 هذا الشهر', positive: true }}
          variant="teal"
        />
        <StatCard 
          icon={DollarSign} 
          value={`${stats.expenses} ج`} 
          label="إجمالي المصاريف"
          variant="gold"
        />
        <StatCard 
          icon={CheckCircle} 
          value={stats.completed} 
          label="طلبات مكتملة"
          variant="navy"
        />
        <StatCard 
          icon={Clock} 
          value={stats.pending} 
          label="طلبات معلقة"
          variant="danger"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Current Orders */}
        <div className="bg-white rounded-[var(--radius)] p-6 shadow-sm border border-[var(--gray-100)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-[var(--navy)]">📋 طلباتي الحالية</h2>
            <Link 
              href="/doctor/orders"
              className="flex items-center gap-1 px-4 py-2 bg-[var(--gray-100)] text-[var(--gray-600)] rounded-lg text-sm font-bold hover:bg-[var(--gray-200)] transition-colors"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          
          {activeOrders.length === 0 ? (
            <div className="text-center py-8 text-[var(--gray-400)]">
              <div className="text-5xl mb-3">📦</div>
              <p className="font-bold">لا توجد طلبات حالية</p>
            </div>
          ) : (
            <div>
              {activeOrders.slice(0, 4).map(order => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* Available Offers */}
        <div className="bg-white rounded-[var(--radius)] p-6 shadow-sm border border-[var(--gray-100)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-[var(--navy)]">💰 عروض التجار المتاحة</h2>
            <Link 
              href="/doctor/offers"
              className="flex items-center gap-1 px-4 py-2 bg-[var(--gray-100)] text-[var(--gray-600)] rounded-lg text-sm font-bold hover:bg-[var(--gray-200)] transition-colors"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          
          {offeredOrders.length === 0 ? (
            <div className="text-center py-8 text-[var(--gray-400)]">
              <div className="text-5xl mb-3">💰</div>
              <p className="font-bold">لا توجد عروض حالياً</p>
            </div>
          ) : (
            <div>
              {offeredOrders.slice(0, 4).map(order => (
                <OfferRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}

export default function DoctorPage() {
  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <DoctorDashboard />
    </ProtectedRoute>
  );
}
