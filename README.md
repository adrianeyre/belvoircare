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
- **Accessible — WCAG 2.2 Level AA.** Verified with axe-core across light/dark themes at 1440px,
  390px and 320px, plus scripted checks for the criteria axe cannot see. Highlights: AA contrast in
  both themes (3:1 for borders, icons and focus rings), a visible focus outline that is never hidden
  behind the fixed header, keyboard access to every control, pause/play buttons on the auto-scrolling
  strips, carousel arrows at all widths so nothing needs dragging, 24px+ targets, reflow to 320px,
  form errors wired to their fields and announced, and focus-trapped dialogs that restore focus.
  The footer's **Accessibility** link opens the accessibility statement.
- **Legal pages as dialogs** — the footer opens the Privacy Policy, Terms & Conditions, Cookie
  Policy and Accessibility statement. Dialogs can link to one another; focus still returns to the
  original trigger when the last one closes.
- **No build step / no dependencies** — plain HTML, CSS and vanilla JS. Fonts from Google Fonts.
- The contact form composes a pre-filled email to `events@belvoircare.com` (no backend required).

## Structure

```
index.html          # markup + content + SEO/structured data + legal/accessibility dialogs
assets/
  styles.css        # design tokens, theming, layout, animations
  script.js         # theme, nav, scroll reveal, counters, scrollspy, form, dialogs, carousels
  favicon.svg       # brand mark
```

### Accessibility notes for future edits

- `--border` is for decorative dividers; use `--border-strong` for anything interactive — it is the
  token that meets the 3:1 non-text contrast requirement.
- `--accent-ink` is the readable amber for text; plain `--accent` is a decorative fill and does not
  meet 4.5:1 on light surfaces.
- Links inside `<p>` and `<li>` are underlined on purpose (WCAG 1.4.1) — opt out only for links that
  are already visually distinct, via the exception list next to the `a` rule.
- Anything fixed to the top or bottom of the viewport must not be able to cover a focused control;
  see `scroll-padding-top`, the footer's bottom padding, and the focus guard in `script.js`.
- New dialogs need only `class="modal-overlay"` with an id, a `[data-modal-close]` button, and a
  trigger carrying `data-modal-open="<id>"`; the controller handles focus, Escape and inerting.

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