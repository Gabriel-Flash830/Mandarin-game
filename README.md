# 🐦‍⬛ WordWisp — *Mastered, not memorized.*

A language-learning game **inspired by** trading-card games and bite-size
language apps — but built from scratch as its own thing. Every word you learn is
a collectible **glyph card**; learning is required to play, not a bonus. Original
name, crow logo, palette, and card design (emoji + CSS, no third-party assets),
so it's copyright-clean to grow. Mobile-first, installable as an app (PWA), and
data-driven. Ships with **18 languages across 6 world regions**. Zero
dependencies, zero build step.

> **Languages:** East Asia (Mandarin·Japanese·Korean), South Asia
> (Hindi·Urdu·Bengali), Middle East (Arabic·Turkish·Hebrew), Europe
> (French·German·Italian), Americas (Spanish·Portuguese·English), Africa
> (Swahili·Zulu·Yoruba). Mandarin is the deep course (10 units, 117 words, full
> example sentences); the others ship as accurate starter sets. **The
> non-Latin-script & less-common languages (Arabic, Hebrew, Hindi, Urdu,
> Bengali, Zulu, Yoruba) are best-effort and should get a native-speaker review
> before release.** Each language has its own animal, colour theme, lives token,
> and themed boss ladder — Mandarin's bosses are the 12 zodiac animals.

> Renaming: the app name lives in one constant — `BRAND` at the top of
> [`js/app.js`](js/app.js). Change it there and it updates everywhere.

## Run it

No install needed. Double-click `index.html`, or serve the folder (recommended —
enables the spoken-audio voices and PWA install):

```bash
python3 -m http.server 4173
# open http://localhost:4173
```

It's phone-shaped, so it looks best in a narrow window (or your browser's
mobile/responsive view).

## The five tabs

| Tab | What it does |
|---|---|
| **Learn** | A path of lessons by unit (10 units / 24 lessons / 117 words in Mandarin). Tap the glowing tile to start. |
| **Study** | A high-quality **archive** to review words. Choose what's on the **front** (字 character / pinyin / meaning), flip for the rest **+ an example sentence**, and turn on **Alternate** mode to randomise the front each card. Shuffle, prev/next, audio. |
| **Cards** | Your collectible **glyph cards**, earned by finishing the lessons that teach them. |
| **Battle** | A **rival ladder**. The first rival (Sprout) is *very* easy; harder ones unlock as you win. Plus a weekly XP ranking for a social/competitive layer. |
| **Me** | XP, streak 🔥, gems 💎, rivals beaten, and the language switcher. |

### Learning is required (not optional)
This was the key fix. In **battle**, a correct answer attacks for full damage; a
**wrong answer misses** and the rival counters (gently for easy rivals). In
**lessons**, mistakes cost a lantern 🏮. You can't brute-force past the language.

### Lessons (5 auto-generated exercise types)
Every exercise is generated from plain word data, so any language works: teach a
new word (with art, example, audio) → multiple-choice meaning → pick the word →
**tap what you hear** (text-to-speech) → **type the pinyin** → match-the-pairs.
XP with combo bonuses, gems, a daily streak, and 🏮 lanterns as lives.

### Natural-sounding audio
`speak()` in [`js/app.js`](js/app.js) now prefers known high-quality Chinese
voices (Tingting / Meijia / Google 普通话 / Microsoft Xiaoxiao-Yunxi …), falls
back to any *enhanced / premium / local* voice, and uses a slightly slower rate
and warmer pitch so it sounds less robotic. **For the most natural voice on a
Mac**, install an enhanced Chinese voice: System Settings → Accessibility →
Spoken Content → System Voice → Manage Voices → add a Chinese (premium) voice.

## Adding another language (just data)

Open [`data/courses.js`](data/courses.js) and add a course. The lessons, study
mode, cards and battles all read this one shape — **no other code changes**:

