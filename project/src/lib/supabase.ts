import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      warehouses: {
        Row: {
          id: string
          name: string
          location: string
          capacity: number | null
          current_utilization: number | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          location: string
          capacity?: number | null
          current_utilization?: number | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          location?: string
          capacity?: number | null
          current_utilization?: number | null
          status?: string | null
          created_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          sku: string
          name: string
          category: string
          unit_cost: number | null
          lead_time_days: number | null
          reorder_point: number | null
          safety_stock: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          sku: string
          name: string
          category: string
          unit_cost?: number | null
          lead_time_days?: number | null
          reorder_point?: number | null
          safety_stock?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          category?: string
          unit_cost?: number | null
          lead_time_days?: number | null
          reorder_point?: number | null
          safety_stock?: number | null
          created_at?: string | null
        }
      }
      inventory: {
        Row: {
          id: string
          product_id: string | null
          warehouse_id: string | null
          quantity: number | null
          reserved_quantity: number | null
          available_quantity: number | null
          expiry_date: string | null
          last_updated: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          warehouse_id?: string | null
          quantity?: number | null
          reserved_quantity?: number | null
          available_quantity?: number | null
          expiry_date?: string | null
          last_updated?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          warehouse_id?: string | null
          quantity?: number | null
          reserved_quantity?: number | null
          available_quantity?: number | null
          expiry_date?: string | null
          last_updated?: string | null
        }
      }
      alerts: {
        Row: {
          id: string
          type: string
          severity: string | null
          title: string
          message: string
          product_id: string | null
          warehouse_id: string | null
          is_resolved: boolean | null
          action_recommended: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          type: string
          severity?: string | null
          title: string
          message: string
          product_id?: string | null
          warehouse_id?: string | null
          is_resolved?: boolean | null
          action_recommended?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          severity?: string | null
          title?: string
          message?: string
          product_id?: string | null
          warehouse_id?: string | null
          is_resolved?: boolean | null
          action_recommended?: string | null
          created_at?: string | null
        }
      }
      stripe_user_subscriptions: {
        Row: {
          customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean | null
          payment_method_brand: string | null
          payment_method_last4: string | null
        }
      }
    }
    Views: {
      stripe_user_subscriptions: {
        Row: {
          customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean | null
          payment_method_brand: string | null
          payment_method_last4: string | null
        }
      }
    }
  }
}