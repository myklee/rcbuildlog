-- Create storage bucket for project images
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true);

-- Set up storage policies
create policy "Project images are publicly accessible"
on storage.objects for select
using (bucket_id = 'project-images');

create policy "Authenticated users can upload project images"
on storage.objects for insert
with check (
    bucket_id = 'project-images'
    and auth.role() = 'authenticated'
);

create policy "Users can update their own project images"
on storage.objects for update
using (
    bucket_id = 'project-images'
    and auth.uid() = owner
);

create policy "Users can delete their own project images"
on storage.objects for delete
using (
    bucket_id = 'project-images'
    and auth.uid() = owner
); 