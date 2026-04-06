// ============================================
// ANALYTICS SERVICE
// ============================================

import { supabase } from '@/lib/supabase';

export interface PlatformStats {
  totalOrders: number;
  totalOffers: number;
  completedOrders: number;
  conversionRate: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface DailyStats {
  date: string;
  newOrders: number;
  completedOrders: number;
  newOffers: number;
  acceptedOffers: number;
  totalOrderValue: number;
  platformRevenue: number;
  conversionRate: number;
}

/**
 * Get platform-wide statistics
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  // Get from platform_settings cache
  const { data: settings } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'platform_stats')
    .single();
  
  if (settings?.value) {
    return {
      totalOrders: settings.value.total_orders || 0,
      totalOffers: settings.value.total_offers || 0,
      completedOrders: settings.value.completed_orders || 0,
      conversionRate: settings.value.conversion_rate || 0,
      totalRevenue: settings.value.total_revenue || 0,
      avgOrderValue: settings.value.avg_order_value || 0,
    };
  }
  
  // Fallback: calculate from database
  const { data: orders } = await supabase
    .from('orders')
    .select('status, final_price_with_commission');
  
  const totalOrders = orders?.length || 0;
  const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + (o.final_price_with_commission || 0), 0) || 0;
  
  const { count: totalOffers } = await supabase
    .from('offers')
    .select('*', { count: 'exact', head: true });
  
  return {
    totalOrders,
    totalOffers: totalOffers || 0,
    completedOrders,
    conversionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100 * 10) / 10 : 0,
    totalRevenue,
    avgOrderValue: completedOrders > 0 ? Math.round((totalRevenue / completedOrders) * 100) / 100 : 0,
  };
}

/**
 * Get daily analytics for a date range
 */
export async function getDailyAnalytics(
  startDate: string,
  endDate: string
): Promise<DailyStats[]> {
  const { data, error } = await supabase
    .from('daily_analytics')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching daily analytics:', error);
    return [];
  }
  
  return (data || []).map(day => ({
    date: day.date,
    newOrders: day.new_orders,
    completedOrders: day.completed_orders,
    newOffers: day.new_offers,
    acceptedOffers: day.accepted_offers,
    totalOrderValue: day.total_order_value,
    platformRevenue: day.platform_revenue,
    conversionRate: day.conversion_rate,
  }));
}

/**
 * Get supplier performance metrics
 */
export async function getSupplierMetrics(supplierId: string): Promise<{
  totalOffers: number;
  acceptedOffers: number;
  acceptanceRate: number;
  totalRevenue: number;
  avgOfferValue: number;
}> {
  const { data: offers } = await supabase
    .from('offers')
    .select('status, original_price')
    .eq('supplier_id', supplierId);
  
  if (!offers || offers.length === 0) {
    return {
      totalOffers: 0,
      acceptedOffers: 0,
      acceptanceRate: 0,
      totalRevenue: 0,
      avgOfferValue: 0,
    };
  }
  
  const totalOffers = offers.length;
  const acceptedOffers = offers.filter(o => o.status === 'accepted').length;
  const totalValue = offers.reduce((sum, o) => sum + (o.original_price || 0), 0);
  
  return {
    totalOffers,
    acceptedOffers,
    acceptanceRate: Math.round((acceptedOffers / totalOffers) * 100 * 10) / 10,
    totalRevenue: totalValue,
    avgOfferValue: Math.round((totalValue / totalOffers) * 100) / 100,
  };
}

/**
 * Get buyer activity metrics
 */
export async function getBuyerMetrics(buyerId: string): Promise<{
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  avgOrderValue: number;
}> {
  const { data: orders } = await supabase
    .from('orders')
    .select('status, final_price_with_commission')
    .eq('buyer_id', buyerId);
  
  if (!orders || orders.length === 0) {
    return {
      totalOrders: 0,
      completedOrders: 0,
      totalSpent: 0,
      avgOrderValue: 0,
    };
  }
  
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.final_price_with_commission || 0), 0);
  
  return {
    totalOrders,
    completedOrders,
    totalSpent,
    avgOrderValue: Math.round((totalSpent / totalOrders) * 100) / 100,
  };
}

// ============================================
// ANALYTICS DASHBOARD COMPONENTS
// ============================================

import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Tag, DollarSign, Percent, Package } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && trendValue && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
          <span className="text-gray-400 text-sm">من الشهر الماضي</span>
        </div>
      )}
    </div>
  );
}

interface AnalyticsDashboardProps {
  isAdmin?: boolean;
  userId?: string;
}

export function AnalyticsDashboard({ isAdmin = false, userId }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const data = await getPlatformStats();
      setStats(data);
      setLoading(false);
    };
    
    loadStats();
  }, []);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!stats) return null;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي الطلبات"
          value={stats.totalOrders.toLocaleString()}
          subtitle={`${stats.completedOrders} مكتمل`}
          icon={ShoppingCart}
          color="blue"
        />
        <StatCard
          title="إجمالي العروض"
          value={stats.totalOffers.toLocaleString()}
          icon={Tag}
          color="yellow"
        />
        <StatCard
          title="معدل التحويل"
          value={`${stats.conversionRate}%`}
          subtitle="عروض مقبولة / طلبات"
          icon={Percent}
          color="purple"
        />
        <StatCard
          title="إيرادات المنصة"
          value={`${stats.totalRevenue.toLocaleString()} ج`}
          subtitle="إجمالي العمولات"
          icon={DollarSign}
          color="green"
        />
      </div>
      
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">متوسط قيمة الطلب</h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-teal-600">
              {stats.avgOrderValue.toLocaleString()} ج
            </div>
            <div className="text-gray-400">
              متوسط قيمة الطلب المكتمل
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple chart component (using CSS bars)
interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  maxValue?: number;
}

export function SimpleBarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-24 text-sm text-gray-600 text-right">{item.label}</div>
          <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${item.color || 'bg-teal-500'}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <div className="w-16 text-sm font-medium text-gray-900">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// Revenue breakdown component
interface RevenueBreakdownProps {
  supplierCommission: number;
  buyerCommission: number;
  total: number;
}

export function RevenueBreakdown({ supplierCommission, buyerCommission, total }: RevenueBreakdownProps) {
  const data = [
    { label: 'عمولة الموردين', value: supplierCommission, color: 'bg-blue-500' },
    { label: 'عمولة المشترين', value: buyerCommission, color: 'bg-green-500' },
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">تفصيل الإيرادات</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold text-gray-900">{total.toLocaleString()} ج</span>
        <span className="text-gray-400 mr-2">إجمالي العمولات</span>
      </div>
      <SimpleBarChart data={data} maxValue={total} />
    </div>
  );
}
