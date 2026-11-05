-- =====================================================================
--  গুঞ্জরণ আইটি টিম — Supabase স্কিমা
--  কোথায় চালাবেন: Supabase Dashboard → SQL Editor → New query → পুরোটা পেস্ট → Run
--  নিরাপদ: একাধিকবার চালালেও সমস্যা নেই (idempotent)।
-- =====================================================================

-- ---------------------------------------------------------------------
-- ১) অ্যাডমিন তালিকা ও হেল্পার ফাংশন
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- admins টেবিলে কোনো policy নেই: API দিয়ে কেউ এটি পড়তে/লিখতে পারবে না।
-- অ্যাডমিন যোগ করতে হবে শুধু SQL Editor থেকে (নিচে "ধাপ ৪" দেখুন)।

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- updated_at অটো-আপডেট
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

-- ---------------------------------------------------------------------
-- ২) কনটেন্ট টেবিল (ওয়েবসাইটে যা দেখা যায়)
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  category     text not null check (category in ('web','app')),
  name_bn      text not null check (char_length(name_bn) between 1 and 120),
  name_en      text not null check (char_length(name_en) between 1 and 160),
  description  text not null default '' check (char_length(description) <= 2000),
  url          text check (url is null or char_length(url) <= 300),
  tech         text[] not null default '{}',
  visual       text not null default 'v1' check (visual in ('v1','v2','v3')),
  size         text not null default 'n'  check (size in ('w','n')),
  image_url    text check (image_url is null or image_url ~ '^https://'),
  sort_order   int  not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
drop trigger if exists trg_projects_updated on public.projects;
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

create table if not exists public.team_members (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 120),
  initial      text not null default '' check (char_length(initial) <= 4),
  role         text not null default '' check (char_length(role) <= 120),
  skills       jsonb not null default '[]'::jsonb,   -- [{"name":"Flutter","level":90}, ...]
  sort_order   int  not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question     text not null check (char_length(question) between 1 and 300),
  answer       text not null check (char_length(answer) between 1 and 2000),
  sort_order   int  not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.tech_stack (
  id           uuid primary key default gen_random_uuid(),
  name         text not null unique check (char_length(name) between 1 and 60),
  sort_order   int  not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ৩) ভিজিটরদের পাঠানো ডেটা (কন্টাক্ট ফর্ম ও নিউজলেটার)
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(btrim(name)) between 1 and 120),
  contact    text not null check (char_length(btrim(contact)) between 3 and 200),
  services   text[] not null default '{}',
  budget     int check (budget is null or budget between 0 and 100000000),
  message    text not null check (char_length(btrim(message)) between 1 and 3000),
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null check (char_length(email) <= 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  created_at timestamptz not null default now()
);
create unique index if not exists newsletter_email_uniq on public.newsletter_subscribers (lower(email));

-- ---------------------------------------------------------------------
-- ৪) Row Level Security (নিরাপত্তা)
--    পাবলিক: প্রকাশিত কনটেন্ট পড়তে পারবে; ফর্ম/নিউজলেটার শুধু "জমা" দিতে পারবে, পড়তে পারবে না।
--    অ্যাডমিন (admins টেবিলের ইউজার): সবকিছু পড়া/লেখা/মোছা।
-- ---------------------------------------------------------------------
alter table public.projects               enable row level security;
alter table public.team_members           enable row level security;
alter table public.faqs                   enable row level security;
alter table public.tech_stack             enable row level security;
alter table public.contact_messages       enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- কনটেন্ট টেবিল: সবাই প্রকাশিত রো পড়বে, অ্যাডমিন সব করবে
do $$
declare t text;
begin
  foreach t in array array['projects','team_members','faqs','tech_stack'] loop
    execute format('drop policy if exists "public read published" on public.%I', t);
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "public read published" on public.%I for select to anon, authenticated using (is_published = true)', t);
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- কন্টাক্ট বার্তা
drop policy if exists "anyone can submit" on public.contact_messages;
drop policy if exists "admin all" on public.contact_messages;
create policy "anyone can submit" on public.contact_messages
  for insert to anon, authenticated with check (is_read = false);
