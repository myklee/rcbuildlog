-- Add archived field to projects table
alter table public.projects
add column if not exists archived boolean default false;

-- Create index for faster archived queries
create index if not exists idx_projects_archived
on public.projects(archived);

-- Create index for faster user_id queries
create index if not exists idx_projects_user_id
on public.projects(user_id); 