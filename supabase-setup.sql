-- ============================================================
-- PlayVault — Supabase setup script
-- ============================================================
-- HOW TO USE (30 seconds):
--   1. Open https://supabase.com/dashboard → your project
--   2. Left sidebar → SQL Editor → "New query"
--   3. Paste this ENTIRE file → click "Run"
--   4. Done. Your app will auto-detect Supabase on the next start
--      and seed the game catalog automatically on first load.
--
-- The app reads NEXT_PUBLIC-less server env vars:
--   SUPABASE_URL, SUPABASE_ANON_KEY  (set in Vercel → Settings → Environment Variables)
--
-- SECURITY NOTES:
--   - Passwords are stored as bcrypt hashes by the app — never in plain text.
--   - RLS is enabled with permissive anon policies so the Next.js server
--     (using the anon key) can read/write. This is acceptable for a public
--     game site where all auth is enforced app-side. For stricter security,
--     tighten these policies later.

-- ---------------- TABLES ----------------

create table if not exists games (
  "id"          text primary key default gen_random_uuid()::text,
  "slug"        text unique not null,
  "title"       text not null,
  "description" text default '',
  "category"    text default 'Arcade',
  "embedUrl"    text not null,
  "thumbUrl"    text,
  "emoji"       text default '🎮',
  "featured"    boolean default false,
  "plays"       integer default 0,
  "sortOrder"   integer default 100,
  "active"      boolean default true,
  "createdAt"   timestamptz default now()
);

create table if not exists suggestions (
  "id"        text primary key default gen_random_uuid()::text,
  "gameTitle" text not null,
  "url"       text default '',
  "note"      text default '',
  "status"    text default 'pending',
  "createdAt" timestamptz default now()
);

create table if not exists users (
  "id"           text primary key default gen_random_uuid()::text,
  "username"     text unique not null,
  "passwordHash" text not null,
  "bio"          text default '',
  "avatarEmoji"  text default '🎮',
  "avatarColor"  text default '#f97316',
  "avatarUrl"    text,
  "createdAt"    timestamptz default now()
);

create table if not exists favorites (
  "id"        text primary key default gen_random_uuid()::text,
  "userId"    text not null,
  "gameId"    text not null,
  "createdAt" timestamptz default now(),
  unique("userId", "gameId")
);

create table if not exists playtime (
  "id"        text primary key default gen_random_uuid()::text,
  "userId"    text not null,
  "gameId"    text not null,
  "seconds"   integer default 0,
  "updatedAt" timestamptz default now(),
  unique("userId", "gameId")
);

-- ---------------- INDEXES ----------------

create index if not exists games_category_idx on games ("category");
create index if not exists games_sort_idx    on games ("sortOrder");
create index if not exists suggestions_status_idx on suggestions ("status");
create index if not exists playtime_user_idx on playtime ("userId");
create index if not exists favorites_user_idx on favorites ("userId");

-- ---------------- ROW LEVEL SECURITY ----------------

alter table games       enable row level security;
alter table suggestions enable row level security;
alter table users       enable row level security;
alter table favorites   enable row level security;
alter table playtime    enable row level security;

drop policy if exists "public read games" on games;
create policy "public read games" on games for select using (true);

drop policy if exists "public write games" on games;
create policy "public write games" on games for insert with check (true);

drop policy if exists "public update games" on games;
create policy "public update games" on games for update using (true) with check (true);

drop policy if exists "public delete games" on games;
create policy "public delete games" on games for delete using (true);

drop policy if exists "public read suggestions" on suggestions;
create policy "public read suggestions" on suggestions for select using (true);

drop policy if exists "public write suggestions" on suggestions;
create policy "public insert suggestions" on suggestions for insert with check (true);

drop policy if exists "public update suggestions" on suggestions;
create policy "public update suggestions" on suggestions for update using (true) with check (true);

drop policy if exists "anon minimal users" on users;
create policy "anon minimal users" on users for select using (true);

drop policy if exists "anon insert users" on users;
create policy "anon insert users" on users for insert with check (true);

drop policy if exists "anon update users" on users;
create policy "anon update users" on users for update using (true) with check (true);

drop policy if exists "public favorites" on favorites;
create policy "public favorites" on favorites for all using (true) with check (true);

drop policy if exists "public playtime" on playtime;
create policy "public playtime" on playtime for all using (true) with check (true);

-- Done! 🎮
-- The games table is intentionally left EMPTY — the app seeds its
-- 54-game launch catalog automatically the first time it connects.
