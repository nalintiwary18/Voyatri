-- ============================================================
-- Supabase Storage: Create bucket for place images
-- Run in Supabase SQL Editor
-- ============================================================

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('place-images', 'place-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'place-images');

-- Allow anyone to read images
CREATE POLICY "Anyone can read place images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'place-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'place-images' AND (storage.foldername(name))[1] = auth.uid()::text);
