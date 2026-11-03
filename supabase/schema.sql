-- ============================================================
-- Soghat-e-Chakwal — Supabase Production Schema & Seed
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. CATEGORIES TABLE
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  name_urdu text,
  slug text unique not null,
  description text,
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PRODUCTS TABLE
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  name_urdu text,
  slug text unique not null,
  description text not null,
  short_description text not null,
  features text[] default '{}',
  ingredients text[] default '{}',
  storage_instructions text,
  shipping_info text,
  is_active boolean default true,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PRODUCT VARIANTS TABLE
create table if not exists product_variants (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete cascade not null,
  name text not null, -- '1 Liter', '500ml'
  size text not null, -- '1L', '500ml'
  price numeric(10, 2) not null,
  compare_at_price numeric(10, 2),
  sku text unique not null,
  weight_grams integer default 1000,
  stock_quantity integer default 50,
  in_stock boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ORDERS TABLE
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  customer_whatsapp text,
  customer_email text,
  delivery_address text not null,
  delivery_city text not null,
  delivery_province text not null,
  delivery_notes text,
  payment_method text not null default 'cod', -- 'cod' | 'bank_transfer'
  payment_status text not null default 'pending', -- 'pending' | 'received' | 'refunded'
  order_status text not null default 'pending', -- 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
  subtotal numeric(10, 2) not null,
  shipping_fee numeric(10, 2) not null default 200,
  total_amount numeric(10, 2) not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. INITIAL SEED DATA
insert into categories (name, name_urdu, slug, description, is_active)
values 
  ('Cooking Oils', 'کھانا پکانے کے تیل', 'cooking-oils', 'Traditional cooking oils inspired by Chakwal heritage.', true),
  ('Desi Ghee', 'دیسی گھی', 'desi-ghee', 'Pure desi ghee made the traditional way.', false),
  ('Honey', 'شہد', 'honey', 'Natural honey from the hills of Pakistan.', false),
  ('Spices', 'مصالحے', 'spices', 'Authentic Pakistani spices and blends.', false),
  ('Pickles', 'اچار', 'pickles', 'Traditional homestyle pickles.', false)
on conflict (slug) do nothing;
