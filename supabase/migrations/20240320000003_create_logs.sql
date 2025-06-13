-- Create logs table
create table if not exists public.logs (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    content text,
    image_url text,
    links jsonb default '[]'::jsonb,
    tags text[] default '{}'::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.logs enable row level security;

-- Create policies
create policy "Users can view their own logs"
    on public.logs for select
    using (auth.uid() = user_id);

create policy "Users can insert their own logs"
    on public.logs for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own logs"
    on public.logs for update
    using (auth.uid() = user_id);

create policy "Users can delete their own logs"
    on public.logs for delete
    using (auth.uid() = user_id);

-- Create function to handle updated_at
create or replace function public.handle_logs_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_logs_updated_at
    before update on public.logs
    for each row
    execute function public.handle_logs_updated_at();

-- Create indexes for better query performance
create index if not exists idx_logs_project_id
    on public.logs(project_id);

create index if not exists idx_logs_user_id
    on public.logs(user_id);

create index if not exists idx_logs_created_at
    on public.logs(created_at); 