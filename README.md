# 活用 Trainer (katsuyou-trainer)

Practice Japanese verb conjugation. Look up a verb, study its forms, then quiz yourself until the patterns stick.

Live: https://katsuyou.mattari.app

## What it does

Type a verb in kanji, kana, or romaji (`taberu` works), and katsuyou-trainer shows how it conjugates across every form, with a breakdown of the rule behind each change. When you're ready, the quiz drills you on the forms you pick and gives immediate feedback.

It ships with 419 common verbs and falls back to a live Jisho.org lookup for anything else.

### Modes

- **Lookup**: search any verb and see all its forms, plus a visual breakdown of why each one changes (godan vowel-row shifts, ichidan dropping る, the irregular stems for する and くる).
- **Study**: flashcard drill on model verbs, tap to reveal each conjugation.
- **Quiz**: pick the forms and length (5 to 20 questions), then answer one form at a time with hints, retries, and a score at the end.
- **Reference**: a grammar index covering the て / た sound-change rules (音便) and a model verb for each godan ending.

### Forms covered

All 15 conjugation forms: dictionary, ます / ません / ました / ませんでした, plain negative (ない) and plain past negative (なかった), て form, た form, conditional (仮定形), volitional (意志形), potential (可能形), passive (受身形), causative (使役形), and imperative (命令形). It handles all four verb classes: ichidan, godan, and the する / くる irregulars.

### Niceties

- kanji / kana toggle across the whole app, saved between visits
- romaji input auto-converts to kana
- JLPT level and "common" badges on lookup results
- deep links and back/forward navigation (`/quiz`, `/lookup?verb=食べる`, and so on)

## Run it locally

Needs [Bun](https://bun.sh).

```bash
bun install
bun run dev        # hot-reloading dev server on http://localhost:3001
```

Other scripts:

```bash
bun run build      # minified production build into dist/
bun run typecheck  # tsc --noEmit
bun run preview    # build, then serve with wrangler locally
bun run deploy     # build and deploy to Cloudflare
```

## How it's built

Alpine.js and TypeScript, bundled by Bun into a single `index.html` and deployed to Cloudflare Workers as a static SPA. The conjugation engine, dictionary (419 verbs), romaji converter, and Jisho client live as small TypeScript modules in `src/`. No framework build step beyond Bun.
