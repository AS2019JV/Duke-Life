/*
  # Duke Life App Database Schema:  20251115002604_create_duke_life_schema

  ## Overview
  Creates the complete database structure for the Duke Life membership and experiences platform.

  ## New Tables

  ### 1. users
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text)
  - `full_name` (text)
  - `phone` (text)
  - `membership_type` (text) - 'gold', 'platinum', 'black_elite'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. destinations
  - `id` (uuid, primary key)
  - `name` (text) - 'Riviera Maya', 'Miami', 'Dubái'
  - `slug` (text, unique)
  - `created_at` (timestamptz)

  ### 3. categories
  - `id` (uuid, primary key)
  - `name` (text) - 'Bienestar', 'Lujo', etc.
  - `slug` (text, unique)
  - `icon_name` (text) - For UI rendering
  - `created_at` (timestamptz)

  ### 4. experiences
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `destination_id` (uuid, foreign key)
  - `category_id` (uuid, foreign key)
  - `image_url` (text)
  - `base_price` (decimal)
  - `gold_price` (decimal)
  - `platinum_price` (decimal)
  - `black_elite_price` (decimal)
  - `black_elite_included` (boolean) - Free for Black Elite
  - `black_elite_monthly_limit` (integer) - How many per month
  - `is_featured` (boolean)
  - `created_at` (timestamptz)

  ### 5. reservations
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `experience_id` (uuid, foreign key)
  - `reservation_date` (timestamptz)
  - `status` (text) - 'pending', 'confirmed', 'completed', 'cancelled'
  - `price_paid` (decimal)
  - `qr_code` (text)
  - `created_at` (timestamptz)

  ### 6. concierge_messages
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `message` (text)
  - `sender_type` (text) - 'user', 'concierge'
  - `created_at` (timestamptz)

  ### 7. courses
  - `id` (uuid, primary key)
  - `title` (text)
  - `description` (text)
  - `mentor` (text)
  - `image_url` (text)
  - `base_price` (decimal)
  - `gold_discount` (decimal) - Percentage
  - `platinum_discount` (decimal)
  - `black_elite_free` (boolean)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to access their own data
*/



