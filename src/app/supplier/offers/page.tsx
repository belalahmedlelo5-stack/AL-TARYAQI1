'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { offersApi } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Clock, DollarSign, CheckCircle, XCircle, Clock4, Edit } from 'lucide-react'
import type { OfferWithSupplier } from '@/types/database'

const statusLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700', icon: Clock4 },
  accepted: { label: 'مقبول', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function SupplierOffersPage() {
  const { user } = useAuth()
  const [offers, setOffers] = useState<OfferWithSupplier[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadOffers()
    }
  }, [user])

  const loadOffers = async () => {
    if (!user) return
    try {
      const data = await offersApi.getBySupplier(user.id)
      setOffers(data as OfferWithSupplier[])
    } catch (error) {
      console.error('Error loading offers:', error)
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
        <h1 className="text-2xl font-bold text-gray-900">عروضي</h1>
        <Link
          href="/supplier/orders"
          className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          تصفح الطلبات
        </Link>
      </div>

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لم تقدم أي عروض بعد</h3>
          <p className="text-gray-500 mb-4">تصفح الطلبات المتاحة وقدم عروضك التنافسية</p>
          <Link
            href="/supplier/orders"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            تصفح الطلبات
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const status = statusLabels[offer.status]
            const StatusIcon = status.icon
            const order = (offer as any).order

            return (
              <div key={offer.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order?.title || 'طلب غير معروف'}
                      </h3>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                    </div>

                    {order?.description && (
                      <p className="text-gray-600 mb-3 line-clamp-2">{order.description}</p>
                    )}

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-teal-600" />
                        <div>
                          <p className="text-sm text-gray-500">السعر المقدم</p>
                          <p className="text-lg font-bold text-teal-600">
                            {offer.original_price.toLocaleString()} ج
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">مدة التسليم</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {offer.delivery_days} يوم
                          </p>
                        </div>
                      </div>
                    </div>

                    {offer.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{offer.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {offer.status === 'pending' && order && (
                      <Link
                        href={`/supplier/orders/${order.id}/offer`}
                        className="flex items-center gap-2 text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        تعديل
                      </Link>
                    )}
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
