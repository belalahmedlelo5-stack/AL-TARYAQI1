'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ordersApi, offersApi } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowRight, Check, Award, Clock, DollarSign, ShieldCheck, MessageCircle, CreditCard, AlertTriangle } from 'lucide-react'
import type { OrderWithOffers, OfferWithSupplier } from '@/types/database'

// ✅ ADMIN WHATSAPP - ONLY ALLOWED CONTACT
const ADMIN_WHATSAPP = '201155608943'

export default function OrderOffersPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<OrderWithOffers | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAccepting, setIsAccepting] = useState<string | null>(null)

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      const data = await ordersApi.getById(orderId)
      setOrder(data as OrderWithOffers)
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [acceptedOfferForPayment, setAcceptedOfferForPayment] = useState<OfferWithSupplier | null>(null)

  const handleAcceptOffer = async (offerId: string) => {
    setIsAccepting(offerId)
    try {
      await offersApi.accept(offerId)
      await loadOrder()
      // Show payment instructions immediately after accepting
      const updatedOrder = await ordersApi.getById(orderId)
      const accepted = (updatedOrder as OrderWithOffers).offers?.find((o: OfferWithSupplier) => o.id === offerId)
      if (accepted) {
        setAcceptedOfferForPayment(accepted as OfferWithSupplier)
        setShowPaymentModal(true)
      }
    } catch (error) {
      console.error('Error accepting offer:', error)
      alert('فشل قبول العرض')
    } finally {
      setIsAccepting(null)
    }
  }

  const buildAdminWhatsApp = (offerId: string, orderId: string) => {
    const msg = encodeURIComponent(`مرحباً، أنا طبيب من منصة AL-TARYAQI\nرقم الطلب: ${orderId}\nرقم العرض: ${offerId}\nأريد الاستفسار عن إتمام الدفع عبر الواتساب الخاص بالمنصة.`)
    return `https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`
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
        <Link href="/doctor/orders" className="text-teal-600 hover:underline mt-2 inline-block">
          العودة للطلبات
        </Link>
      </div>
    )
  }

  const sortedOffers = [...(order.offers || [])].sort((a, b) => (a.original_price || 0) - (b.original_price || 0))
  const bestOffer = sortedOffers[0]
  const isAwarded = order.status === 'offer_accepted' || order.status === 'payment_pending' || order.status === 'paid'
  const acceptedOffer = order.offers?.find((o: OfferWithSupplier) => o.status === 'accepted')

  return (
    <div className="max-w-4xl mx-auto">
      {/* ✅ PAYMENT MODAL - Shows after accepting offer */}
      {showPaymentModal && acceptedOfferForPayment && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">تم قبول العرض ✅</h2>
                <p className="text-sm text-gray-500">اتبع خطوات الدفع التالية</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-teal-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">سعر المورد:</span>
                <span className="font-medium">{(acceptedOfferForPayment.original_price || 0).toLocaleString()} ج</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">عمولة المنصة (5%):</span>
                <span className="font-medium text-orange-500">+ {((acceptedOfferForPayment.buyer_will_pay || 0) - (acceptedOfferForPayment.original_price || 0)).toLocaleString()} ج</span>
              </div>
              <div className="border-t border-teal-200 mt-2 pt-2 flex justify-between font-bold text-lg">
                <span>الإجمالي:</span>
                <span className="text-teal-600">{(acceptedOfferForPayment.buyer_will_pay || acceptedOfferForPayment.original_price || 0).toLocaleString()} ج</span>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-800 text-sm mb-2">خطوات الدفع:</p>
                  <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                    <li>حوّل المبلغ على محفظة فودافون كاش</li>
                    <li className="font-bold">رقم المنصة: <span className="font-mono text-lg tracking-widest">01155608943</span></li>
                    <li>احتفظ بلقطة شاشة الدفع</li>
                    <li>أرسل الإثبات للأدمن عبر الواتساب</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href={buildAdminWhatsApp(acceptedOfferForPayment.id, orderId)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                تواصل مع إدارة المنصة
              </a>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
              >
                لاحقاً
              </button>
            </div>
            <p className="text-xs text-center text-gray-400 mt-3">
              ⚠️ التواصل يتم فقط مع إدارة المنصة — ممنوع التواصل المباشر مع الموردين
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/doctor/orders"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowRight className="w-5 h-5" />
          <span>رجوع</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">عروض الطلب</h1>
      </div>

      {/* Order Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{order.title}</h2>
        {order.description && (
          <p className="text-gray-600 mb-4">{order.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{order.items?.length || 0} منتج</span>
          {order.deadline && (
            <>
              <span>•</span>
              <span>موعد التسليم المطلوب: {new Date(order.deadline).toLocaleDateString('ar-EG')}</span>
            </>
          )}
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

      {/* ✅ Platform Protection Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-blue-800 text-sm">منصة AL-TARYAQI تحمي صفقتك</p>
          <p className="text-blue-600 text-xs mt-1">
            جميع التعاملات تتم من خلال المنصة فقط — بيانات الموردين محمية ولا يمكن التواصل المباشر معهم
          </p>
        </div>
      </div>

      {/* Offers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          العروض المقدمة ({order.offers?.length || 0})
        </h3>

        {order.offers?.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عروض بعد</h3>
            <p className="text-gray-500">سيتم إشعارك عندما يقدم الموردون عروضهم</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOffers.map((offer: OfferWithSupplier, index: number) => {
              const isBest = index === 0 && offer.status === 'pending'
              const isAccepted = offer.status === 'accepted'

              return (
                <div
                  key={offer.id}
                  className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
                    isAccepted
                      ? 'border-green-500'
                      : isBest
                      ? 'border-yellow-400'
                      : 'border-transparent'
                  }`}
                >
                  {/* Badge */}
                  {isAccepted && (
                    <div className="flex items-center gap-2 text-green-600 mb-3">
                      <Award className="w-5 h-5" />
                      <span className="font-medium">العرض المقبول</span>
                    </div>
                  )}
                  {isBest && !isAwarded && (
                    <div className="flex items-center gap-2 text-yellow-600 mb-3">
                      <Award className="w-5 h-5" />
                      <span className="font-medium">أفضل سعر</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* ✅ SUPPLIER NAME ONLY - No phone, no contact info */}
                      <h4 className="text-lg font-semibold text-gray-900">
                        {offer.supplier?.company_name || `مورد #${index + 1}`}
                        {offer.supplier?.verification_badge === 'verified_supplier' && (
                          <span className="mr-2 inline-flex items-center gap-1 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            موثّق
                          </span>
                        )}
                      </h4>

                      {/* Supplier rating only - no personal info */}
                      {(offer.supplier?.rating || 0) > 0 && (
                        <p className="text-sm text-yellow-600 mt-1">
                          ⭐ {offer.supplier?.rating?.toFixed(1)} ({offer.supplier?.number_of_reviews} تقييم)
                        </p>
                      )}

                      <div className="flex items-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-teal-600" />
                          <div>
                            <p className="text-sm text-gray-500">ستدفع</p>
                            <p className="text-xl font-bold text-teal-600">
                              {(offer.buyer_will_pay || offer.original_price || 0).toLocaleString()} ج
                            </p>
                            <p className="text-xs text-gray-400">شامل عمولة المنصة 5%</p>
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
                    <div className="flex flex-col gap-2 mr-4">
                      {!isAwarded && offer.status === 'pending' && (
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          disabled={isAccepting === offer.id}
                          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
                        >
                          {isAccepting === offer.id ? (
                            'جاري القبول...'
                          ) : (
                            <>
                              <Check className="w-5 h-5" />
                              قبول العرض
                            </>
                          )}
                        </button>
                      )}

                      {/* ✅ AFTER ACCEPT: Admin WhatsApp ONLY - not supplier */}
                      {isAccepted && (
                        <div className="flex flex-col gap-2">
                          <a
                            href={buildAdminWhatsApp(offer.id, orderId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
                          >
                            <CreditCard className="w-5 h-5" />
                            إرسال إثبات الدفع
                          </a>
                          <p className="text-xs text-gray-400 text-center">يتواصل مع إدارة المنصة فقط</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
