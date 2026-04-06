'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoutes';
import { StatsGridSkeleton, CardSkeleton } from '@/components/ui/skeletons';
import { Order } from '@/types';
import { 
  ShoppingCart, 
  DollarSign, 
  Send, 
  Star,
  TrendingUp,
  ChevronLeft
} from 'lucide-react';

// Mock data
const mockOrders: Order[] = [
  {
    id: 'ORD-004',
    doctorId: 'doctor2',
    date: '2026-03-29',
    status: 'pending',
    products: [
      { id: '5', name: 'قفازات نتريل', qty: 20, brand: 'Mediglove', unit: 'علبة' },
      { id: '6', name: 'كحول طبي', qty: 10, brand: 'Sigma', unit: 'زجاجة' },
    ],
    notes: '',
    offers: {},
    selectedSuppliers: null,
    paymentMethod: null,
    total: null,
    createdAt: '2026-03-29',
    updatedAt: '2026-03-29',
  },
  {
    id: 'ORD-005',
    doctorId: 'doctor1',
    date: '2026-03-28',
    status: 'pending',
    products: [
      { id: '7', name: 'محقنة 10مل', qty: 50, brand: 'BD', unit: 'قطعة' },
    ],
    notes: '',
    offers: {},
    selectedSuppliers: null,
    paymentMethod: null,
    total: null,
    createdAt: '2026-03-28',
    updatedAt: '2026-03-28',
  },
];

const mockMyOffers = [
  { orderId: 'ORD-001', status: 'selected', orderStatus: 'delivering' },
  { orderId: 'ORD-003', status: 'waiting', orderStatus: 'pending' },
];

function StatCard({ 
  icon: Icon, 
  value, 
  label,
  variant = 'teal' 
}: { 
  icon: React.ElementType; 
  value: string | number; 
  label: string;
  variant?: 'teal' | 'gold' | 'navy' | 'danger';
}) {
  const iconBgStyles = {
    teal: 'bg-[var(--teal)]/10',
    gold: 'bg-[var(--gold)]/10',
    navy: 'bg-[var(--navy)]/10',
    danger: 'bg-[var(--danger)]/10',
  };

  return (
    <div className={`stat-card ${variant}`}>
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3.5 ${iconBgStyles[variant]}`}>
        <Icon className="w-7 h-7" style={{ color: `var(--${variant})` }} />
      </div>
      <div className="text-3xl font-black text-[var(--navy)] mb-1">{value}</div>
      <div className="text-sm font-bold text-[var(--gray-400)]">{label}</div>
    </div>
  );
}

function RequestRow({ order }: { order: Order }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[var(--gray-100)] last:border-0">
      <div>
        <div className="font-extrabold text-[var(--navy)]">{order.id}</div>
        <div className="text-sm text-[var(--gray-400)]">
          {order.products.length} منتجات · {order.date}
        </div>
      </div>
      <Link 
        href={`/supplier/requests?order=${order.id}`}
        className="px-4 py-2 bg-[var(--teal)] text-white rounded-lg text-sm font-bold hover:bg-[var(--teal-dark)] transition-colors"
      >
        تقديم عرض
      </Link>
    </div>
  );
}

function OfferStatusRow({ offer }: { offer: typeof mockMyOffers[0] }) {
  const isSelected = offer.status === 'selected';
  
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[var(--gray-100)] last:border-0">
      <div>
        <div className="font-extrabold text-[var(--navy)]">{offer.orderId}</div>
        <div className="text-sm text-[var(--gray-400)]">
          {isSelected ? '✅ تم اختيارك' : '⏳ في انتظار قرار الطبيب'}
        </div>
      </div>
      {isSelected ? (
        <span className="px-3 py-1 bg-[var(--blue-light)] text-[var(--blue)] rounded-full text-sm font-bold">
          🔵 جاري الشحن
        </span>
      ) : (
        <span className="px-3 py-1 bg-[var(--warning-light)] text-[var(--warning)] rounded-full text-sm font-bold">
          ⏳ منتظر
        </span>
      )}
    </div>
  );
}

function SupplierDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders(mockOrders);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const pendingRequests = orders.filter(o => o.status === 'pending');

  if (isLoading) {
    return (
      <MainLayout>
        <StatsGridSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[var(--navy)] mb-1">
          مرحباً، المورد الأول 👋
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
          icon={ShoppingCart} 
          value={pendingRequests.length} 
          label="طلبات جديدة تنتظرك"
          variant="teal"
        />
        <StatCard 
          icon={DollarSign} 
          value="12,300" 
          label="إجمالي المبيعات (ج)"
          variant="gold"
        />
        <StatCard 
          icon={Send} 
          value={18} 
          label="عروض مقدمة"
          variant="navy"
        />
        <StatCard 
          icon={Star} 
          value="4.3 ★" 
          label="تقييمك العام"
          variant="danger"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Market Orders */}
        <div className="bg-white rounded-[var(--radius)] p-6 shadow-sm border border-[var(--gray-100)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-[var(--navy)]">🛒 طلبات السوق المتاحة</h2>
            <Link 
              href="/supplier/requests"
              className="flex items-center gap-1 px-4 py-2 bg-[var(--gray-100)] text-[var(--gray-600)] rounded-lg text-sm font-bold hover:bg-[var(--gray-200)] transition-colors"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-[var(--gray-400)]">
              <div className="text-5xl mb-3">🛒</div>
              <p className="font-bold">لا توجد طلبات جديدة</p>
            </div>
          ) : (
            <div>
              {pendingRequests.slice(0, 4).map(order => (
                <RequestRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* My Offers Status */}
        <div className="bg-white rounded-[var(--radius)] p-6 shadow-sm border border-[var(--gray-100)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-[var(--navy)]">📊 حالة عروضي المقدمة</h2>
            <Link 
              href="/supplier/offers"
              className="flex items-center gap-1 px-4 py-2 bg-[var(--gray-100)] text-[var(--gray-600)] rounded-lg text-sm font-bold hover:bg-[var(--gray-200)] transition-colors"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          
          {mockMyOffers.length === 0 ? (
            <div className="text-center py-8 text-[var(--gray-400)]">
              <div className="text-5xl mb-3">📤</div>
              <p className="font-bold">لم تقدم عروضاً بعد</p>
            </div>
          ) : (
            <div>
              {mockMyOffers.slice(0, 4).map((offer, index) => (
                <OfferStatusRow key={index} offer={offer} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default function SupplierPage() {
  return (
    <ProtectedRoute allowedRoles={['supplier']}>
      <SupplierDashboard />
    </ProtectedRoute>
  );
}
