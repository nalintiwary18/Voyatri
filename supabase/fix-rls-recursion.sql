-- ============================================================
-- Fix: Replace all admin policies that recursively query the users table
-- with the is_admin() security definer function
-- ============================================================

-- 1. Create the helper function (if not already created)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Fix USERS table
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (public.is_admin());

-- 3. Fix PLACES table
DROP POLICY IF EXISTS "Admins full access to places" ON public.places;
CREATE POLICY "Admins full access to places"
  ON public.places FOR ALL
  USING (public.is_admin());

-- 4. Fix PLACE_IMAGES table
DROP POLICY IF EXISTS "Admins full access to place_images" ON public.place_images;
CREATE POLICY "Admins full access to place_images"
  ON public.place_images FOR ALL
  USING (public.is_admin());

-- 5. Fix USER_PLACES table
DROP POLICY IF EXISTS "Admins full access to user_places" ON public.user_places;
CREATE POLICY "Admins full access to user_places"
  ON public.user_places FOR ALL
  USING (public.is_admin());

-- 6. Fix PLACE_SUBMISSIONS table
DROP POLICY IF EXISTS "Admins full access to place_submissions" ON public.place_submissions;
CREATE POLICY "Admins full access to place_submissions"
  ON public.place_submissions FOR ALL
  USING (public.is_admin());

-- 7. Fix IMAGE_SUBMISSIONS table
DROP POLICY IF EXISTS "Admins full access to image_submissions" ON public.image_submissions;
CREATE POLICY "Admins full access to image_submissions"
  ON public.image_submissions FOR ALL
  USING (public.is_admin());
