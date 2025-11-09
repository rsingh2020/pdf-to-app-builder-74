-- Create storage bucket for ID documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('id-documents', 'id-documents', false);

-- Create RLS policies for id-documents bucket
CREATE POLICY "Users can upload their own ID documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'id-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own ID documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'id-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own ID documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'id-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);