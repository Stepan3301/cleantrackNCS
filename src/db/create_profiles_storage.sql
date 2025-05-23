-- Create profiles storage bucket
insert into storage.buckets (id, name)
values ('profiles', 'profiles');

-- Set up storage policies
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'profiles' );

create policy "Users can upload their own avatar image"
  on storage.objects for insert
  with check (
    bucket_id = 'profiles'
    and auth.uid() = (storage.foldername(name))[1]::uuid
  );

create policy "Users can update their own avatar image"
  on storage.objects for update
  using (
    bucket_id = 'profiles'
    and auth.uid() = (storage.foldername(name))[1]::uuid
  );

create policy "Users can delete their own avatar image"
  on storage.objects for delete
  using (
    bucket_id = 'profiles'
    and auth.uid() = (storage.foldername(name))[1]::uuid
  ); 