/* BASE CODE - Botlt

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  membership_type text NOT NULL DEFAULT 'gold' CHECK (membership_type IN ('gold', 'platinum', 'black_elite')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view destinations"
  ON destinations FOR SELECT
  TO authenticated
  USING (true);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon_name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  destination_id uuid REFERENCES destinations(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text DEFAULT '',
  base_price decimal(10,2) DEFAULT 0,
  gold_price decimal(10,2) DEFAULT 0,
  platinum_price decimal(10,2) DEFAULT 0,
  black_elite_price decimal(10,2) DEFAULT 0,
  black_elite_included boolean DEFAULT false,
  black_elite_monthly_limit integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view experiences"
  ON experiences FOR SELECT
  TO authenticated
  USING (true);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  reservation_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  price_paid decimal(10,2) DEFAULT 0,
  qr_code text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create concierge_messages table
CREATE TABLE IF NOT EXISTS concierge_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('user', 'concierge')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE concierge_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON concierge_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages"
  ON concierge_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND sender_type = 'user');

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  mentor text DEFAULT '',
  image_url text DEFAULT '',
  base_price decimal(10,2) DEFAULT 0,
  gold_discount decimal(5,2) DEFAULT 15,
  platinum_discount decimal(5,2) DEFAULT 30,
  black_elite_free boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO authenticated
  USING (true);

-- Insert seed data
INSERT INTO destinations (name, slug) VALUES
  ('Riviera Maya', 'riviera-maya'),
  ('Miami', 'miami'),
  ('Dubái', 'dubai')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, icon_name) VALUES
  ('Bienestar', 'bienestar', 'spa'),
  ('Lujo y Estilo de Vida', 'lujo', 'diamond'),
  ('Gastronomía', 'gastronomia', 'utensils'),
  ('Aventuras', 'aventuras', 'mountain'),
  ('Educación', 'educacion', 'book')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample experiences
INSERT INTO experiences (title, description, destination_id, category_id, image_url, base_price, gold_price, platinum_price, black_elite_price, black_elite_included, black_elite_monthly_limit, is_featured)
SELECT 
  'Yate Privado en Tulum',
  'Disfruta de un día exclusivo navegando por las aguas cristalinas del Caribe',
  (SELECT id FROM destinations WHERE slug = 'riviera-maya'),
  (SELECT id FROM categories WHERE slug = 'lujo'),
  'https://images.pexels.com/photos/163236/luxury-yacht-boat-speed-water-163236.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  1200,
  1000,
  800,
  0,
  true,
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE title = 'Yate Privado en Tulum');

INSERT INTO experiences (title, description, destination_id, category_id, image_url, base_price, gold_price, platinum_price, black_elite_price, black_elite_included, is_featured)
SELECT 
  'Spa Holístico y Sanación',
  'Experimenta una transformación completa con nuestros tratamientos exclusivos',
  (SELECT id FROM destinations WHERE slug = 'riviera-maya'),
  (SELECT id FROM categories WHERE slug = 'bienestar'),
  'https://images.pexels.com/photos/3865476/pexels-photo-3865476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  300,
  250,
  200,
  150,
  false,
  true
WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE title = 'Spa Holístico y Sanación');

-- Insert sample courses
INSERT INTO courses (title, description, mentor, image_url, base_price, gold_discount, platinum_discount, black_elite_free)
SELECT 
  'Ventas de Alto Nivel',
  'Aprende las técnicas más avanzadas de ventas con el mentor Duke del Caribe',
  'Duke del Caribe',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  499,
  15,
  30,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Ventas de Alto Nivel');

INSERT INTO courses (title, description, mentor, image_url, base_price, gold_discount, platinum_discount, black_elite_free)
SELECT 
  'Marketing con IA',
  'Domina las herramientas de IA para revolucionar tu estrategia de marketing',
  'NSG',
  'https://images.pexels.com/photos/8438922/pexels-photo-8438922.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  599,
  15,
  30,
  true
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Marketing con IA');


*/ 






-- =========================================================
-- DUKE LIFE – MVP CORE EXTENSIONS
-- Compatibles con el schema existente de Bolt/Duke SQL
-- =========================================================

