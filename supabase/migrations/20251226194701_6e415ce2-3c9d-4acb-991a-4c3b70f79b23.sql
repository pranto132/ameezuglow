-- Create storage bucket for admin uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-uploads', 'admin-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload admin files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'admin-uploads');

-- Allow public read access
CREATE POLICY "Public can view admin files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'admin-uploads');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update admin files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'admin-uploads');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete admin files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'admin-uploads');