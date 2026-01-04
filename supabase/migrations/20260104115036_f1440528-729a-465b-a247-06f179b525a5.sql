-- Create storage bucket for complaint images
INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-images', 'complaint-images', true);

-- Storage policies for complaint images
CREATE POLICY "Anyone can view complaint images" ON storage.objects FOR SELECT USING (bucket_id = 'complaint-images');
CREATE POLICY "Authenticated users can upload complaint images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'complaint-images');
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'complaint-images' AND auth.uid()::text = (storage.foldername(name))[1]);