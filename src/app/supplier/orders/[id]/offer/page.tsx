'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ordersApi, offersApi } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { ArrowRight, Package, DollarSign, Clock, Send, ShieldCheck, AlertTriangle } from 'lucide-react'
import { validateOffer } from '@/lib/validation/antiBypass'
import type { OrderWithItems } from '@/types/database'

export default function SubmitOfferPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const orderId = params.id as string

  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [totalPrice, setTotalPrice] = useState('')
  const [deliveryTime, setDeliveryTime] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [hasExistingOffer, setHasExistingOffer] = useState(false)

  useEffect(() => {
    if (orderId && user) {
      loadOrder()
      checkExistingOffer()
    }
  }, [orderId, user])

  const loadOrder = async () => {
    try {
      const data = await ordersApi.getById(orderId)
      setOrder(data as OrderWithItems)
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkExistingOffer = async () => {
    if (!user) return
    try {
      const offers = await offersApi.getByOrder(orderId)
      const existing = offers.find((o) => o.supplier_id === user.id)
      if (existing) {
        setHasExistingOffer(true)
        setTotalPrice(existing.total_price.toString())
        setDeliveryTime(existing.delivery_time.toString())
        setNotes(existing.notes || '')
      }
    } catch (error) {
      console.error('Error checking existing offer:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    // ✅ Check supplier verification
    if (user.verification_status !== 'verified') {
      setError('حسابك لم يتم التحقق منه بعد. يرجى انتظار موافقة الإدارة.')
      return
    }

    const price = parseFloat(totalPrice)
    const days = parseInt(deliveryTime)

    if (!price || price <= 0) {
      setError('يرجى إدخال سعر صحيح')
      return
    }

    if (!days || days <= 0) {
      setError('يرجى إدخال مدة تسليم صحيحة')
      return
    }

    // ✅ Anti-bypass validation on notes
    if (notes.trim()) {
      const validation = validateOffer(price, notes)
      if (!validation.isValid) {
        setError(validation.errors[0])
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (hasExistingOffer) {
        const offers = await offersApi.getByOrder(orderId)
        const existing = offers.find((o) => o.supplier_id === user.id)
        if (existing) {
          await offersApi.update(existing.id, {
            original_price: price,
            delivery_days: days,
            notes: notes || null,
          })
        }
      } else {
        await offersApi.create({
          order_id: orderId,
          supplier_id: user.id,
          total_price: price,
          delivery_time: days,
          notes: notes || undefined,
        })
      }

      router.push('/supplier/offers')
    } catch (err: any) {
      setError(err.message || 'فشل تقديم العرض')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">الطلب غير موجود</p>
        <Link href="/supplier/orders" className="text-teal-600 hover:underline mt-2 inline-block">
          العودة للطلبات
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/supplier/orders"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowRight className="w-5 h-5" />
          <span>رجوع</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {hasExistingOffer ? 'تعديل العرض' : 'تقديم عرض'}
        </h1>
      </div>

      {/* Order Info - Doctor info HIDDEN from supplier */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{order.title}</h2>
        {order.description && <p className="text-gray-600 mb-4">{order.description}</p>}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            {order.items?.length || 0} منتج
          </span>
          {order.deadline && (
            <span>
              موعد التسليم المطلوب: {new Date(order.deadline).toLocaleDateString('ar-EG')}
            </span>
          )}
        </div>
        {/* ✅ NO DOCTOR NAME - Platform protects buyer identity */}
      </div>

      {/* ✅ Anti-bypass notice */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-orange-800 text-sm">تحذير أمني</p>
          <p className="text-orange-700 text-xs mt-1">
            لا تضع أرقام هواتف أو بيانات تواصل في الملاحظات. سيتم حظر أي محاولة للتواصل المباشر وإبلاغ الإدارة.
          </p>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">المنتجات المطلوبة</h3>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.product_name}</p>
                {item.notes && <p className="text-sm text-gray-500">{item.notes}</p>}
              </div>
              <span className="text-gray-600">الكمية: {item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Offer Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل عرضك</h3>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  السعر الإجمالي (جنيه) *
                </span>
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="مثال: 5000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  مدة التسليم (أيام) *
                </span>
              </label>
              <input
                type="number"
                min="1"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="مثال: 3"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="أضف أي ملاحظات أو تفاصيل إضافية..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {isSubmitting
                ? 'جاري الإرسال...'
                : hasExistingOffer
                ? 'تحديث العرض'
                : 'تقديم العرض'}
            </button>
            <Link
              href="/supplier/orders"
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
