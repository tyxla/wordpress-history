# Hello, World.

**A history of WordPress, and the people who built it.**

An independent, single-page, interactive history of WordPress, from b2/cafelog in 2001 to
30 September 2026. It follows one small illustrative website, "Kiln Diary", as it gains
plugins, themes, pages, a shop, blocks and whole-site design, while the chapters around it
tell the story of the people who made those things possible.

This is not an official WordPress publication.

## Run it

There are no dependencies. Node 18 or newer is all that is needed.

```sh
npm run build        # writes the finished site to dist/
npm run dev          # builds, serves http://localhost:4173 and rebuilds on change
npm run check        # builds and fails on any editorial problem (missing source, etc.)
npm run check:links  # requests every cited URL and reports the ones that do not answer
```

`dist/` is a plain static site: one `index.html`, one stylesheet, a few small scripts,
fonts and images.

## How it is organised

The history is kept apart from its presentation, so it can be corrected or extended
without touching the design.

```
content/                 the history itself
  site.json              title, opening, ending, colophon, "verified through" date
  chapters/NN-name.json  one file per chapter: an ordered list of blocks
  sources.json           every cited source (id, title, author, publisher, date, url)
  releases.json          every major release, its date, codename and musician
  themes.json            the default themes in the theme wardrobe, with credits
  assets.json            the image manifest: creator, date, licence, source
  marketshare.json       the W3Techs figures behind the chart
  specimen.json          the words and pictures of the illustrative website
src/
  templates/             functions that turn content into HTML
  styles/                CSS, concatenated in a fixed order at build time
  scripts/               core.js, plus one small module per interactive exhibit
  fonts/, images/        self-hosted, already optimised
tools/                   local server, link checker, font subsetting script
build.mjs                the build
```

### Writing content

A chapter is a list of blocks. A plain string is a paragraph; objects have a `type`:

| type | what it is |
| --- | --- |
| `lede`, `h3`, `pull`, `list` | opening paragraph, subheading, editorial pull line, list |
| `quote` | a verbatim quotation: needs `by` and a `cite` source id |
| `aside` | a margin note |
| `archive` | an "Open the archive" expansion holding quotes, facts, dated lists, notes |
| `figure` | a photograph or screenshot from `assets.json` |
| `exhibit` | one of the illustrated or interactive set pieces in `src/templates/exhibits.mjs` |

Inside text: `*emphasis*`, `**strong**`, `` `code` ``, `[label](url)`, and `[^source-id]` for
a citation. Citations are numbered automatically in reading order, and the build refuses
(`npm run check`) to accept a citation of a source that does not exist or a quotation
without a source.

### Keeping it current

1. Add the release to `content/releases.json`.
2. Add or edit blocks in the last chapter, and add their sources to `content/sources.json`.
3. Update `verifiedThrough` in `content/site.json`, and `content/marketshare.json` if the
   figures have moved.
4. `npm run check && npm run check:links`.

## Design notes

- The page works without JavaScript: the chapter index, the archives, the plugin toggles,
  the theme wardrobe, the screen switcher and the style variations are plain HTML and CSS.
  Scripts add the scroll-linked scenes, block rearranging, the basket, search in the release
  collection, the chart's hover layer and the closing "What would you publish?" box.
- Motion follows `prefers-reduced-motion` and can be switched off from the masthead.
- Historical interfaces are reconstructions in HTML and CSS and are labelled as such.
  Photographs and screenshots are listed, with their licences, in `content/assets.json`
  and in the site's credits.
- Typefaces: Fraunces, Atkinson Hyperlegible Next and Atkinson Hyperlegible Mono, all under
  the SIL Open Font License, subsetted with `tools/subset-fonts.py`.

## Licence

Code and text: GNU General Public License, version 3 or later (see `LICENSE`).
Images keep the licences recorded in `content/assets.json`. WordPress and WordCamp are
trademarks of their owners.
