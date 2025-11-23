/*
  # Duke Life App Database Schema

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