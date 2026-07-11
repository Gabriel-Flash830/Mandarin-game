# WordWisp — Real backend setup (Supabase)

This turns local accounts into **real accounts** with synced friends and
head-to-head matches. Takes ~20 minutes. **You** create the account (it needs
your email); then paste two values into the app config and I can wire the
client in one session.

## 1. Create the project (you)
1. Go to <https://supabase.com> → Sign up (free tier is plenty).
2. New project → name `wordwisp` → pick a region near you → create.
3. Copy from **Project Settings → API**: the **Project URL** and the
   **anon public key**. (The anon key is safe to ship in the client.)

## 2. Create the tables — paste into SQL Editor → Run

```sql
-- player profiles (one row per account)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default 'Learner',
  xp int not null default 0,
  xp_week int not null default 0,
  course text not null default 'zh',
  updated_at timestamptz default now()
);

-- friendships (two rows per pair, or query both directions)
create table friends (
  a uuid references profiles(id) on delete cascade,
  b uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (a, b)
);

-- async head-to-head matches (replaces the base64 codes)
create table matches (
  id uuid primary key default gen_random_uuid(),
  host uuid references profiles(id),
  guest uuid references profiles(id),
  course text not null,
  term_ids jsonb not null,          -- the 5 word ids both players answer
  host_score int,
  guest_score int,
  created_at timestamptz default now()
);

-- row-level security
alter table profiles enable row level security;
alter table friends enable row level security;
alter table matches enable row level security;
create policy "read all profiles"  on profiles for select using (true);
create policy "update own profile" on profiles for update using (auth.uid() = id);
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "read own friendships"  on friends for select using (auth.uid() = a or auth.uid() = b);
create policy "add friendships"       on friends for insert with check (auth.uid() = a);
create policy "read own matches"   on matches for select using (auth.uid() = host or auth.uid() = guest);
create policy "create matches"     on matches for insert with check (auth.uid() = host);
create policy "answer matches"     on matches for update using (auth.uid() = guest or auth.uid() = host);
```

3. **Auth → Providers**: enable **Email** (magic-link sign-in, no passwords) —
   or "Anonymous sign-ins" for zero-friction device accounts.

## 3. Hand the two values to the app
Add to the top of `js/app.js` (or a small `config.js`):

```js
const SUPABASE_URL = 'https://YOURPROJECT.supabase.co';
const SUPABASE_ANON = 'eyJ...';
```

Then ask Claude to "wire the Supabase client" — the plan:
- load `@supabase/supabase-js` (one `<script>` tag from esm.sh, or vendor it),
- sign-in screen on the **Me** tab (magic link / anonymous),
- `profiles` sync replaces `S.displayName`; weekly leaderboard reads real rows,
- friends list reads/writes `friends` (replacing add-by-code bots),
- "Send a challenge" inserts a `matches` row; the friend sees it under Arena →
  Friends and plays the same `term_ids`; scores compare server-side,
- live 1v1 later via Supabase Realtime channels.

## Why this order
Auth + profiles is the unlock: every other social feature (friends, matches,
leagues, cross-device save) hangs off a real user id.