-- 1. ENUMS BÁSICOS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_tier_enum') THEN
    CREATE TYPE membership_tier_enum AS ENUM ('gold','platinum','black_elite');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_status_enum') THEN
    CREATE TYPE membership_status_enum AS ENUM ('active','paused','cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'conversation_status_enum') THEN
    CREATE TYPE conversation_status_enum AS ENUM ('active','waiting_for_human','closed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sender_type_enum') THEN
    CREATE TYPE sender_type_enum AS ENUM ('user','ai','human');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concierge_request_status_enum') THEN
    CREATE TYPE concierge_request_status_enum AS ENUM ('open','pending_ai','pending_human','done','cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'concierge_request_category_enum') THEN
    CREATE TYPE concierge_request_category_enum AS ENUM ('reservation','upgrade','transport','recommendation','issue','other');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_platform_enum') THEN
    CREATE TYPE course_platform_enum AS ENUM ('internal','external');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_access_source_enum') THEN
    CREATE TYPE course_access_source_enum AS ENUM ('membership','one_off_purchase');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_registration_status_enum') THEN
    CREATE TYPE event_registration_status_enum AS ENUM ('registered','cancelled','attended');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
    CREATE TYPE notification_type_enum AS ENUM ('system','reservation_update','offer','event','education');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_sent_via_enum') THEN
    CREATE TYPE notification_sent_via_enum AS ENUM ('push','email','in_app');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_status_enum') THEN
    CREATE TYPE property_status_enum AS ENUM ('available','reserved','sold');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type_enum') THEN
    CREATE TYPE property_type_enum AS ENUM ('apartment','villa','house','lot','commercial','other');
  END IF;
END $$;


-- 2. EXTENDER TABLAS EXISTENTES DE DUKE SQL
-- (destinations, categories, experiences, reservations, courses)

ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS "order" integer;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE experiences
  ADD COLUMN IF NOT EXISTS short_description text,
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS location_text text,
  ADD COLUMN IF NOT EXISTS external_partner_name text,
  ADD COLUMN IF NOT EXISTS currency text CHECK (currency IN ('usd','eur','mxn')) DEFAULT 'usd',
  ADD COLUMN IF NOT EXISTS duration_minutes integer,
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS gallery jsonb,
  ADD COLUMN IF NOT EXISTS tags text[];

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS membership_tier_snapshot text,
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS party_size integer,
  ADD COLUMN IF NOT EXISTS special_requests text,
  ADD COLUMN IF NOT EXISTS qr_code_id uuid;

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS slug text UNIQUE,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS platform course_platform_enum DEFAULT 'internal',
  ADD COLUMN IF NOT EXISTS external_course_id text,
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_tier membership_tier_enum;


-- 3. PROFILES (separado de la tabla users legacy)

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  country text,
  preferred_language text CHECK (preferred_language IN ('es','en')) DEFAULT 'es',
  default_destination text,
  avatar_url text,
  expo_push_token text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user','staff','admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile (profiles)"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile (profiles)"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile (profiles)"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- 4. MEMBERSHIPS (membresías ligadas a Stripe)

CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier membership_tier_enum NOT NULL,
  status membership_status_enum NOT NULL DEFAULT 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  auto_renew boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memberships"
  ON memberships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


-- 5. EXPERIENCE MEMBERSHIP RULES + QR CODES

CREATE TABLE IF NOT EXISTS experience_membership_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  tier membership_tier_enum NOT NULL,
  included boolean DEFAULT false,
  price_override numeric(10,2),
  upgrade_benefit text,
  notes_for_concierge text
);

ALTER TABLE experience_membership_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view experience_membership_rules"
  ON experience_membership_rules FOR SELECT
  TO authenticated
  USING (true);


CREATE TABLE IF NOT EXISTS experience_qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  qr_image_url text,
  is_one_time boolean DEFAULT true,
  is_redeemed boolean DEFAULT false,
  redeemed_at timestamptz,
  redeemed_by_user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE experience_qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see QR codes for their reservations"
  ON experience_qr_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM reservations r
      WHERE r.qr_code_id = experience_qr_codes.id
        AND r.user_id = auth.uid()
    )
  );


-- 6. PAYMENTS (para reservas y trazabilidad de Stripe)

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES reservations(id) ON DELETE SET NULL,
  stripe_payment_intent_id text,
  checkout_session_id text,
  amount numeric(10,2),
  currency text,
  status text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


-- 7. CONCIERGE (AI + humano) – conversations, messages, concierge_requests, handoffs

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status conversation_status_enum NOT NULL DEFAULT 'active',
  priority integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type sender_type_enum NOT NULL,
  sender_id uuid,
  content text NOT NULL,
  is_internal_note boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_type = 'user'
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );


CREATE TABLE IF NOT EXISTS concierge_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category concierge_request_category_enum NOT NULL DEFAULT 'other',
  destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,
  status concierge_request_status_enum NOT NULL DEFAULT 'open',
  ai_confidence numeric(3,2),
  summary text,
  structured_payload jsonb,
  sla_deadline timestamptz,
  resolution_source text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE concierge_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own concierge_requests"
  ON concierge_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concierge_request_id uuid NOT NULL REFERENCES concierge_requests(id) ON DELETE CASCADE,
  triggered_by text NOT NULL CHECK (triggered_by IN ('ai','user','system')),
  reason text,
  assigned_staff_id uuid REFERENCES auth.users(id),
  assigned_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE handoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view handoffs for their requests"
  ON handoffs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM concierge_requests cr
      WHERE cr.id = handoffs.concierge_request_id
        AND cr.user_id = auth.uid()
    )
  );


