create table if not exists public.profiles (
  id uuid primary key, owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,40}$'), goal text not null default 'creator',
  display_name text not null, title text default '', bio text default '', image_alt text default '', image_url text,
  theme jsonb not null default '{}'::jsonb, published boolean not null default false,
  previous_slugs text[] not null default '{}', updated_at timestamptz not null default now(), published_at timestamptz
);
create table if not exists public.profile_links (
  id uuid primary key, profile_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null, label text not null, url text not null, enabled boolean not null default true,
  "order" integer not null default 0
);
alter table public.profiles enable row level security; alter table public.profile_links enable row level security;
create policy "owners manage profiles" on public.profiles for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "published profiles are public" on public.profiles for select using (published=true);
create policy "owners manage links" on public.profile_links for all using (exists(select 1 from public.profiles p where p.id=profile_id and p.owner_id=auth.uid())) with check (exists(select 1 from public.profiles p where p.id=profile_id and p.owner_id=auth.uid()));
create policy "published links are public" on public.profile_links for select using (enabled and exists(select 1 from public.profiles p where p.id=profile_id and p.published=true));
insert into storage.buckets (id,name,public) values ('profile-media','profile-media',true) on conflict do nothing;
create policy "owners upload profile media" on storage.objects for all using (bucket_id='profile-media' and auth.uid()::text=(storage.foldername(name))[1]) with check (bucket_id='profile-media' and auth.uid()::text=(storage.foldername(name))[1]);
create policy "profile media is public" on storage.objects for select using (bucket_id='profile-media');
