-- Add video_url column to logs table
ALTER TABLE logs ADD COLUMN video_url TEXT;

-- Update RLS policies to include video_url
ALTER POLICY "Users can view their own logs" ON logs
  USING (auth.uid() = user_id);

ALTER POLICY "Users can insert their own logs" ON logs
  WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Users can update their own logs" ON logs
  USING (auth.uid() = user_id);

ALTER POLICY "Users can delete their own logs" ON logs
  USING (auth.uid() = user_id); 