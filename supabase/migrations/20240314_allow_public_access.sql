-- Allow public access to projects
ALTER POLICY "Users can view their own projects" ON projects
  USING (true);

-- Allow public access to logs
ALTER POLICY "Users can view their own logs" ON logs
  USING (true); 