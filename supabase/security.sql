-- Lock down direct database access through Supabase's public REST/Storage APIs.
--
-- Why: with RLS off, anyone holding the project's publishable (anon) key could read the users
-- table (password hashes), contact messages and every other table, and update/delete rows.
--
-- Safe for this app: the backend connects as "postgres" (BYPASSRLS) via DATABASE_URL, and uploads
-- use the secret key, so neither is affected. Nothing in the website or admin talks to Supabase directly.
-- Images stay public: files in a public bucket are served from /object/public/... without any policy.
--
-- Re-runnable. To undo a table: alter table public.<name> disable row level security;

begin;

-- 1. Row Level Security on every app table, with no policies => anon/authenticated get nothing.
alter table public.users                enable row level security;
alter table public.roles                enable row level security;
alter table public.contact_form         enable row level security;
alter table public.email_template       enable row level security;
alter table public.program              enable row level security;
alter table public.products             enable row level security;
alter table public.product_categories   enable row level security;
alter table public.peoples              enable row level security;
alter table public.district             enable row level security;
alter table public.archaeological_sites enable row level security;

-- Belt and braces: the public API roles get no table privileges at all.
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

-- 2. Storage: only the backend (secret key) may write. Signed-up Supabase users must not upload,
--    overwrite or list files. Public image URLs keep working because the bucket is public.
drop policy if exists "Authenticated users can upload"         on storage.objects;
drop policy if exists "Authenticated users can update uploads" on storage.objects;
drop policy if exists "Public can read uploads"                on storage.objects;

commit;
