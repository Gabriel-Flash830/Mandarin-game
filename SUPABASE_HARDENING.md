# Supabase hardening — your 5-minute to-do before going public

These are the steps only you can do (they need your Supabase dashboard, which I
can't reach). Everything else — weekly-XP reset, the name/profanity filter, the
feedback button, collectible celebrations — is already in the code.

## How to open the SQL editor (click-by-click)
1. Go to **https://supabase.com** and open your **wordwisp** project.
2. Left sidebar → **SQL Editor**.
3. Click **+ New query**, paste a block below, click **Run** (bottom right).
4. Do them one block at a time so you can read each result.

---

## 1. Delete the test / QA accounts (and their matches)
```sql
-- remove matches involving the test accounts first (foreign keys require this order)
delete from matches
where host  in (select id from profiles where name in ('TestHost','HostQA','GuestQA','TickHostQA','TickGuestQA'))
   or guest in (select id from profiles where name in ('TestHost','HostQA','GuestQA','TickHostQA','TickGuestQA'));

-- then remove the accounts themselves
delete from profiles where name in ('TestHost','HostQA','GuestQA','TickHostQA','TickGuestQA');
```

Optional — clear the leftover blank "Learner" devices with 0 XP (harmless; brand-new
players re-create themselves on next load):
```sql
delete from matches
where host  in (select id from profiles where name = 'Learner' and xp = 0)
   or guest in (select id from profiles where name = 'Learner' and xp = 0);
delete from profiles where name = 'Learner' and xp = 0;
```

Optional — reset everyone's weekly XP so the launch leaderboard starts clean:
```sql
update profiles set xp_week = 0;
```

## 2. Tighten the match security rules
Right now either player in a match can update the row. This keeps that but blocks a
non-participant from ever touching it:
```sql
drop policy if exists "answer matches" on matches;
create policy "answer matches" on matches for update
  using      (auth.uid() = host or auth.uid() = guest)
  with check (auth.uid() = host or auth.uid() = guest);
```

## 3. Create the feedback table (turns on the in-app "💬 Send feedback" button)
```sql
create table feedback (
  id uuid primary key default gen_random_uuid(),
  reporter uuid,
  text text not null,
  course text,
  ua text,
  created_at timestamptz default now()
);
alter table feedback enable row level security;
create policy "anyone can submit feedback" on feedback for insert with check (true);
-- (no select policy on purpose: only you, in the dashboard, can read submissions)
```
Read what people send anytime: **Table Editor → feedback**. Until you run this, the
button still works — reports queue on the device and send themselves once the table
exists.

## 4. (LATER — only when we build the speed-tiebreaker) add two time columns
Don't run this yet. When we build the timer/competitive upgrade, this is all it needs:
```sql
alter table matches add column host_ms  int;
alter table matches add column guest_ms int;
```

---

After step 1–3: the app is safe to share publicly. Nothing here changes the app URL
or requires a redeploy — it's all database-side.