create policy "admin all" on public.contact_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- নিউজলেটার
drop policy if exists "anyone can subscribe" on public.newsletter_subscribers;
drop policy if exists "admin all" on public.newsletter_subscribers;
create policy "anyone can subscribe" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);
create policy "admin all" on public.newsletter_subscribers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- API-র জন্য স্পষ্ট অনুমতি (RLS এর ওপরে অতিরিক্ত স্তর)
grant usage on schema public to anon, authenticated;
grant select on public.projects, public.team_members, public.faqs, public.tech_stack to anon;
grant insert on public.contact_messages, public.newsletter_subscribers to anon;
grant select, insert, update, delete on
  public.projects, public.team_members, public.faqs, public.tech_stack,
  public.contact_messages, public.newsletter_subscribers to authenticated;

-- ---------------------------------------------------------------------
-- ৫) ছবি আপলোডের স্টোরেজ বাকেট (প্রজেক্টের স্ক্রিনশটের জন্য)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 5242880,
        array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update
  set public = true, file_size_limit = 5242880,
      allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'];

drop policy if exists "admin upload project images" on storage.objects;
drop policy if exists "admin update project images" on storage.objects;
drop policy if exists "admin delete project images" on storage.objects;
drop policy if exists "admin list project images"   on storage.objects;
create policy "admin upload project images" on storage.objects
  for insert to authenticated with check (bucket_id = 'project-images' and public.is_admin());
create policy "admin update project images" on storage.objects
  for update to authenticated using (bucket_id = 'project-images' and public.is_admin())
  with check (bucket_id = 'project-images' and public.is_admin());
create policy "admin delete project images" on storage.objects
  for delete to authenticated using (bucket_id = 'project-images' and public.is_admin());
create policy "admin list project images" on storage.objects
  for select to authenticated using (bucket_id = 'project-images' and public.is_admin());
-- (পাবলিক বাকেট, তাই ছবির লিংক ওয়েবসাইটে সবাই দেখতে পাবে; তালিকা শুধু অ্যাডমিন দেখবে)

-- ===== প্রাথমিক ডেটা (আপনার বর্তমান ওয়েবসাইট থেকে) =====
-- টেবিল খালি থাকলেই শুধু বসবে; আবার চালালে ডুপ্লিকেট হবে না।

insert into public.projects (slug,category,name_bn,name_en,description,url,tech,visual,size,sort_order)
select * from (values
('patradwip','web','পত্রদ্বীপ','Patradwip','একটি আধুনিক, দ্রুত ও রেসপন্সিভ ওয়েব প্ল্যাটফর্ম। পরিষ্কার পড়ার অভিজ্ঞতা আর সহজ নেভিগেশনকে প্রাধান্য দিয়ে ডিজাইন করা।','patradwip.com',array['React','Next.js','Tailwind','Firebase']::text[],'v1','w',10),
('pathey-app','app','পাথেয় বাই গুঞ্জরণ','Pathey by Gunjoron · App','Android ও iOS-এর জন্য তৈরি পাথেয় অ্যাপ। হালকা, দ্রুত এবং দৈনন্দিন ব্যবহারে সহজ ইন্টারফেস।',null,array['Flutter','Dart','Firebase']::text[],'v2','w',20),
('pathey-web','web','পাথেয় বাই গুঞ্জরণ','Pathey by Gunjoron · Web','পাথেয়-এর ওয়েব সংস্করণ। অ্যাপের সাথে একই অভিজ্ঞতা, যেকোনো ব্রাউজার থেকে।','pathey.gunjoron',array['Next.js','TypeScript','API']::text[],'v2','n',30),
('keyari-web','web','কেয়ারি','Keyari · Web','কেয়ারি-এর ওয়েব প্ল্যাটফর্ম। পরিচ্ছন্ন ডিজাইন, শক্তিশালী ব্যাকএন্ড আর সব ডিভাইসে নিখুঁত লেআউট।','keyari.app',array['React','Node.js','MySQL']::text[],'v3','n',40),
('keyari-app','app','কেয়ারি','Keyari · App','কেয়ারি মোবাইল অ্যাপ: ওয়েবের সাথে সিঙ্ক থাকা দ্রুত, স্মুথ আর ব্যবহারবান্ধব অ্যাপ।',null,array['Flutter','Firebase','REST API']::text[],'v3','n',50)
) v(slug,category,name_bn,name_en,description,url,tech,visual,size,sort_order)
where not exists (select 1 from public.projects);

