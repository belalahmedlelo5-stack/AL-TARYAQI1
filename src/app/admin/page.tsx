// ============================================
// ADMIN DASHBOARD
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Settings, 
  Users, 
  ShoppingCart, 
  Tag, 
  DollarSign,
  CheckCircle,
  XCircle,
  Truck,
  AlertTriangle
} from 'lucide-react';
import { AnalyticsDashboard, RevenueBreakdown } from '@/lib/services/analytics';
import type { Profile } from '@/types/database';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'verification' | 'payments' | 'flagged' | 'settings'>('overview');
  const [pendingVerifications, setPendingVerifications] = useState<Profile[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [flaggedActivities, setFlaggedActivities] = useState<any[]>([]);
  const [shippingFee, setShippingFee] = useState(150);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPendingVerifications();
    loadPendingPayments();
    loadShippingFee();
    loadFlaggedActivities();
  }, []);

  const loadFlaggedActivities = async () => {
    // Load offers with failed content validation (anti-bypass triggers)
    const { data } = await supabase
      .from('offers')
      .select(`
        id, notes, created_at,
        supplier:profiles!offers_supplier_id_fkey(id, name, company_name, phone),
        order:orders(id, title)
      `)
      .eq('content_validation_passed', false)
      .order('created_at', { ascending: false })
      .limit(50);

    setFlaggedActivities(data || []);
  };

  const banUser = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حظر هذا المستخدم؟')) return;
    await supabase
      .from('profiles')
      .update({ verification_status: 'rejected' })
      .eq('id', userId);
    await loadFlaggedActivities();
  };

  const loadPendingVerifications = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'supplier')
      .in('verification_status', ['pending', 'under_review'])
      .order('created_at', { ascending: false });
    
    setPendingVerifications(data || []);
  };

  const loadPendingPayments = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        buyer:profiles!orders_buyer_id_fkey(name),
        supplier:profiles!orders_accepted_supplier_id_fkey(name)
      `)
      .eq('status', 'payment_pending')
      .order('created_at', { ascending: false });
    
    setPendingPayments(data || []);
  };

  const loadShippingFee = async () => {
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'shipping_fee')
      .single();
    
    if (data?.value?.amount) {
      setShippingFee(data.value.amount);
    }
  };

  const updateShippingFee = async () => {
    setIsLoading(true);
    await supabase
      .from('platform_settings')
      .update({ value: { amount: shippingFee, currency: 'EGP', enabled: true } })
      .eq('key', 'shipping_fee');
    setIsLoading(false);
  };

  const verifySupplier = async (supplierId: string, status: 'verified' | 'rejected') => {
    await supabase
      .from('profiles')
      .update({ 
        verification_status: status,
        verified_at: status === 'verified' ? new Date().toISOString() : null,
        verification_badge: status === 'verified' ? 'verified_supplier' : null
      })
      .eq('id', supplierId);
    
    await loadPendingVerifications();
  };

  const confirmPayment = async (orderId: string) => {
    await supabase
      .from('orders')
      .update({ 
        status: 'paid',
        payment_confirmed_by_admin: true,
        payment_confirmed_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    await loadPendingPayments();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">لوحة تحكم المشرف</h1>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-600">النظام يعمل بشكل طبيعي</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: DollarSign },
            { id: 'verification', label: 'التحقق', icon: CheckCircle, badge: pendingVerifications.length },
            { id: 'payments', label: 'المدفوعات', icon: DollarSign, badge: pendingPayments.length },
            { id: 'flagged', label: '🚨 مشبوهة', icon: AlertTriangle, badge: flaggedActivities.length },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge ? (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <AnalyticsDashboard isAdmin />
            
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">في انتظار التحقق</p>
                    <p className="text-2xl font-bold">{pendingVerifications.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">في انتظار الدفع</p>
                    <p className="text-2xl font-bold">{pendingPayments.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">أنشطة مشبوهة</p>
                    <p className="text-2xl font-bold">{flaggedActivities.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">التحقق من الموردين</h2>
            </div>
            
            {pendingVerifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <p>لا يوجد موردين في انتظار التحقق</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingVerifications.map((supplier) => (
                  <div key={supplier.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{supplier.company_name}</h3>
                        <p className="text-gray-500">{supplier.name}</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p><span className="text-gray-400">السجل التجاري:</span> {supplier.company_registration_number || '-'}</p>
                          <p><span className="text-gray-400">البطاقة الضريبية:</span> {supplier.tax_id || '-'}</p>
                          <p><span className="text-gray-400">الهاتف:</span> {supplier.phone || '-'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => verifySupplier(supplier.id, 'verified')}
                          className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          قبول
                        </button>
                        <button
                          onClick={() => verifySupplier(supplier.id, 'rejected')}
                          className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                          رفض
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">المدفوعات في انتظار التأكيد</h2>
            </div>
            
            {pendingPayments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <p>لا يوجد مدفوعات في انتظار التأكيد</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {pendingPayments.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{order.title}</h3>
                        <p className="text-gray-500 text-sm">
                          من: {order.buyer?.name} | للمورد: {order.supplier?.name}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span className="font-bold text-teal-600">
                            {order.final_price_with_commission?.toLocaleString()} ج
                          </span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500">
                            طريقة الدفع: {order.payment_method === 'cash' ? 'نقدي' : 
                                          order.payment_method === 'mobile_wallet' ? 'محفظة إلكترونية' : 'تحويل بنكي'}
                          </span>
                        </div>
                        {order.payment_proof_url && (
                          <a 
                            href={order.payment_proof_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                          >
                            عرض إثبات الدفع
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => confirmPayment(order.id)}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
                      >
                        تأكيد الدفع
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'flagged' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                محاولات التحايل المرصودة ({flaggedActivities.length})
              </h2>
              <p className="text-sm text-gray-500">عروض احتوت على معلومات تواصل محظورة</p>
            </div>

            {flaggedActivities.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <p>لا توجد أنشطة مشبوهة</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {flaggedActivities.map((item: any) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            محاولة تحايل
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(item.created_at).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {item.supplier?.company_name || item.supplier?.name || 'مورد غير معروف'}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          الطلب: {item.order?.title || item.order?.id}
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 font-mono">
                          "{item.notes}"
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 mr-4">
                        <button
                          onClick={() => banUser(item.supplier?.id)}
                          className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                          حظر المورد
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Shipping Fee */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-6 h-6 text-teal-600" />
                <h2 className="text-lg font-semibold">رسوم الشحن</h2>
              </div>
              
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رسوم الشحن الافتراضية (جنيه مصري)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(Number(e.target.value))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    min="0"
                    step="10"
                  />
                  <button
                    onClick={updateShippingFee}
                    disabled={isLoading}
                    className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  سيتم تطبيق هذه الرسوم على جميع الطلبات الجديدة
                </p>
              </div>
            </div>

            {/* Commission Rates */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="w-6 h-6 text-teal-600" />
                <h2 className="text-lg font-semibold">نسب العمولة</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-2">عمولة الموردين</p>
                  <p className="text-3xl font-bold text-teal-600">5%</p>
                  <p className="text-gray-400 text-sm mt-1">تُخصم من سعر المورد</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-2">عمولة المشترين</p>
                  <p className="text-3xl font-bold text-teal-600">5%</p>
                  <p className="text-gray-400 text-sm mt-1">تُضاف على السعر النهائي</p>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <h2 className="text-lg font-semibold">الحماية والأمان</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">فلترة أرقام الهواتف</p>
                    <p className="text-green-600 text-sm">يتم حظر أي محاولة لمشاركة أرقام الهواتف</p>
                  </div>
                  <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm">مفعل</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">فلترة الكلمات المحظورة</p>
                    <p className="text-green-600 text-sm">يتم حظر كلمات مثل "واتساب" و"كلمني"</p>
                  </div>
                  <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm">مفعل</span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">RLS (Row Level Security)</p>
                    <p className="text-green-600 text-sm">كل مستخدم يرى فقط بياناته</p>
                  </div>
                  <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm">مفعل</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
