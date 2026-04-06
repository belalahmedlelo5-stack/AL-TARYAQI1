export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'buyer' | 'supplier' | 'admin'
          name: string
          email: string
          phone: string | null
          avatar_url: string | null
          company_name: string | null
          company_registration_number: string | null
          tax_id: string | null
          business_address: string | null
          verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
          verification_badge: string | null
          verified_at: string | null
          verified_by: string | null
          rejection_reason: string | null
          verification_documents: Json | null
          rating: number
          number_of_reviews: number
          number_of_completed_orders: number
          total_order_value: number
          buyer_rating: number
          buyer_number_of_reviews: number
          last_active_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          role: 'buyer' | 'supplier' | 'admin'
          name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          tax_id?: string | null
          business_address?: string | null
          verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected'
          verification_badge?: string | null
          verified_at?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          verification_documents?: Json | null
          rating?: number
          number_of_reviews?: number
          number_of_completed_orders?: number
          total_order_value?: number
          buyer_rating?: number
          buyer_number_of_reviews?: number
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'buyer' | 'supplier' | 'admin'
          name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          company_name?: string | null
          company_registration_number?: string | null
          tax_id?: string | null
          business_address?: string | null
          verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected'
          verification_badge?: string | null
          verified_at?: string | null
          verified_by?: string | null
          rejection_reason?: string | null
          verification_documents?: Json | null
          rating?: number
          number_of_reviews?: number
          number_of_completed_orders?: number
          total_order_value?: number
          buyer_rating?: number
          buyer_number_of_reviews?: number
          last_active_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          buyer_id: string
          accepted_offer_id: string | null
          accepted_supplier_id: string | null
          title: string
          description: string | null
          status: 'draft' | 'published' | 'bidding' | 'offer_accepted' | 'payment_pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'disputed' | 'cancelled' | 'refunded'
          payment_method: 'cash' | 'mobile_wallet' | 'bank_transfer' | null
          payment_proof_url: string | null
          payment_confirmed_by_admin: boolean
          payment_confirmed_at: string | null
          original_supplier_price: number | null
          supplier_commission_rate: number
          supplier_commission: number | null
          supplier_total: number | null
          doctor_commission_rate: number
          doctor_commission: number | null
          doctor_subtotal: number | null
          shipping_fee: number | null
          doctor_total: number | null
          platform_revenue: number | null
          shipping_address: Json | null
          shipping_tracking_number: string | null
          shipping_carrier: string | null
          shipped_at: string | null
          delivered_at: string | null
          delivery_code: string | null
          delivery_confirmed_by_buyer: boolean
          delivery_confirmed_at: string | null
          published_at: string | null
          accepted_at: string | null
          paid_at: string | null
          completed_at: string | null
          deadline: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          accepted_offer_id?: string | null
          accepted_supplier_id?: string | null
          title: string
          description?: string | null
          status?: 'draft' | 'published' | 'bidding' | 'offer_accepted' | 'payment_pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'disputed' | 'cancelled' | 'refunded'
          payment_method?: 'cash' | 'mobile_wallet' | 'bank_transfer' | null
          payment_proof_url?: string | null
          payment_confirmed_by_admin?: boolean
          payment_confirmed_at?: string | null
          original_supplier_price?: number | null
          supplier_commission_rate?: number
          supplier_commission?: number | null
          supplier_total?: number | null
          doctor_commission_rate?: number
          doctor_commission?: number | null
          doctor_subtotal?: number | null
          shipping_fee?: number | null
          doctor_total?: number | null
          platform_revenue?: number | null
          shipping_address?: Json | null
          shipping_tracking_number?: string | null
          shipping_carrier?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          delivery_code?: string | null
          delivery_confirmed_by_buyer?: boolean
          delivery_confirmed_at?: string | null
          published_at?: string | null
          accepted_at?: string | null
          paid_at?: string | null
          completed_at?: string | null
          deadline?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          accepted_offer_id?: string | null
          accepted_supplier_id?: string | null
          title?: string
          description?: string | null
          status?: 'draft' | 'published' | 'bidding' | 'offer_accepted' | 'payment_pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'disputed' | 'cancelled' | 'refunded'
          payment_method?: 'cash' | 'mobile_wallet' | 'bank_transfer' | null
          payment_proof_url?: string | null
          payment_confirmed_by_admin?: boolean
          payment_confirmed_at?: string | null
          original_supplier_price?: number | null
          supplier_commission_rate?: number
          supplier_commission?: number | null
          supplier_total?: number | null
          doctor_commission_rate?: number
          doctor_commission?: number | null
          doctor_subtotal?: number | null
          shipping_fee?: number | null
          doctor_total?: number | null
          platform_revenue?: number | null
          shipping_address?: Json | null
          shipping_tracking_number?: string | null
          shipping_carrier?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          delivery_code?: string | null
          delivery_confirmed_by_buyer?: boolean
          delivery_confirmed_at?: string | null
          published_at?: string | null
          accepted_at?: string | null
          paid_at?: string | null
          completed_at?: string | null
          deadline?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_name: string
          quantity: number
          unit_price: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_name: string
          quantity: number
          unit_price?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          order_id: string
          supplier_id: string
          original_price: number
          delivery_days: number
          notes: string | null
          supplier_will_receive: number | null
          buyer_will_pay: number | null
          platform_fee: number | null
          status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'
          content_validation_passed: boolean
          validation_errors: Json | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          supplier_id: string
          original_price: number
          delivery_days: number
          notes?: string | null
          supplier_will_receive?: number | null
          buyer_will_pay?: number | null
          platform_fee?: number | null
          status?: 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'
          content_validation_passed?: boolean
          validation_errors?: Json | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          supplier_id?: string
          original_price?: number
          delivery_days?: number
          notes?: string | null
          supplier_will_receive?: number | null
          buyer_will_pay?: number | null
          platform_fee?: number | null
          status?: 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn'
          content_validation_passed?: boolean
          validation_errors?: Json | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          order_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          review_text: string | null
          content_validation_passed: boolean
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          review_text?: string | null
          content_validation_passed?: boolean
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          review_text?: string | null
          content_validation_passed?: boolean
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      platform_settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          updated_by: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          updated_by?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          updated_by?: string | null
          updated_at?: string
          created_at?: string
        }
      }
      daily_analytics: {
        Row: {
          id: string
          date: string
          new_orders: number
          completed_orders: number
          cancelled_orders: number
          new_offers: number
          accepted_offers: number
          total_order_value: number
          platform_revenue: number
          conversion_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          new_orders?: number
          completed_orders?: number
          cancelled_orders?: number
          new_offers?: number
          accepted_offers?: number
          total_order_value?: number
          platform_revenue?: number
          conversion_rate?: number
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          new_orders?: number
          completed_orders?: number
          cancelled_orders?: number
          new_offers?: number
          accepted_offers?: number
          total_order_value?: number
          platform_revenue?: number
          conversion_rate?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Extended types for the app
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Offer = Database['public']['Tables']['offers']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type PlatformSetting = Database['public']['Tables']['platform_settings']['Row']

export type OrderWithItems = Order & {
  items: OrderItem[]
  buyer?: Profile
  supplier?: Profile
  offer_count?: number
}

export type OfferWithSupplier = Offer & {
  supplier: Profile
  order?: Order
}

export type OrderWithOffers = OrderWithItems & {
  offers: OfferWithSupplier[]
}

export type ReviewWithReviewer = Review & {
  reviewer: Profile
}
