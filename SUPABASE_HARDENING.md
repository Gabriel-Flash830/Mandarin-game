# Supabase — everything to paste (do it all in one sitting)

Your base tables (profiles, friends, matches) are already live. These blocks add
the hardening + the feedback/cloud-save/timer support. Do them before sharing the
URL publicly.

## How to run (click-by-click)
1. Go to **https://supabase.com** → open your **wordwisp** project.
2. Left sidebar → **SQL Editor** → **+ New query**.
3. Paste **one block** below, click **Run** (bottom-right). Repeat for each block.

---

## Block 1 — delete the test / QA accounts
```sql
delete from matches
where host  in (select id from profiles where name in ('TestHost','HostQA','GuestQA','TickHostQA','TickGuestQA'))
   or guest in (select id from profiles where name in ('TestHost','HostQA','GuestQA','TickHostQA','TickGuestQA'));
delete from profiles where name in ('TestHost','HostQA','GuestQA','TickHostQA','TickGuestQA');

delete from matches
where host  in (select id from profiles where name = 'Learner' and xp = 0)
   or guest in (select id from profiles where name = 'Learner' and xp = 0);
delete from profiles where name = 'Learner' and xp = 0;
```

## Block 2 — tighten match security
```sql
drop policy if exists "answer matches" on matches;
create policy "answer matches" on matches for update
  using      (auth.uid() = host or auth.uid() = guest)
  with check (auth.uid() = host or auth.uid() = guest);
```

## Block 3 — feedback table (fixes the capital-F "Feedback" you made)
```sql
drop table if exists "Feedback";
drop table if exists feedback;
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
```
Read submissions later at **Table Editor → feedback**.

## Block 4 — cloud save table (for the Cloud Save feature)
```sql
create table if not exists saves (
  id uuid primary key references profiles(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table saves enable row level security;
drop policy if exists "own save read"   on saves;
drop policy if exists "own save insert" on saves;
drop policy if exists "own save update" on saves;
create policy "own save read"   on saves for select using (auth.uid() = id);
create policy "own save insert" on saves for insert with check (auth.uid() = id);
create policy "own save update" on saves for update using (auth.uid() = id);
```

## Block 5 — timer columns (for the race speed-tiebreaker)
```sql
alter table matches add column if not exists host_ms  int;
alter table matches add column if not exists guest_ms int;
```

---

After Block 1–5 you're fully hardened and ready for feedback, cloud save, and the
timer. None of this changes the app URL or needs a redeploy — it's all database-side.