```js
fr: {
  id: 'fr', name: 'French', native: 'Français', flag: '🇫🇷',
  tts: 'fr-FR', from: 'English', mascot: '🐓', accent: '#3b5bdb',
  units: [
    { title: 'Unité 1 · Salutations', color: '#0e9594', lessons: [
      { id: 'fr1a', title: 'Greetings', terms: [
        // w(term, reading, en, emoji, example, exReading, exTranslation, realm, opts)
        w('bonjour', '', 'hello', '👋', 'Bonjour !', '', 'Hello!', 'heart', { card: 1 }),
      ]},
    ]},
  ],
}
```

`reading` is the pronunciation aid (pinyin / romaji / `''`). `realm` is the
word's semantic category (light / night / nature / water / fire / heart / spirit
/ earth / time) — purely thematic colour, **no Pokémon-style type/weakness
chart**. `card:1` makes a word collectible; `legendary:1` for a rare one. Ships
with **Mandarin** (117 words, all with example sentences) and a **Spanish**
taster.

## Shipping to the Apple App Store

Already a PWA (`manifest.webmanifest` + `sw.js` + `icon.svg`), installable from
Safari today. For a real App Store listing, wrap the same web code with
**Capacitor** — no rewrite:

```bash
npm init -y
npm i @capacitor/core @capacitor/cli @capacitor/ios
npx cap init WordWisp com.yourname.wordwisp --web-dir .
npx cap add ios
npx cap sync
npx cap open ios      # Xcode → run on device → Archive → upload
```

Needs an Apple Developer account ($99/yr) and submission via App Store Connect.
Android is the same flow with `@capacitor/android`.

## Studio-quality voice (Cloud TTS)

By default the app uses the device's built-in speech voices — quality varies by
OS and some languages (e.g. Urdu) may have none. For perfect, consistent
pronunciation in **every** language, turn on Cloud TTS:

1. Get a key at <https://console.cloud.google.com> → enable **Cloud
   Text-to-Speech API** → create an API key (restrict it to that API).
2. In the app: **Me → Voice → paste the key → Save**.

It's stored only on your device; audio is cached. Falls back to device voices if
the key is missing or a language isn't supported. (For production you'd proxy
the key through a tiny backend instead of storing it client-side.)

## Use the app in your language

**Me → App language** switches the whole interface (tabs, titles, buttons) to
English, Spanish, French, German, Chinese, Portuguese, Arabic, or Hindi — so you
don't need to know English to learn. Word *meanings* are still shown in English
for now (translating all meanings into every base language is the next data
step). Add a language by extending the `STR` table in `js/app.js`.

## Accounts & adding friends

There's a lightweight local "account": set a **display name** (Arena → Friends →
Edit name) and share your **friend code** (Copy my code). Someone pastes it under
**Add by code** to add you, then you play via the challenge codes below. This is
device-local (no sign-up). **Full server accounts** — synced friend lists, live
presence, a real login — require a backend (Supabase/Firebase auth + a `friends`
table); that's the documented next step.

## Play with friends

- **Race a friend** instantly: Arena → Friends → tap ⚔️ next to anyone.
- **Cross-device async PvP, no server:** Arena → Friends → **Send a challenge**.
  You play 5 words and get a shareable code; your friend pastes it under **Have a
  code?** on their device, plays the *same* words, and the higher score wins.
- For **live realtime** 1v1 you'd add a small WebSocket room (or a P2P service
  like PeerJS); the quiz engine already supports preset question sets.

## Project layout

```
index.html            app shell: top bar, 5 screens, tab bar, overlay
styles.css            original theme (jade/ink/coral), glyph cards, study UI
data/courses.js       ← all course content (edit to add words/languages)
js/app.js             engine: delegated events, lessons, study, battle ladder, voice
manifest.webmanifest  PWA manifest (installable)
sw.js                 service worker (offline app shell)
icon.svg              app icon (wisp mascot)
```

## Notes

- **All clicks run through one delegated listener** in `app.js`, so re-rendered
  screens, dynamic lesson steps, or a narrow viewport can never break input.
- Because it's a PWA the service worker caches files — after editing code, hard
  refresh (Cmd/Ctrl+Shift+R) or bump `CACHE` in `sw.js`.
- Progress saves to `localStorage` under `wordwisp.v1`.

## License

Original work — emoji + CSS art, no third-party game assets. Use it however you
like.
