-- ============================================================
-- Voyatri Database Schema
-- Run this in Supabase SQL Editor to set up all tables + RLS
-- ============================================================

-- ========================
-- 1. USERS
-- ========================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

-- Auto-create user row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================
-- 2. PLACES (admin-curated)
-- ========================
CREATE TABLE IF NOT EXISTS public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  tags TEXT[] DEFAULT '{}',
  verified BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read verified places"
  ON public.places FOR SELECT
  USING (verified = true);

CREATE POLICY "Admins full access to places"
  ON public.places FOR ALL
  USING (public.is_admin());

-- ========================
-- 3. PLACE IMAGES
-- ========================
CREATE TABLE IF NOT EXISTS public.place_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.place_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read verified place images"
  ON public.place_images FOR SELECT
  USING (verified = true);

CREATE POLICY "Admins full access to place_images"
  ON public.place_images FOR ALL
  USING (public.is_admin());

-- ========================
-- 4. USER PLACES
-- ========================
CREATE TABLE IF NOT EXISTS public.user_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  linked_place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own user_places"
  ON public.user_places FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create user_places"
  ON public.user_places FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own user_places"
  ON public.user_places FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own user_places"
  ON public.user_places FOR DELETE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins full access to user_places"
  ON public.user_places FOR ALL
  USING (public.is_admin());

-- ========================
-- 5. PLACE SUBMISSIONS
-- ========================
CREATE TABLE IF NOT EXISTS public.place_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  tags TEXT[] DEFAULT '{}',
  submitted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.place_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own submissions"
  ON public.place_submissions FOR SELECT
  USING (auth.uid() = submitted_by);

CREATE POLICY "Users can create submissions"
  ON public.place_submissions FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins full access to place_submissions"
  ON public.place_submissions FOR ALL
  USING (public.is_admin());

-- ========================
-- 6. IMAGE SUBMISSIONS
-- ========================
CREATE TABLE IF NOT EXISTS public.image_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  submitted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.image_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own image_submissions"
  ON public.image_submissions FOR SELECT
  USING (auth.uid() = submitted_by);

CREATE POLICY "Users can create image_submissions"
  ON public.image_submissions FOR INSERT
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins full access to image_submissions"
  ON public.image_submissions FOR ALL
  USING (public.is_admin());

-- ========================
-- 7. DECKS
-- ========================
CREATE TABLE IF NOT EXISTS public.decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own decks"
  ON public.decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read public decks"
  ON public.decks FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create own decks"
  ON public.decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks"
  ON public.decks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks"
  ON public.decks FOR DELETE
  USING (auth.uid() = user_id);

-- ========================
-- 8. DECK ITEMS
-- ========================
CREATE TABLE IF NOT EXISTS public.deck_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
  user_place_id UUID REFERENCES public.user_places(id) ON DELETE SET NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT at_least_one_place CHECK (place_id IS NOT NULL OR user_place_id IS NOT NULL)
);

ALTER TABLE public.deck_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own deck items"
  ON public.deck_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.decks d WHERE d.id = deck_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read items of public decks"
  ON public.deck_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.decks d WHERE d.id = deck_id AND d.is_public = true
    )
  );

-- ========================
-- 9. DECK LIKES
-- ========================
CREATE TABLE IF NOT EXISTS public.deck_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(deck_id, user_id)
);

ALTER TABLE public.deck_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own likes"
  ON public.deck_likes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read like counts"
  ON public.deck_likes FOR SELECT
  USING (true);

-- ========================
-- 10. DECK SAVES
-- ========================
CREATE TABLE IF NOT EXISTS public.deck_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(deck_id, user_id)
);

ALTER TABLE public.deck_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saves"
  ON public.deck_saves FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read save counts"
  ON public.deck_saves FOR SELECT
  USING (true);

-- ========================
-- INDEXES for performance
-- ========================
CREATE INDEX IF NOT EXISTS idx_places_tags ON public.places USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_places_verified ON public.places (verified);
CREATE INDEX IF NOT EXISTS idx_place_images_place_id ON public.place_images (place_id);
CREATE INDEX IF NOT EXISTS idx_user_places_created_by ON public.user_places (created_by);
CREATE INDEX IF NOT EXISTS idx_place_submissions_status ON public.place_submissions (status);
CREATE INDEX IF NOT EXISTS idx_image_submissions_status ON public.image_submissions (status);
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON public.decks (user_id);
CREATE INDEX IF NOT EXISTS idx_decks_is_public ON public.decks (is_public);
CREATE INDEX IF NOT EXISTS idx_deck_items_deck_id ON public.deck_items (deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_likes_deck_id ON public.deck_likes (deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_saves_deck_id ON public.deck_saves (deck_id);
