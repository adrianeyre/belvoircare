# BelvoirCare Ltd — Website

A professional, single-page marketing website for **BelvoirCare Ltd**, providers of bespoke
event medical cover across the UK since 2012.

## Features

- **Single page**, fully responsive (mobile-first), tested down to 375px.
- **Light / Dark / System themes** — the toggle cycles through all three; "System" follows the
  OS preference live. Choice is saved to `localStorage` and applied before first paint (no flash).
- **Standout animations** — animated EKG line & glows in the hero, count-up stats, scroll-reveal
  sections, an animated "Shrimpy" mascot, hover micro-interactions, and a sticky/shrinking header.
  All motion respects `prefers-reduced-motion`.
- **Accessible** — WCAG-minded contrast, visible focus rings, skip link, semantic headings,
  ARIA labels, keyboard-friendly nav, 44px+ touch targets, and form errors announced politely.
- **No build step / no dependencies** — plain HTML, CSS and vanilla JS. Fonts from Google Fonts.
- The contact form composes a pre-filled email to `events@belvoircare.com` (no backend required).

## Structure

```
index.html          # markup + content + SEO/structured data
assets/
  styles.css        # design tokens, theming, layout, animations
  script.js         # theme, nav, scroll reveal, counters, scrollspy, form
  favicon.svg       # brand mark
```

## News / Facebook posts

The **News** section (`#news`) shows the three latest Facebook posts as equal-height cards
(photo on top — or the logo as a fallback for text-only posts — then the text and a *Read more*
button linking to the post), followed by a *See all of our Facebook posts* link.

Because this is a purely static site (no backend), the posts can't be pulled from Facebook live
in the browser — the Graph API needs a server-side token, and scraping is blocked. So the three
cards are curated by hand: to refresh them, edit the three `<article class="post">` blocks in
`index.html`. A comment above the section spells out the three fields to change per card (photo
`src`, post text, and the *Read more* URL). Remove the `<img>` line for a text-only post and the
logo fallback shows automatically. *(This could later be automated with a scheduled GitHub Action
that calls the Graph API and regenerates the cards.)*

## Run locally

It's a static site — just open `index.html`, or serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

Works as-is on any static host. For **GitHub Pages**: push to `main`, then in
*Settings → Pages* set the source to `main` / root.

## Content sourced from

The original `belvoircare.com` — services, support vehicles, treatment-room equipment, the Shrimpy
mascot, compliance (ICO / The Purple Guide), testimonials and contact details — restructured into a
modern single-page layout.

## Design system

Colours are sampled directly from the BelvoirCare logo: a professional **navy** (`#34516d`) primary
with a warm **amber** accent (`#ee9635`) — the same navy/amber pairing as the crown, initials and
Star of Life in the mark. Amber-on-light text uses a darker, AA-accessible `--accent-ink`, and amber
buttons carry navy ink for contrast. Figtree headings + Noto Sans body. Brand colours, spacing and
radii are defined as CSS custom properties in `assets/styles.css` and themed per mode — change them
in one place. The header/footer use the logo mark (`assets/images/logo-mark.png`, white background
removed) beside the wordmark, with an animated EKG line tying the pulse motif into the lockup.