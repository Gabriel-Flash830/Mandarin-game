# WordWisp — Project Handoff (always current: update me each session)

**What this is:** a Duolingo-style language game ("Mastered, not memorized") —
dependency-free PWA, no build step. Run: `python3 -m http.server 4173` →
http://localhost:4173 (phone on same Wi-Fi: http://<mac-ip>:4173, find ip via
`ipconfig getifaddr en0`). Hard-refresh (Cmd+Shift+R) after code changes.
Tests: open `/tests.html` — 226 data checks, keep them green.

## State (as of the live-ticks + storyboards ship, assets at ?v=38)
- **26 languages / 7 regions** in `data/courses.js` (zh=12 units/127 words,
  es=8, fr=7; rest are starter sets). Add words with the `w()` helper.
- **i18n, 3 layers** in `js/app.js`: `tr()` UI strings (STR), `tl()` labels
  (T2), `tm()` word meanings (MEANINGS/2/3 — all 8 base languages:
  en fr es de pt zh ar hi; ar/he/ur switch to RTL).
- **12 celebration variants**: party/fireworks/trophy/highfive/confetti use the
  vendored Lottie crow (`lottie/crow.json`, preloaded into CROW_ANIM, emoji
  fallback — can never be blank); `fly`=HERO_SVG superhero landing;
  `night`=NIGHT_SVG (crow's back against lamppost, cape attached);
  `mj`=MJ_SVG moonwalk; `genius`=TAP_SVG; `frozen`=FROZEN_SVG (acc<60%).
  New variants: user describes a scene in chat → build as SVG+CSS (never raw
  Lottie JSON). Ornament classes must not collide with variant names (see .cup).
- **4 storyboard variants (SVG+CSS, TRIGGERED not random)** — `celebrate(mascot,
  acc, forced)`; the `forced` arg names the variant. All four verified live:
  `firstflight`=FF_SVG (nest, wobble, flaps, takeoff) fires on the FIRST-EVER
  lesson (`!S.ffSeen && Object.keys(S.done).length===0`, sets S.ffSeen, one-time);
  `library`=LB_SVG (candle shelves, crow slides a glowing book home, dust motes)
  on mastering a unit (last lesson of a unit → all its lessons in S.done);
  `rainy`=RW_SVG (rain, lantern, crow + tea) via showStreakSaved() at boot when a
  🧊 freeze absorbs a missed day; `duel`=DL_SVG (rooftop bow, cherry petals, moon)
  in endBattle when the LAST rival (r11 in zh) is beaten. CSS in styles.css under
  "STORYBOARD SCENES"; each uses `.xxsvg *{transform-box:fill-box}` like nightScene.
- **Supabase cloud LIVE** (project rdnkyqzfxnuecnuqerfq, anon key in app.js):
  anonymous auth, profile sync (sbSync — awaited by match fns for FK),
  global weekly top-10 in Arena→Friends, cross-device challenge matches
  (create+claim verified end-to-end). Tables: profiles, friends, matches
  (matches has permissive select/update policies).
- **LIVE per-question ticks DONE + verified (2 real accounts vs real Supabase).**
  Score codec (no schema change) in app.js: a match column holds an IN-PROGRESS
  value `qIndex*10 + score` (always <100 for ≤9 Qs) while playing, and `100 +
  finalScore` when finished. Helpers: `encFinal`, `encProgress`, `decodeScore`,
  `oppCellText`. quizRace takes a 4th `live={mid,mine,opp}` arg; qLivePatch writes
  my column each question + on finish; qStartPoll polls the OPP column every 2s
  and tickers the VS card ("Q3 · 2pts"); pollResult decodes finals (both ≥100 →
  compare) and shows the opponent's live progress while waiting. ALL readers
  decode: loadInbox (query now `or=(guest_score.is.null,guest_score.lt.100)` +
  `created_at=gt.MATCH_EPOCH` so pre-codec rows never show; 🔴 only for fresh
  hosts). Host=challengeFriend live branch; Guest=play-inbox. Bot/async-code
  paths unchanged (encFinal applied at write, decoded at read).
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

## DEPLOYMENT (live state)
- GitHub: https://github.com/Gabriel-Flash830/Mandarin-game (pushed via GitHub
  Desktop; the user is NOT comfortable with Terminal — never ask them to use it).
- Cloudflare deployed it as a WORKER (static assets) named `mandarin-game`.
  URL enabled via Settings → Domains & Routes → workers.dev.
