-- Update the storage bucket CORS and security policies
update storage.buckets
set public = true,
    file_size_limit = 5242880, -- 5MB
    allowed_mime_types = array['text/html', 'application/javascript', 'text/javascript'],
    cors_origins = array['*']
where id = 'static';

-- Ensure proper RLS policies for the static bucket
create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'static' );

create policy "Public Upload"
on storage.objects for insert
to public
with check ( bucket_id = 'static' );