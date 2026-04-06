'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ordersApi, offersApi, supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import {
  ArrowRight, ShieldCheck, CreditCard, Upload, CheckCircle,
  AlertTriangle, MessageCircle, Clock, DollarSign, Copy, Check
} from 'lucide-react'
import type { OrderWithOffers, OfferWithSupplier } from '@/types/database'

// ✅ ADMIN ONLY — No direct supplier contact
const ADMIN_WHATSAPP = '201155608943'
const ADMIN_WALLET   = '01155608943'

export default function PaymentPage() {
  const params   = useParams()
  const router   = useRouter()
  const { user } = useAuth()
  const orderId  = params.id as string

  const [order, setOrder]             = useState<OrderWithOffers | null>(null)
  const [acceptedOffer, setAcceptedOffer] = useState<OfferWithSupplier | null>(null)
  const [isLoading, setIsLoading]     = useState(true)
  const [proofFile, setProofFile]     = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadDone, setUploadDone]   = useState(false)
  const [copied, setCopied]           = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    if (orderId && user) loadData()
  }, [orderId, user])

  const loadData = async () => {
    try {
      const data = await ordersApi.getById(orderId) as OrderWithOffers
      setOrder(data)
      const accepted = data.offers?.find((o: OfferWithSupplier) => o.status === 'accepted')
      if (accepted) setAcceptedOffer(accepted as OfferWithSupplier)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const copyNumber = () => {
    navigator.clipboard.writeText(ADMIN_WALLET)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الملف يجب أن يكون أقل من 5 ميجا')
        return
      }
      setError('')
      setProofFile(file)
    }
  }

  const handleUploadProof = async () => {
    if (!proofFile || !user || !orderId) return
    setIsUploading(true)
    setError('')

    try {
      // Upload to Supabase storage
      const ext      = proofFile.name.split('.').pop()
      const fileName = `payment-proofs/${orderId}-${Date.now()}.${ext}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payments')
        .upload(fileName, proofFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('payments')
        .getPublicUrl(fileName)

      // Update order with proof URL and move to payment_review
      await ordersApi.update(orderId, {
        payment_proof_url: publicUrl,
        payment_method: 'mobile_wallet',
        status: 'payment_pending',
      } as any)

      setUploadDone(true)
    } catch (e: any) {
      setError(e.message || 'فشل رفع إثبات الدفع')
    } finally {
      setIsUploading(false)
    }
  }

  const buildAdminWhatsApp = () => {
    const amount = acceptedOffer
      ? (acceptedOffer.buyer_will_pay || acceptedOffer.original_price || 0).toLocaleString()
      : '---'
    const msg = encodeURIComponent(
      `مرحباً، أرسلت إثبات الدفع\n` +
      `رقم الطلب: ${orderId}\n` +
      `المبلغ: ${amount} ج\n` +
      `يرجى تأكيد الدفع وإتمام الطلب.`
    )
    return `https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!order || !acceptedOffer) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">لم يتم قبول أي عرض بعد أو الطلب غير موجود</p>
        <Link href="/doctor/orders" className="text-teal-600 hover:underline">
          العودة للطلبات
        </Link>
      </div>
    )
  }

  const totalAmount = acceptedOffer.buyer_will_pay || acceptedOffer.original_price || 0
  const commission  = totalAmount - (acceptedOffer.original_price || 0)

  // Already paid
  if (order.status === 'paid' || order.status === 'confirmed') {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">تم تأكيد الدفع ✅</h2>
        <p className="text-gray-500 mb-6">الإدارة تحققت من دفعتك وجارٍ تجهيز طلبك</p>
        <Link
          href="/doctor/orders"
          className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-teal-700"
        >
          <ArrowRight className="w-5 h-5" />
          متابعة طلباتي
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/doctor/orders/${orderId}/offers`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowRight className="w-5 h-5" />
          <span>رجوع</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">إتمام الدفع</h1>
      </div>

      {/* ✅ Platform protection notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-blue-700 text-sm">
          جميع المدفوعات تتم <strong>عبر المنصة فقط</strong> — ممنوع الدفع مباشرة للمورد
        </p>
      </div>

      {/* Price breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-teal-600" />
          تفاصيل المبلغ
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">سعر المورد:</span>
            <span className="font-medium">{(acceptedOffer.original_price || 0).toLocaleString()} ج</span>
          </div>
          {commission > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">عمولة المنصة (5%):</span>
              <span className="font-medium text-orange-500">+ {commission.toLocaleString()} ج</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
            <span>الإجمالي المطلوب:</span>
            <span className="text-teal-600">{totalAmount.toLocaleString()} ج</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>مدة التسليم: {acceptedOffer.delivery_days} يوم بعد تأكيد الدفع</span>
        </div>
      </div>

      {/* Payment instructions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-teal-600" />
          طريقة الدفع — فودافون كاش
        </h2>

        <div className="bg-teal-50 rounded-xl p-5 mb-4">
          <p className="text-sm text-teal-700 mb-2 font-medium">حوّل المبلغ على رقم المنصة:</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-teal-800 font-mono tracking-widest">
              {ADMIN_WALLET}
            </span>
            <button
              onClick={copyNumber}
              className="flex items-center gap-1 bg-teal-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'تم النسخ' : 'نسخ'}
            </button>
          </div>
          <p className="text-xs text-teal-600 mt-2">فودافون كاش / محفظة إلكترونية</p>
        </div>

        <ol className="space-y-3 text-sm text-gray-700">
          {[
            'افتح تطبيق فودافون كاش أو أي محفظة إلكترونية',
            `حوّل المبلغ (${totalAmount.toLocaleString()} ج) على الرقم أعلاه`,
            'خذ لقطة شاشة لإثبات التحويل',
            'ارفع إثبات الدفع أدناه',
            'سيقوم الأدمن بتأكيد الدفع وإتمام طلبك',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Upload proof */}
      {!uploadDone ? (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-teal-600" />
            رفع إثبات الدفع
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <label className="block">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              proofFile ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400'
            }`}>
              {proofFile ? (
                <div>
                  <CheckCircle className="w-10 h-10 text-teal-600 mx-auto mb-2" />
                  <p className="text-teal-700 font-medium">{proofFile.name}</p>
                  <p className="text-teal-500 text-sm mt-1">
                    {(proofFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">اضغط لاختيار صورة إثبات الدفع</p>
                  <p className="text-gray-400 text-sm mt-1">PNG, JPG, PDF — حتى 5 ميجا</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <button
            onClick={handleUploadProof}
            disabled={!proofFile || isUploading}
            className="w-full mt-4 bg-teal-600 text-white py-3.5 rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                رفع إثبات الدفع
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-green-800">تم رفع الإثبات بنجاح ✅</h3>
          <p className="text-green-600 text-sm mt-2">في انتظار تأكيد الإدارة — عادةً خلال ساعات</p>
        </div>
      )}

      {/* Admin WhatsApp — ONLY allowed contact */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-600" />
          تواصل مع إدارة المنصة
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          لأي استفسار بخصوص الدفع أو الطلب — تواصل مع الإدارة فقط
        </p>
        <a
          href={buildAdminWhatsApp()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full bg-green-500 text-white py-3.5 rounded-xl font-bold hover:bg-green-600 transition-colors"
        >
          <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          واتساب إدارة المنصة
        </a>
        <p className="text-xs text-center text-gray-400 mt-3">
          ⚠️ ممنوع التواصل مع الموردين مباشرة — أي تجاوز يعرّض حسابك للإيقاف
        </p>
      </div>
    </div>
  )
}
