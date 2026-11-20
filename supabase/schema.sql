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

alter table public.profiles add column if not exists email text default '';
alter table public.profiles add column if not exists phone text default '';
alter table public.profiles add column if not exists location text default '';
alter table public.profiles add column if not exists timezone text not null default 'UTC';
alter table public.profiles add column if not exists contact jsonb not null default '{"enabled":false,"email":"","heading":"Let''s work together"}'::jsonb;
alter table public.profiles add column if not exists seo jsonb not null default '{}'::jsonb;
alter table public.profile_links add column if not exists featured boolean not null default false;
alter table public.profile_links add column if not exists thumbnail_url text;
alter table public.profile_links add column if not exists starts_at timestamptz;
alter table public.profile_links add column if not exists ends_at timestamptz;

create table if not exists public.slug_redirects (old_slug text primary key, profile_id uuid not null references public.profiles(id) on delete cascade, created_at timestamptz not null default now());
create table if not exists public.daily_profile_metrics (profile_id uuid not null references public.profiles(id) on delete cascade, date date not null default current_date, views integer not null default 0, clicks integer not null default 0, primary key(profile_id,date));
create table if not exists public.daily_link_metrics (link_id uuid not null references public.profile_links(id) on delete cascade, date date not null default current_date, clicks integer not null default 0, primary key(link_id,date));
create table if not exists public.contact_submissions (id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, name text not null check(char_length(name) between 1 and 100), email text not null, message text not null check(char_length(message) between 1 and 2000), status text not null default 'unread' check(status in ('unread','read','archived')), created_at timestamptz not null default now());
create table if not exists public.contact_rate_limits (profile_id uuid not null references public.profiles(id) on delete cascade, bucket timestamptz not null, submissions integer not null default 0, primary key(profile_id,bucket));
alter table public.slug_redirects enable row level security; alter table public.daily_profile_metrics enable row level security; alter table public.daily_link_metrics enable row level security; alter table public.contact_submissions enable row level security; alter table public.contact_rate_limits enable row level security;
create policy "redirects are public" on public.slug_redirects for select using (true);
create policy "owners manage redirects" on public.slug_redirects for all using (exists(select 1 from public.profiles p where p.id=profile_id and p.owner_id=auth.uid())) with check (exists(select 1 from public.profiles p where p.id=profile_id and p.owner_id=auth.uid()));
create policy "owners read profile metrics" on public.daily_profile_metrics for select using (exists(select 1 from public.profiles p where p.id=profile_id and p.owner_id=auth.uid()));
create policy "owners read link metrics" on public.daily_link_metrics for select using (exists(select 1 from public.profile_links l join public.profiles p on p.id=l.profile_id where l.id=link_id and p.owner_id=auth.uid()));
create policy "owners manage contacts" on public.contact_submissions for all using (exists(select 1 from public.profiles p where p.id=profile_id and p.owner_id=auth.uid())) with check (exists(select 1 from public.profiles p where p.id=profile_id and p.owner_id=auth.uid()));

create or replace function public.increment_profile_view(target_profile uuid) returns void language plpgsql security definer set search_path=public as $$ begin if not exists(select 1 from profiles where id=target_profile and published=true) then return; end if; insert into daily_profile_metrics(profile_id,date,views) values(target_profile,current_date,1) on conflict(profile_id,date) do update set views=daily_profile_metrics.views+1; end; $$;
create or replace function public.increment_link_click(target_profile uuid,target_link uuid) returns void language plpgsql security definer set search_path=public as $$ begin if not exists(select 1 from profile_links l join profiles p on p.id=l.profile_id where l.id=target_link and p.id=target_profile and p.published=true and l.enabled=true) then return; end if; insert into daily_profile_metrics(profile_id,date,clicks) values(target_profile,current_date,1) on conflict(profile_id,date) do update set clicks=daily_profile_metrics.clicks+1; insert into daily_link_metrics(link_id,date,clicks) values(target_link,current_date,1) on conflict(link_id,date) do update set clicks=daily_link_metrics.clicks+1; end; $$;
grant execute on function public.increment_profile_view(uuid) to anon,authenticated; grant execute on function public.increment_link_click(uuid,uuid) to anon,authenticated;

create table if not exists public.cards (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled card',
  profile_id uuid references public.profiles(id) on delete set null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cards_owner_updated_idx on public.cards(owner_id,updated_at desc);
create index if not exists cards_profile_idx on public.cards(profile_id);
alter table public.cards enable row level security;
create policy "owners manage cards" on public.cards for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());
insert into storage.buckets(id,name,public) values('card-assets','card-assets',false) on conflict do nothing;
create policy "owners manage card assets" on storage.objects for all using (bucket_id='card-assets' and auth.uid()::text=(storage.foldername(name))[1]) with check (bucket_id='card-assets' and auth.uid()::text=(storage.foldername(name))[1]);
