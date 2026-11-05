-- =====================================================================
--  গুঞ্জরণ আইটি টিম — আপগ্রেড ০৩: পুরো সাইট অ্যাডমিন থেকে এডিট করার সিস্টেম
--  কোথায় চালাবেন: Supabase Dashboard → SQL Editor → New query → পুরোটা পেস্ট → Run
--  নিরাপদ: একাধিকবার চালালেও সমস্যা নেই (idempotent)। আগের কোনো ডেটা মুছে না।
--
--  যা যোগ হচ্ছে:
--   ১) site_settings   — সাইটের সব লেখা / ডিজাইন / অ্যানিমেশন / সেকশন সেটিংস
--   ২) team_members.photo_url — টিম মেম্বারের ছবি
--   ৩) projects.images — প্রজেক্টে যত খুশি ছবি (গ্যালারি)
--   ৪) ছবির সর্বোচ্চ সাইজ সীমা (সার্ভার-সাইডেও): প্রোফাইল ১০০KB, প্রজেক্ট ৩০০KB
-- =====================================================================

-- ---------------------------------------------------------------------
-- ১) সাইট সেটিংস (key → JSON)
--    texts   : { "hero.1": "নতুন লেখা", ... }
--    design  : { "green": "#22E58B", ... }
--    anim    : { "preloader": true, "speed": 1, ... }
--    general : { "title": "...", "description": "...", "hidden": ["faq"] }
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key check (char_length(key) between 1 and 60),
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
drop trigger if exists trg_site_settings_updated on public.site_settings;
create trigger trg_site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;
drop policy if exists "public read settings" on public.site_settings;
drop policy if exists "admin all" on public.site_settings;
create policy "public read settings" on public.site_settings
  for select to anon, authenticated using (true);
create policy "admin all" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.site_settings to anon;
grant select, insert, update, delete on public.site_settings to authenticated;

-- ---------------------------------------------------------------------
-- ২) টিম মেম্বারের ছবি
-- ---------------------------------------------------------------------
alter table public.team_members add column if not exists photo_url text;
alter table public.team_members drop constraint if exists team_photo_https;
alter table public.team_members add constraint team_photo_https
  check (photo_url is null or photo_url ~ '^https://');

-- ---------------------------------------------------------------------
-- ৩) প্রজেক্টের একাধিক ছবি (প্রথম ছবিটি কভার)
-- ---------------------------------------------------------------------
alter table public.projects add column if not exists images text[] not null default '{}';
-- আগের একক ছবি থাকলে গ্যালারিতে তুলে আনা
update public.projects
   set images = array[image_url]
 where image_url is not null and coalesce(array_length(images,1),0) = 0;

-- ---------------------------------------------------------------------
-- ৪) স্টোরেজ বাকেট: সর্বোচ্চ সাইজ সার্ভারেও বাধা
--    (ব্রাউজার ছবি নিজে কমপ্রেস করে পাঠায়; এটি দ্বিতীয় নিরাপত্তা স্তর)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 307200,
        array['image/webp','image/jpeg','image/png'])
on conflict (id) do update
  set public = true, file_size_limit = 307200,
      allowed_mime_types = array['image/webp','image/jpeg','image/png'];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('team-images', 'team-images', true, 102400,
        array['image/webp','image/jpeg','image/png'])
on conflict (id) do update
  set public = true, file_size_limit = 102400,
      allowed_mime_types = array['image/webp','image/jpeg','image/png'];

drop policy if exists "admin upload team images" on storage.objects;
drop policy if exists "admin update team images" on storage.objects;
drop policy if exists "admin delete team images" on storage.objects;
drop policy if exists "admin list team images"   on storage.objects;
create policy "admin upload team images" on storage.objects
  for insert to authenticated with check (bucket_id = 'team-images' and public.is_admin());
create policy "admin update team images" on storage.objects
  for update to authenticated using (bucket_id = 'team-images' and public.is_admin())
  with check (bucket_id = 'team-images' and public.is_admin());
create policy "admin delete team images" on storage.objects
  for delete to authenticated using (bucket_id = 'team-images' and public.is_admin());
create policy "admin list team images" on storage.objects
  for select to authenticated using (bucket_id = 'team-images' and public.is_admin());

-- =====================================================================
-- শেষ! এখন নতুন অ্যাডমিন প্যানেল ব্যবহার করুন: https://আপনার-সাইট/admin/
-- =====================================================================
