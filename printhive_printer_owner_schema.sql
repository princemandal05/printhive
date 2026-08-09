-- ====================================================================
-- PrintHive 3D Printer Hub & Location Schema Migration Script
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- ====================================================================

-- 1. Create public.printers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.printers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  printer_model TEXT,
  name TEXT,
  technology TEXT DEFAULT 'FDM Dual-Color Precision',
  build_volume TEXT DEFAULT '256 x 256 x 256 mm',
  max_resolution TEXT DEFAULT '0.05 mm',
  base_price NUMERIC DEFAULT 350,
  working_hours TEXT DEFAULT '09:00 AM - 09:00 PM',
  materials TEXT[] DEFAULT ARRAY['PLA', 'PETG'],
  latitude DOUBLE PRECISION DEFAULT 28.6139,
  longitude DOUBLE PRECISION DEFAULT 77.2090,
  address TEXT,
  city TEXT,
  image_url TEXT,
  cloudinary_public_id TEXT,
  status TEXT DEFAULT 'online',
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 4.9,
  completed_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Safely add any missing columns if public.printers already exists
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS printer_model TEXT;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS technology TEXT DEFAULT 'FDM Dual-Color Precision';
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS build_volume TEXT DEFAULT '256 x 256 x 256 mm';
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS max_resolution TEXT DEFAULT '0.05 mm';
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS base_price NUMERIC DEFAULT 350;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS working_hours TEXT DEFAULT '09:00 AM - 09:00 PM';
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS materials TEXT[] DEFAULT ARRAY['PLA', 'PETG'];
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION DEFAULT 28.6139;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION DEFAULT 77.2090;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'online';
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 4.9;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS completed_orders INTEGER DEFAULT 0;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Enable RLS and add public read & owner full access policies
ALTER TABLE public.printers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public printers read access" ON public.printers;
CREATE POLICY "Public printers read access" ON public.printers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owners manage own printers" ON public.printers;
CREATE POLICY "Owners manage own printers" ON public.printers FOR ALL USING (auth.uid() = owner_id);

-- 4. Enable public.orders RLS policies for printer owners
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public orders read access" ON public.orders;
CREATE POLICY "Public orders read access" ON public.orders FOR SELECT USING (true);
