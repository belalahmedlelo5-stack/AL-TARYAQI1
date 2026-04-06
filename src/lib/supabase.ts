import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// ============================================
// PROFILES API
// ============================================
export const profilesApi = {
  async getCurrent() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
}

// ============================================
// ORDERS API
// ============================================
export const ordersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        doctor:profiles!orders_doctor_id_fkey(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getOpen() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      // ✅ Doctor info NOT included - protects buyer identity from suppliers
      .in('status', ['open', 'bidding', 'published'])
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getByDoctor(doctorId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        offers:offers(count)
      `)
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        doctor:profiles!orders_doctor_id_fkey(id, name, rating),
        offers:offers(
          id,
          order_id,
          supplier_id,
          original_price,
          delivery_days,
          notes,
          buyer_will_pay,
          supplier_will_receive,
          platform_fee,
          status,
          content_validation_passed,
          created_at,
          updated_at,
          supplier:profiles!offers_supplier_id_fkey(
            id,
            company_name,
            verification_badge,
            verification_status,
            rating,
            number_of_reviews,
            number_of_completed_orders
          )
        )
      `)
      // ✅ Supplier phone/email/personal details NOT fetched - prevents bypass
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(order: {
    doctor_id: string
    title: string
    description?: string
    deadline?: string
    items: { product_name: string; quantity: number; notes?: string }[]
  }) {
    // Create order first
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        doctor_id: order.doctor_id,
        title: order.title,
        description: order.description,
        deadline: order.deadline,
      })
      .select()
      .single()
    
    if (orderError) throw orderError

    // Create order items
    if (order.items.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          order.items.map(item => ({
            order_id: orderData.id,
            product_name: item.product_name,
            quantity: item.quantity,
            notes: item.notes,
          }))
        )
      
      if (itemsError) throw itemsError
    }

    return orderData
  },

  async update(id: string, updates: Partial<Database['public']['Tables']['orders']['Update']>) {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
      .subscribe()
  },
}

// ============================================
// OFFERS API
// ============================================
export const offersApi = {
  async getByOrder(orderId: string) {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        id, order_id, supplier_id,
        original_price, delivery_days, notes,
        buyer_will_pay, supplier_will_receive, platform_fee,
        status, content_validation_passed, created_at, updated_at,
        supplier:profiles!offers_supplier_id_fkey(
          id, company_name, verification_badge,
          verification_status, rating,
          number_of_reviews, number_of_completed_orders
        )
      `)
      .eq('order_id', orderId)
      .order('original_price', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getBySupplier(supplierId: string) {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        id, order_id, supplier_id,
        original_price, delivery_days, notes,
        buyer_will_pay, supplier_will_receive, platform_fee,
        status, created_at, updated_at,
        order:orders(id, title, description, status, deadline)
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(offer: {
    order_id: string
    supplier_id: string
    total_price: number
    delivery_time: number
    notes?: string
  }) {
    const { data, error } = await supabase
      .from('offers')
      .insert({
        order_id: offer.order_id,
        supplier_id: offer.supplier_id,
        original_price: offer.total_price,
        delivery_days: offer.delivery_time,
        notes: offer.notes || null,
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Database['public']['Tables']['offers']['Update']>) {
    const { data, error } = await supabase
      .from('offers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async accept(id: string) {
    const { data, error } = await supabase
      .from('offers')
      .update({ status: 'accepted' })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  subscribeToChanges(orderId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`offers-${orderId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'offers',
        filter: `order_id=eq.${orderId}`
      }, callback)
      .subscribe()
  },
}

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsApi = {
  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    if (error) throw error
    return count || 0
  },

  async markAsRead(id: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    if (error) throw error
  },

  subscribeToChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications-${userId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },
}

// ============================================
// AUTH HELPERS
// ============================================
export const authApi = {
  async signUp(email: string, password: string, userData: {
    name: string
    role: 'doctor' | 'supplier'
    phone?: string
    company_name?: string
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })
    
    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
