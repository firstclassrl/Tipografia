import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  
  console.error('Missing Supabase credentials:', missing.join(', '));
  console.error('Please check your environment variables in Netlify dashboard:');
  console.error('Site settings > Environment variables');
  throw new Error(`Supabase configuration is missing: ${missing.join(', ')}`);
}

// Verifica che l'URL sia valido
if (!supabaseUrl.startsWith('http')) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. URL should start with http:// or https://');
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

export interface Typography {
  id: string;
  name: string;
  contact_person?: string | null;
  email: string;
  created_at: string;
}

export interface OrderTypographySend {
  id: string;
  order_id: string;
  typography_id: string;
  pdf_path: string | null;
  created_at: string;
}