-- 8. EDUCATION & COMMUNITY (courses, access, events, registrations)

CREATE TABLE IF NOT EXISTS course_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  access_source course_access_source_enum NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE course_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own course_access"
  ON course_access FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,
  start_at timestamptz NOT NULL,
  location text,
  max_attendees integer,
  min_tier membership_tier_enum,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);


CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status event_registration_status_enum NOT NULL DEFAULT 'registered',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own event_registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own event_registrations"
  ON event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);


-- 9. NOTIFICATIONS & ANALYTICS

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  type notification_type_enum NOT NULL,
  sent_via notification_sent_via_enum NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications addressed to them or broadcast"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    user_id IS NULL OR user_id = auth.uid()
  );


CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name text NOT NULL,
  properties jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert analytics_events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- 10. REAL ESTATE (PROPERTIES) + COMMUNITY + DEVICE TOKENS

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  destination_id uuid REFERENCES destinations(id) ON DELETE SET NULL,
  location_text text,
  price numeric(12,2),
  currency text CHECK (currency IN ('usd','eur','mxn')) DEFAULT 'usd',
  property_type property_type_enum NOT NULL DEFAULT 'apartment',
  status property_status_enum NOT NULL DEFAULT 'available',
  bedrooms integer,
  bathrooms integer,
  area_m2 numeric(10,2),
  lot_m2 numeric(10,2),
  is_featured boolean DEFAULT false,
  main_image_url text,
  gallery jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view properties"
  ON properties FOR SELECT
  TO authenticated
  USING (true);


CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  image_url text,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published community_posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Authors can manage own community_posts"
  ON community_posts FOR ALL
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());


CREATE TABLE IF NOT EXISTS device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL,
  platform text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own device_tokens"
  ON device_tokens FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 11. POLÍTICAS PARA STAFF/ADMIN (gestión desde Admin Panel)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'experiences' AND policyname = 'Staff can manage experiences'
  ) THEN
    CREATE POLICY "Staff can manage experiences"
      ON experiences FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('staff','admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('staff','admin')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'destinations' AND policyname = 'Staff can manage destinations'
  ) THEN
    CREATE POLICY "Staff can manage destinations"
      ON destinations FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('staff','admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('staff','admin')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Staff can manage categories'
  ) THEN
    CREATE POLICY "Staff can manage categories"
      ON categories FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('staff','admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('staff','admin')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'courses' AND policyname = 'Staff can manage courses'
  ) THEN
    CREATE POLICY "Staff can manage courses"
      ON courses FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('staff','admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('staff','admin')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'events' AND policyname = 'Staff can manage events'
  ) THEN
    CREATE POLICY "Staff can manage events"
      ON events FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('staff','admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('staff','admin')
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'properties' AND policyname = 'Staff can manage properties'
  ) THEN
    CREATE POLICY "Staff can manage properties"
      ON properties FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('staff','admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
            AND p.role IN ('staff','admin')
        )
      );
  END IF;
END $$;


-- 12. BUCKETS DE STORAGE (opcional, pero útil dejarlo aquí)

insert into storage.buckets (id, name, public)
values
  ('experiences', 'experiences', true),
  ('properties',  'properties',  true),
  ('courses',     'courses',     true),
  ('qr-codes',    'qr-codes',    true),
  ('avatars',     'avatars',     true)
on conflict (id) do nothing;




-- =========================================================
-- DUKE LIFE – AI CONCIERGE CONFIG (ADMIN-EDITABLE)
-- =========================================================
-- supabase/migrations/20251125002_ai_concierge_configs.sql



-- 1. ENUM PARA FORMATO DE RESPUESTA (JSON O TEXTO)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_concierge_response_format_enum') THEN
    CREATE TYPE ai_concierge_response_format_enum AS ENUM ('json','text');
  END IF;