insert into public.team_members (name,initial,role,skills,sort_order)
select * from (values
('মুস্তাফিজুর রহমান জুনায়েদ','মু','Team Lead · Full-Stack','[{"name": "Architecture", "level": 92}, {"name": "Backend", "level": 88}, {"name": "Leadership", "level": 90}]'::jsonb,10),
('মুমিনুল ইসলাম','মু','Mobile App Developer','[{"name": "Flutter", "level": 90}, {"name": "Firebase", "level": 84}, {"name": "UI Build", "level": 82}]'::jsonb,20),
('আব্দুল আজিজ','আ','Frontend Developer','[{"name": "React / Next", "level": 90}, {"name": "Animation", "level": 85}, {"name": "Performance", "level": 84}]'::jsonb,30),
('মুজাহিদুল ইসলাম','মু','UI/UX Designer','[{"name": "Figma", "level": 92}, {"name": "UX Research", "level": 84}, {"name": "Branding", "level": 86}]'::jsonb,40)
) v(name,initial,role,skills,sort_order)
where not exists (select 1 from public.team_members);

insert into public.faqs (question,answer,sort_order)
select * from (values
('একটি ওয়েবসাইট বানাতে কত সময় লাগে?','সাধারণ ওয়েবসাইট ২–৪ সপ্তাহে, আর বড় ওয়েব অ্যাপ বা মোবাইল অ্যাপ প্রজেক্টের পরিধি অনুযায়ী ১–৩ মাস লাগতে পারে। শুরুতেই আমরা পরিষ্কার সময়সূচি দিই।',10),
('আপনারা কি ডিজাইন ও ডেভেলপমেন্ট দুটোই করেন?','হ্যাঁ। UI/UX ডিজাইন থেকে শুরু করে ফ্রন্টএন্ড, ব্যাকএন্ড, মোবাইল অ্যাপ এবং ডিপ্লয়মেন্ট পর্যন্ত সব আমাদের টিমেই হয়।',20),
('লঞ্চের পর কি সাপোর্ট পাওয়া যাবে?','অবশ্যই। লঞ্চের পর বাগ ফিক্স, আপডেট এবং মেইনটেন্যান্সের জন্য আমাদের সাপোর্ট প্যাকেজ আছে।',30),
('খরচ কীভাবে নির্ধারণ হয়?','প্রজেক্টের ফিচার, পেজ সংখ্যা আর সময়ের ওপর নির্ভর করে। প্রাথমিক আলোচনার পর আমরা বিস্তারিত কোটেশন পাঠাই, কোনো লুকানো খরচ নেই।',40)
) v(question,answer,sort_order)
where not exists (select 1 from public.faqs);

insert into public.tech_stack (name,sort_order)
select * from (values
('React',10),
('Next.js',20),
('TypeScript',30),
('JavaScript',40),
('Tailwind CSS',50),
('Flutter',60),
('Dart',70),
('Node.js',80),
('Firebase',90),
('MySQL',100),
('Laravel',110),
('Figma',120),
('Git',130),
('GitHub',140),
('Vercel',150),
('REST API',160)
) v(name,sort_order)
where not exists (select 1 from public.tech_stack);

-- =====================================================================
-- শেষ! এবার "ধাপ ৪": অ্যাডমিন ইউজার বানানো — supabase/02-make-admin.sql দেখুন।
-- =====================================================================
