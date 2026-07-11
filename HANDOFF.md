# WordWisp — Project Handoff (always current: update me each session)

**What this is:** a Duolingo-style language game ("Mastered, not memorized") —
dependency-free PWA, no build step. Run: `python3 -m http.server 4173` →
http://localhost:4173 (phone on same Wi-Fi: http://<mac-ip>:4173, find ip via
`ipconfig getifaddr en0`). Hard-refresh (Cmd+Shift+R) after code changes.
Tests: open `/tests.html` — 226 data checks, keep them green.

## State (as of commit 307bd19)
- **26 languages / 7 regions** in `data/courses.js` (zh=12 units/127 words,
  es=8, fr=7; rest are starter sets). Add words with the `w()` helper.
- **i18n, 3 layers** in `js/app.js`: `tr()` UI strings (STR), `tl()` labels
  (T2), `tm()` word meanings (MEANINGS/2/3 — all 8 base languages:
  en fr es de pt zh ar hi; ar/he/ur switch to RTL).
- **8 celebration variants**: party/fireworks/trophy/highfive/confetti use the
  vendored Lottie crow (`lottie/crow.json`, preloaded into CROW_ANIM, emoji
  fallback — can never be blank); `fly`=HERO_SVG superhero landing;
  `night`=NIGHT_SVG (crow's back against lamppost, cape attached);
  `mj`=MJ_SVG moonwalk (fedora, glove, spin, toe-stand).
  New variants: user describes a scene in chat → build as SVG+CSS (never raw
  Lottie JSON). Ornament classes must not collide with variant names (see .cup).
- **Supabase cloud LIVE** (project rdnkyqzfxnuecnuqerfq, anon key in app.js):
  anonymous auth, profile sync (sbSync — awaited by match fns for FK),
  global weekly top-10 in Arena→Friends, cross-device challenge matches
  (create+claim verified end-to-end). Tables: profiles, friends, matches
  (matches has permissive select/update policies).
- Engine: delegated data-action clicks; state in localStorage `wordwisp.v2`;
  lessons (5 exercise types, lantern lives, sfx+haptics); Study decks
  collected/all/weak (Alternate cycles char→py→mean); curriculum-linked boss
  ladders (perfect play always wins); rotating daily quests; streak freeze;
  optional Google Cloud TTS (Me→Voice); placement test; local friend codes +
  async PvP codes (base64, with server match ids when online).

## Next steps, in order
1. **Cloud-live friends + cross-device save.** Friends list backed by the
   `friends` table (insert real uuids from friend codes; list via
   `friends?a=eq.<uid>` joined to live `profiles` for names/XP). Cloud save:
   user must first run this SQL in Supabase:
   ```sql
   create table saves (
     id uuid primary key references profiles(id) on delete cascade,
     data jsonb not null,
     updated_at timestamptz default now()
   );
   alter table saves enable row level security;
   create policy "own save read"  on saves for select using (auth.uid() = id);
   create policy "own save write" on saves for insert with check (auth.uid() = id);
   create policy "own save update" on saves for update using (auth.uid() = id);
   ```
   Then sync `S` up on change (debounced) and offer restore on boot.
2. **Mandarin at 20 units/167 words — GOAL REACHED.** First thing next session: open /tests.html to confirm 226 checks still pass (browser verification was unavailable at commit time). Then optionally push toward 25-30 units (13-15 Body/Clothes/Weather done; add tm() glosses for hand/head/eyes/ears/mouth/clothes/shoes/hat/pants/to wear/weather/sunny/snow/overcast/windy), then Spanish, then French. Accurate
   vocab only, every term via `w()` with example sentences; run /tests.html.
3. More celebration variants from user storyboards.
4. Publishing (user-driven): `git remote add origin <github-url> && git push`;
   App Store via Capacitor (steps in README.md).

## Known limitations (be honest with the user)
- Voice quality device-dependent unless the Google TTS key is set.
- Friend-add-by-code is local-cosmetic until cloud-live friends lands.
- Low-resource languages (Zulu/Yoruba/etc.) need native-speaker review.
- Leftover test rows in cloud profiles (TestHost etc.) — harmless.