- Cloudflare's bot added a wrangler autoconfig commit ON GITHUB that local
  repos don't have. Before shipping updates: user clicks "Fetch origin"/"Pull"
  in GitHub Desktop FIRST.
- Update flow (no Terminal): agent edits /Users/home/Mandarin Game (canonical,
  full git history), bumps ?v= in index.html, commits locally, then rsyncs to
  /Users/home/Documents/GitHub/Mandarin-game (Desktop-managed clone, excluding
  .git/.claude); user clicks Commit + Push in GitHub Desktop → auto-deploys.

## QUALITY PLAYBOOK (read this, whichever model you are)
1. VERIFY BEFORE CLAIMING. Open the browser preview and exercise the feature,
   or state plainly it is unverified. Never say "fixed" from code alone.
2. Run /tests.html after ANY data/courses.js change (must stay all-green).
3. Bump ?v=N on all three asset tags in index.html every ship, or users get
   stale caches and report ghost bugs.
4. Patch via python with exact-anchor asserts (see git history) — if an anchor
   misses, STOP and re-read the file; never fuzzy-replace.
5. Grep that your new function is actually CALLED (mountCrows once shipped
   defined-but-never-invoked; a MutationObserver now guards celebrations).
6. Never name a celebration variant after an element class (.trophy collision
   broke layout once; ornament is .cup).
7. Be honest about tiers: bots vs async-inbox play vs live realtime. Do not
   label bot play as multiplayer.
8. Course content: only vocabulary you are certain of; low-resource languages
   get flagged for native review, not invented.
9. The user is non-technical, sharp at QA, and values honesty over polish.
   Give click-by-click steps, never Terminal. End every session: commit, test,
   update this file, tell them how to open the app.

## DONE THIS SESSION (verified in browser)
- ✅ Per-question live ticks (see Supabase bullet above) — 2-account real test.
- ✅ 4 storyboards First Flight / Library / Rainy Window / Duel — all triggers
  fired via real gameplay; all four scenes screenshotted.
- ✅ Friends-tab cleanup (?v=39): real friends (🟢, synced xp_week) now compete on
  a "🏆 Weekly XP" board with just you; practice bots moved to a separate "🤖
  Practice bots — no XP" section (no rank, no XP). `bumpLeague()` no longer
  inflates bot XP (bots don't gain XP; real friends' XP syncs from cloud). Global
  top-10 kept but relabelled "🌍 Everyone this week (all players)" with a note
  explaining it's the real cloud server (user thought there were no servers —
  there are). renderFriends split via `isReal = f => f.live || f.id.length>20`.
- ✅ Animations gallery: Me tab → "🎬 Celebrations" replays any of the 14 variants
  on demand (CELE_GALLERY + showCele + play-cele/cele-close actions). All 14
  play; storyboards also still fire automatically on their triggers.
- Testing note: the in-app browser cached index.html via the SW; had to
  unregister SW + clear caches to see new ?v=. Production SW is network-first so
  real users DO get updates, but ALWAYS bump ?v= (now at 39).

## NEXT BUILD SPEC — competitive race upgrade (user asked 2026-07-12)
User wants races to feel like a face-to-face duel, not just 5 Qs:
1. TIMER + speed tiebreaker: when scores tie (e.g. 5–5), the FASTER finisher
   wins. Store elapsed ms alongside score. matches has no time column → either
   add `host_ms`/`guest_ms` (needs the user to run one ALTER TABLE in Supabase),
   or pack time into the score int (finished = 100 + score, and stash ms in a
   separate small column is cleaner). RECOMMEND asking the user to add two int
   columns; show "5/5 · 12.4s — you won on speed!".
2. Bigger, shared, randomized pool: draw N (7–10) from the whole course, same
   pool both players, reshuffled each match. (challengeFriend already draws 7
   from allTerms.) Consider "most correct in a fixed time" as an alt mode.
Design it carefully; it reopens the score codec. Discuss schema before coding.

## PRIORITIES (next sessions, in order)
1. Phase-2 hardening: clean cloud test rows (incl. new Tick* rows from this
   session), tighten matches RLS, weekly XP reset, name length/profanity guard —
   BEFORE sharing the URL publicly.
2. Competitive race upgrade (timer/tiebreaker + bigger pool) — spec above.
3. Fix the user's own testing bug list (ask them what they found).
4. Real-friend tournaments (use 🟢 friends + matches table) and live realtime
   play (Supabase Realtime).
5. Cloud save/restore (saves table SQL above), deeper es/fr content.
