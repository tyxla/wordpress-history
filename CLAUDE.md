# Hello, World. — handoff for the next session

An independent, single-page, interactive history of WordPress (2001 to 30 September 2026).
`README.md` explains how to build it and how the content is organised; read that first.
This file records what a new session cannot see from the code: the owner's direction, the
decisions already made, how publishing works, and what is still open.

## Editorial direction (from the owner — follow it)

- **Optimistic, positive take.** The history celebrates what was built and the people who
  built it. The owner said explicitly that layoffs, Automattic's "alignment offers" and court
  cases (the WP Engine litigation and everything around it) do not belong in it.
- A first draft followed the original brief literally and gave a whole chapter to the
  2024–2026 dispute, with a dated ledger of allegations and rulings. It was removed at the
  owner's request. Do not reintroduce that material when updating the content.
- The positive framing is a choice of scope and emphasis. It is not licence to state things
  that are untrue: every claim still needs a source, and unflattering facts that remain in
  scope (a delayed release, a feature that did not ship, a falling market share) are stated
  plainly and without drama.
- Difficult periods are told through what the project learned or changed (chapter 9).

## What the original brief asked for, and how it was met

- One evolving illustrative website as the visual thread: "Kiln Diary" (a fictional potter's
  site). Its words and its crooked bowl never change; see `content/specimen.json` and
  `src/templates/specimen.mjs`. Always labelled as an illustration.
- Prologue plus ten chapters, a release collection as an interlude after chapter 8, an ending
  that returns to the opening, then sources and credits.
- Main reading path of roughly 2,000–3,000 words: it is currently about 3,300 (the build
  prints the count per chapter). Depth goes into `archive` blocks, not the main path.
- Editorial-exhibition art direction: paper, ink, one blue (`#1d3fc4`); Fraunces for display,
  Atkinson Hyperlegible Next and Mono for text. Every chapter title ends in a blue full stop;
  the last line ends in a blinking caret instead.
- About three scroll-linked scenes (opening, block editor, site editor). No scroll hijacking.
  State is always derived from scroll position in `src/scripts/core.js`.
- Readable without JavaScript: the plugin toggles, theme wardrobe, screen switcher and style
  variations are CSS-only (`:has()` on radio buttons and checkboxes). Scripts only enhance.

## How the pieces fit

- `node build.mjs` renders `content/` through `src/templates/` into `dist/`. No dependencies.
  `--strict` fails on an unknown source id, a quotation without a source, or a missing asset.
- Theme reconstructions are written once in `src/styles/themes.css` against
  `.site[data-theme="x"]`; the build rewrites those selectors so the wardrobe's radio buttons
  drive them too (`expandThemes` in `build.mjs`). Add a wardrobe theme in both
  `content/themes.json` and `themes.css`.
- Interactive exhibits load lazily: an element with `data-exhibit="name"` imports
  `src/scripts/exhibits/name.js` when it nears the viewport. The list of scripted names is
  the `SCRIPTED` set in `core.js`.
- Citations: `[^source-id]` in any text. Numbering is automatic, in reading order.
- In the blocks chapter the page's own paragraphs are wrapped in `<!-- wp:paragraph -->`
  comments on purpose (a small discovery for people who view source).
- Dates in prose are day-month-year ("27 May 2003"). The stamp "History verified through
  September 30, 2026." is fixed wording from the brief and lives in `site.json`.

## Publishing

- Hosted on Spacefast, Space `space-xsgxyfllp` in team `marin-team`
  (https://space-xsgxyfllp.view.fast/). The Space is private.
- The Space is connected to this GitHub repository (`tyxla/wordpress-history`). **Pushing to
  `main` builds and deploys production. Pushing any other branch builds a preview.** Direct
  `sf publish` is not the path here.
- `sf.jsonc` tells Spacefast to run `node build.mjs --strict` and publish `dist/`.
- The `sf` CLI is installed globally and logged in with a team API key (expires after 30
  days, or 7 without use). `sf builds ls`, `sf builds logs <id>` and `sf spaces get` show
  what happened after a push.
- Never commit `.spacefast/` or `dist/`.

## Research and images that are not in the repository

`research/` is git-ignored and exists only on the original machine
(`/Users/marin/Projects/wordpress-history/research/`). It holds:

- `01`–`06` and `releases.json`: verified facts, dates, verbatim quotations and the URLs
  opened, per era. `05-governance.md` is the material that was cut from the site.
- `07-assets-themes.md` and `assets/manifest.json`: about 120 images with verified licences
  (85 photographs, 19 screenshots, 17 theme screenshots) and default-theme credits. Only ten
  are used; the rest are available for future use.
- `08-factcheck.md`: an independent check of the text against the notes. Its corrections were
  applied; its "not found in notes" list is a fair record of small unsourced phrases.

If that folder is gone, `content/sources.json` is still the complete list of what the
published text relies on.

## Checks already run (September 2026, local build)

- Lighthouse: desktop 100 in all four categories; mobile 95 performance, 100 for
  accessibility, best practices and SEO.
- `npm run check:links`: 203 of 208 sources answer; the other five are WordPress Trac pages
  that refuse automated requests.
- No horizontal overflow at six widths from 360px to 1920px; all interactive exhibits pass a
  headless-browser run; the page reads correctly with JavaScript off and with reduced motion.
- Not tested: real phones, a screen reader, a throttled connection beyond Lighthouse's own.

## Open items

- The colophon says the history "leaves the project's commercial and legal disputes to other
  accounts", so that the omission is stated rather than silent. The owner has not confirmed
  whether to keep that line. It is in `content/site.json` under `colophon.about`.
- The colophon also credits Claude for the research, writing and code. Same status.
- Three screenshots (b2, WordPress 1.2, the 3.9-beta admin) come from the official history
  book, which has a book-level GPLv2 / CC BY-SA licence but none per image. They are plain
  screenshots of GPL software. Drop them if a stricter standard is wanted.
- The market-share chart uses the real W3Techs figures, which end at 40.2% after a 43.6% high
  in 2025. The text says "two in five" and does not dwell on the dip.
- The main path is about 10% over the brief's 3,000-word ceiling; chapter 3 is the longest.
- No block-editor or Site Editor screenshots are used; those screens are reconstructions.
  Licensed screenshots for versions 3.2 to 7.0 were identified but not downloaded (listed in
  `research/07-assets-themes.md`).
- WordPress 7.2 and the "Ipsum" default theme were plans for December 2026 at the time of
  writing. When they ship, follow "Keeping it current" in the README.
