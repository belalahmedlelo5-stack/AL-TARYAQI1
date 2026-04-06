'use client'

import { useEffect, useState } from 'react'
import { ordersApi } from '@/lib/supabase'
import Link from 'next/link'
import { Package, Calendar, ArrowLeft, Tag } from 'lucide-react'
import type { OrderWithItems } from '@/types/database'

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const data = await ordersApi.getOpen()
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
        <h1 className="text-2xl font-bold text-gray-900">الطلبات المتاحة</h1>
        <Link
          href="/supplier/offers"
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
        >
          <Tag className="w-5 h-5" />
          عروضي
        </Link>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات متاحة</h3>
          <p className="text-gray-500">سيتم إشعارك عندما يتم نشر طلبات جديدة</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2">{order.title}</h3>
                  {/* ✅ Doctor identity hidden - platform protects buyer privacy */}
                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                    🛡️ هوية الطالب محمية
                  </p>
                </div>
              </div>

              {order.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{order.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {order.items?.length || 0} منتج
                </span>
                {order.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(order.deadline).toLocaleDateString('ar-EG')}
                  </span>
                )}
              </div>

              {/* Items Preview */}
              <div className="space-y-2 mb-4">
                {order.items?.slice(0, 3).map((item) => (
                  <div key={item.id} className="text-sm text-gray-600 flex justify-between">
                    <span className="line-clamp-1">{item.product_name}</span>
                    <span className="text-gray-400">×{item.quantity}</span>
                  </div>
                ))}
                {(order.items?.length || 0) > 3 && (
                  <p className="text-sm text-gray-400">+{order.items!.length - 3} منتجات أخرى</p>
                )}
              </div>

              <Link
                href={`/supplier/orders/${order.id}/offer`}
                className="flex items-center justify-center gap-2 w-full bg-teal-600 text-white py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                تقديم عرض
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