END $$;


-- 2. TABLA DE CONFIGURACIÓN DEL CONCIERGE
CREATE TABLE IF NOT EXISTS ai_concierge_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,                         -- Nombre visible en el panel
  is_active boolean NOT NULL DEFAULT true,    -- Solo se lee la config activa más reciente
  model text NOT NULL DEFAULT 'gpt-4o',       -- Modelo OpenAI
  temperature numeric(3,2) NOT NULL DEFAULT 0.30,
  top_p numeric(3,2),                         -- Opcional, 0.0 - 1.0
  max_tokens integer,                         -- Opcional, ej. 512, 1024...
  response_format ai_concierge_response_format_enum NOT NULL DEFAULT 'json',
  system_prompt_template text NOT NULL,       -- Prompt con variables {{membership_tier}}, etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_concierge_configs ENABLE ROW LEVEL SECURITY;


-- 3. POLÍTICAS DE RLS
--    a) Solo staff/admin pueden crear/editar configs
--    b) Cualquiera autenticado puede ver la config activa (por si algún día la usas client-side)
CREATE POLICY "Staff/admin manage ai_concierge_configs"
  ON ai_concierge_configs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('staff','admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('staff','admin')
    )
  );

CREATE POLICY "Anyone can read active ai_concierge_configs"
  ON ai_concierge_configs
  FOR SELECT
  TO authenticated
  USING (is_active = true);


-- 4. CONFIG POR DEFECTO (SOLO SI LA TABLA ESTÁ VACÍA)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM ai_concierge_configs) THEN
    INSERT INTO ai_concierge_configs (
      name,
      is_active,
      model,
      temperature,
      response_format,
      system_prompt_template
    )
    VALUES (
      'Default Duke Life Concierge',
      true,
      'gpt-4o',
      0.30,
      'json',
      $PROMPT$
Eres el concierge de lujo oficial de Duke Life.

Variables de contexto:
- membership_tier: {{membership_tier}}
- preferred_language: {{preferred_language}}
- default_destination: {{default_destination}}
- user_id: {{user_id}}

Tu misión:
1. Responder siempre con el tono de un concierge de hotel 5★ / lifestyle manager.
2. Pensar en experiencias y servicios premium, especialmente para el destino del usuario.
3. Hacer preguntas inteligentes si falta información clave antes de proponer algo.
4. Decidir si la IA puede resolver sola o si se necesita un concierge humano.

Formato de salida:
Debes responder SIEMPRE con un JSON válido, sin texto adicional, sin Markdown, sin comentarios.
Estructura EXACTA:

{
  "assistant_reply": "texto que verá el usuario (en el idioma correcto)",
  "intent": "reservation | upgrade | transport | recommendation | issue | other",
  "needs_human": true o false,
  "confidence": número entre 0.0 y 1.0,
  "summary": "resumen corto de lo que pide",
  "structured_payload": {
    "date": "YYYY-MM-DD o null",
    "time": "HH:mm o null",
    "people": número o null,
    "budget": número o null,
    "destination": "slug del destino o null",
    "notes": "texto adicional o null"
  }
}

No incluyas nada fuera del JSON. No uses Markdown. No expliques el formato.
$PROMPT$
    );
  END IF;
END $$;



-- =========================================================
-- DUKE LIFE – STAFF NOTIFICATION CHANNELS
-- =========================================================
--supabase/migrations/20251125003_staff_notification_channels.sql

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'staff_notification_channel_type_enum'
  ) THEN
    CREATE TYPE staff_notification_channel_type_enum AS ENUM (
      'email',
      'whatsapp',
      'slack',
      'notion',
      'other'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS staff_notification_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel_type staff_notification_channel_type_enum NOT NULL,
  address text NOT NULL,     -- email, teléfono, webhook, etc.
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE staff_notification_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff/admin manage staff_notification_channels"
  ON staff_notification_channels
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('staff','admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('staff','admin')
    )
  );
