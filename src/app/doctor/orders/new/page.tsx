'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ordersApi } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowRight, Plus, Trash2 } from 'lucide-react'

interface OrderItem {
  product_name: string
  quantity: number
  notes: string
}

export default function NewOrderPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [items, setItems] = useState<OrderItem[]>([{ product_name: '', quantity: 1, notes: '' }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const addItem = () => {
    setItems([...items, { product_name: '', quantity: 1, notes: '' }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!title.trim()) {
      setError('يرجى إدخال عنوان الطلب')
      return
    }

    const validItems = items.filter(item => item.product_name.trim() && item.quantity > 0)
    if (validItems.length === 0) {
      setError('يرجى إضافة منتج واحد على الأقل')
      return
    }

    if (!user) {
      setError('يجب تسجيل الدخول أولاً')
      return
    }

    setIsSubmitting(true)

    try {
      await ordersApi.create({
        doctor_id: user.id,
        title,
        description,
        deadline: deadline || undefined,
        items: validItems,
      })

      router.push('/doctor/orders')
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الطلب')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/doctor/orders"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowRight className="w-5 h-5" />
          <span>رجوع</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">طلب جديد</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الطلب</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                عنوان الطلب *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="مثال: مستلزمات مختبر شهر مارس"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                وصف الطلب
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="أضف أي تفاصيل إضافية..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                موعد التسليم المطلوب
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">المنتجات المطلوبة</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              إضافة منتج
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.product_name}
                    onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-2"
                    placeholder="اسم المنتج"
                  />
                  <input
                    type="text"
                    value={item.notes}
                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="ملاحظات (اختياري)"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center"
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'جاري الإنشاء...' : 'نشر الطلب'}
          </button>
          <Link
            href="/doctor/orders"
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  )
}
