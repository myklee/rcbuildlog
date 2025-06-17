-- Add is_private field to projects table
ALTER TABLE public.projects
ADD COLUMN is_private boolean DEFAULT false;

-- Create index for faster private queries
CREATE INDEX IF NOT EXISTS idx_projects_is_private
ON public.projects(is_private);

-- Update RLS policies to handle private projects
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view public projects" ON public.projects;

-- Policy for viewing projects (own projects or public projects)
CREATE POLICY "Users can view their own projects or public projects"
ON public.projects FOR SELECT
USING (
  auth.uid() = user_id OR 
  (is_private = false)
);

-- Policy for inserting projects
CREATE POLICY "Users can insert their own projects"
ON public.projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for updating projects
CREATE POLICY "Users can update their own projects"
ON public.projects FOR UPDATE
USING (auth.uid() = user_id);

-- Policy for deleting projects
CREATE POLICY "Users can delete their own projects"
ON public.projects FOR DELETE
USING (auth.uid() = user_id); 