'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ordersApi } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Eye, Package, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react'
import type { OrderWithItems } from '@/types/database'

const statusLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open: { label: 'مفتوح', color: 'bg-blue-100 text-blue-700', icon: Package },
  published: { label: 'منشور', color: 'bg-blue-100 text-blue-700', icon: Package },
  bidding: { label: 'قيد المناقصة', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  offer_accepted: { label: 'تم اختيار عرض', color: 'bg-purple-100 text-purple-700', icon: CheckCircle },
  payment_pending: { label: '⚡ في انتظار الدفع', color: 'bg-orange-100 text-orange-700', icon: CreditCard },
  paid: { label: 'مدفوع', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  confirmed: { label: 'مؤكد', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  in_delivery: { label: 'جاري الشحن', color: 'bg-blue-100 text-blue-700', icon: Clock },
  delivered: { label: 'تم التسليم', color: 'bg-teal-100 text-teal-700', icon: CheckCircle },
  completed: { label: 'مكتمل', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  closed: { label: 'مغلق', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  awarded: { label: 'تم التعاقد', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function DoctorOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    if (!user) return
    try {
      const data = await ordersApi.getByDoctor(user.id)
      setOrders(data as OrderWithItems[])
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">طلباتي</h1>
        <Link
          href="/doctor/orders/new"
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          طلب جديد
        </Link>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات</h3>
          <p className="text-gray-500 mb-4">قم بإنشاء طلبك الأول للحصول على عروض من الموردين</p>
          <Link
            href="/doctor/orders/new"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            إنشاء طلب جديد
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusLabels[order.status]
            const StatusIcon = status.icon
            const offerCount = (order as any).offers?.[0]?.count || 0

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{order.title}</h3>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </div>
                    
                    {order.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">{order.description}</p>
                    )}

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>{order.items?.length || 0} منتج</span>
                      <span>•</span>
                      <span>{offerCount} عرض</span>
                      {order.deadline && (
                        <>
                          <span>•</span>
                          <span>موعد التسليم: {new Date(order.deadline).toLocaleDateString('ar-EG')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* ⚡ Payment pending — show prominent button */}
                    {(order.status === 'payment_pending' || order.status === 'offer_accepted') && (
                      <Link
                        href={`/doctor/orders/${order.id}/payment`}
                        className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors animate-pulse"
                      >
                        <CreditCard className="w-4 h-4" />
                        إتمام الدفع
                      </Link>
                    )}
                    {['open', 'published', 'bidding'].includes(order.status) && offerCount > 0 && (
                      <Link
                        href={`/doctor/orders/${order.id}/offers`}
                        className="flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-lg font-medium hover:bg-teal-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        عرض العروض ({offerCount})
                      </Link>
                    )}
                    <Link
                      href={`/doctor/orders/${order.id}/offers`}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
