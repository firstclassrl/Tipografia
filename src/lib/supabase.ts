import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
  throw new Error('Supabase configuration is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Order {
  id: string;
  order_number: string;
  print_type: 'etichetta' | 'astuccio' | 'blister';
  status: 'bozza' | 'inviato' | 'completato' | 'annullato';
  created_at: string;
  updated_at: string;
}

export interface OrderDetails {
  id: string;
  order_id: string;
  ean_code: string;
  client_name: string;
  product_name: string;
  measurements?: string;
  package_type?: string;
  lot_number: string;
  expiry_date: string;
  production_date: string;
  quantity: number;
  fronte_retro?: boolean;
  sagomata?: boolean;
  created_at: string;
}

export interface OrderWithDetails extends Order {
  order_details: OrderDetails[];
}