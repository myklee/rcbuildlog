-- Add tags column to projects table
ALTER TABLE projects ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create index for tags
CREATE INDEX idx_projects_tags ON projects USING GIN (tags);

-- Add RLS policy for tags
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy for selecting projects with tags
CREATE POLICY "Users can view their own projects' tags"
ON projects FOR SELECT
USING (auth.uid() = user_id);

-- Policy for updating projects with tags
CREATE POLICY "Users can update their own projects' tags"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

-- Policy for inserting projects with tags
CREATE POLICY "Users can insert projects with tags"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id); 