import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL /*|| 'https://placeholder.supabase.co';*/
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY /*|| 'placeholder';*/

if (!import.meta.env.VITE_SUPABASE_URL) {
  console.error('Missing VITE_SUPABASE_URL in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MembershipType = 'gold' | 'platinum' | 'black_elite';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  membership_type: MembershipType;
  created_at: string;
  updated_at: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  created_at: string;
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  destination_id: string;
  category_id: string;
  image_url: string;
  base_price: number;
  gold_price: number;
  platinum_price: number;
  black_elite_price: number;
  black_elite_included: boolean;
  black_elite_monthly_limit: number;
  is_featured: boolean;
  created_at: string;
  destinations?: Destination;
  categories?: Category;
}

export interface Reservation {
  id: string;
  user_id: string;
  experience_id: string;
  reservation_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price_paid: number;
  qr_code: string;
  created_at: string;
  experiences?: Experience;
}

export interface ConciergeMessage {
  id: string;
  user_id: string;
  message: string;
  sender_type: 'user' | 'concierge';
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  mentor: string;
  image_url: string;
  base_price: number;
  gold_discount: number;
  platinum_discount: number;
  black_elite_free: boolean;
  created_at: string;
}
