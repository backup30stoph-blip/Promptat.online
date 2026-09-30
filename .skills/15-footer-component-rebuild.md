# Skill 15 — Footer Component Rebuild
## GemiPrompts.store — `<Footer />`

> Requires Skill 00 (tokens), Skill 12 (responsive), Skill 13 (slugs —
> footer links must use clean paths per Skill 14, never hash URLs).
> Rebuilds the footer shown in the reference screenshot exactly, as a
> single reusable component used on every page.

---

## 1. Content Inventory (from reference)

**Col 1 — Brand**
```
[icon] GemiPrompts.store          (icon: rounded-square, red bg, white
                                    sparkle/star glyph; "GemiPrompts" in
                                    near-black, ".store" in coral/red)
"The premier AI Creator Hub. Reimagining prompt libraries as integrated
systems: linking high-fidelity midjourney prompts, downloadable developer
skills, viral video blueprints, and complete SEO frameworks. Built for
builders, writers, and channel growth."
[GitHub icon]  [RSS icon]          (small, muted gray, link out)
```

**Col 2 — Hub Directories**
```
HUB DIRECTORIES
Prompts
Skills
Video Blueprints
Blog
```

**Col 3 — Popular Niches**
```
POPULAR NICHES
Architecture
Fantasy
Coding
SEO Strategy
Faceless Video
```

**Col 4 — Creator Perks**
```
CREATOR PERKS
Collections
Submit Blueprint     ← rendered in accent/coral color (distinct from
                        the other links — signals a CTA-style link)
Saved Prompts
```

**Col 5 — Newsletter**
```
WEEKLY BLUEPRINTS
"Get the latest viral hooks, Midjourney settings, and `.cursorrules`
directly in your inbox. No spam, ever."
[ email input .......................... ] [→ send button, coral]
[shield icon] GDPR Compliant · Unsubscribe in 1-click
```

---

## 2. Design Tokens (extracted from reference)

```css
--footer-bg:            var(--surface-base);      /* same as page bg */
--footer-border-top:    1px solid var(--border-subtle);

--brand-primary-text:   #0F172A;   /* "GemiPrompts" near-black/navy */
--brand-accent:         #E4433C;   /* ".store", icon bg, CTA links, send btn */

--heading-label:        #7C8798;   /* column headers: HUB DIRECTORIES etc */
--heading-label-size:   0.6875rem; /* ~11px */
--heading-label-tracking: 0.08em;  /* letter-spacing, uppercase */
--heading-label-weight: 600;

--link-color:           #1E293B;   /* default footer link */
--link-hover:           var(--brand-accent);
--link-cta-color:       var(--brand-accent);   /* e.g. "Submit Blueprint" */

--body-muted:           #64748B;   /* tagline + newsletter description */
--body-font-size:       0.875rem;

--icon-muted:           #94A3B8;   /* github/rss icons, default state */
--icon-hover:           #1E293B;
```

Logo mark: rounded-square (`rounded-lg`, ~28-32px), solid `--brand-accent`
background, white 4-point sparkle/star icon centered (lucide `Sparkles` or
`Sparkle` works well as a stand-in if no custom SVG is supplied).

---

## 3. Layout Structure

```
<footer>
  <div class="footer-grid">          5-column grid, desktop
    <BrandColumn />                  spans wider than the other 4
    <LinkColumn title="HUB DIRECTORIES" links={hubLinks} />
    <LinkColumn title="POPULAR NICHES" links={nicheLinks} />
    <LinkColumn title="CREATOR PERKS" links={perkLinks} ctaIndex={1} />
    <NewsletterColumn />
  </div>
  <div class="footer-bottom">        thin divider + copyright row
    © {year} GemiPrompts.store — All rights reserved.
    [Privacy] · [Terms] · [Sitemap]
  </div>
</footer>
```

Desktop grid: brand column ≈ 1.6fr, each link column 1fr, newsletter
column ≈ 1.4fr — matches the visual proportions in the reference (brand
and newsletter columns are visibly wider than the three link columns).

```css
grid-template-columns: 1.6fr 1fr 1fr 1fr 1.4fr;
gap: 2.5rem;
```

---

## 4. Responsive Behavior (per Skill 12)

```
xs–sm (<768px)   Single column, stacked in this order: Brand → 
                 Newsletter → Hub Directories → Popular Niches → 
                 Creator Perks. Newsletter promoted higher on mobile
                 since it's the highest-value conversion action and
                 shouldn't require scrolling past 3 link lists first.
md (768–1023)    2-column grid: Brand+Newsletter stack in col 1,
                 the three link columns wrap into col 2 as a
                 sub-3-column mini-grid
lg+ (≥1024)      Full 5-column layout as designed
```

- Newsletter input stays full-width of its column at every breakpoint,
  never shrinks below a usable tap target (48px height per Skill 12
  Section 6).
- Column header labels (HUB DIRECTORIES, etc.) get a bit more
  top-margin on mobile stacked layout to clearly separate sections
  since there's no longer a column gap doing that visual job.

---

## 5. Component Anatomy (React + TS + Tailwind + shadcn)

```
components/layout/Footer.tsx
components/layout/footer/
  ├── BrandColumn.tsx          logo, tagline, social icon row
  ├── FooterLinkColumn.tsx     reusable: {title, links[]}, one link
  │                            can be flagged `variant: "cta"` for the
  │                            coral-colored treatment (Submit Blueprint)
  ├── NewsletterColumn.tsx     heading, description, form, compliance line
  └── FooterBottomBar.tsx      copyright + legal links
```

`FooterLinkColumn` takes a typed prop so link data lives in one config
object, not hardcoded JSX per column (makes it trivial to edit link sets
from `site_settings`/admin later if you want this footer content
CMS-editable):

```ts
type FooterLink = { label: string; href: string; variant?: "default" | "cta" };
type FooterColumnData = { title: string; links: FooterLink[] };
```

---

## 6. Functional Requirements

- **Newsletter form** wires to the same `newsletter_subscribers` table
  and rate-limit logic defined in Skill 01 Section 5 — do not build a
  second, separate newsletter mechanism just because this instance lives
  in the footer.
- **All footer links use real `<Link>`/`<a href>` clean paths** per
  Skill 14 — `/prompts`, `/skills`, `/videos`, `/blog`, `/collections`,
  never hash URLs, never `onClick`-only JS navigation (footers are a
  major internal-linking / crawl-discovery surface per Skill 10 Section
  7 — this is one of the most-crawled parts of every page, so it must be
  real, indexable anchor tags).
- **Niche links** (`Architecture`, `Fantasy`, `Coding`, `SEO Strategy`,
  `Faceless Video`) route to `/categories/:type/:slug` per Skill 06 —
  pick the correct `:type` per niche (e.g. Architecture → prompt
  category, Coding → skill category, Faceless Video → video niche).
- **"Submit Blueprint"** (CTA-styled link) routes to a content
  submission flow/form — if that flow doesn't exist yet, route to a
  `/contact` or waitlist page rather than a dead link, and flag it as a
  known gap.
- **Social icons** (GitHub, RSS) are real `<a>` tags with `target="_blank"
  rel="noopener noreferrer"`, and the RSS icon links to an actual
  generated `/rss.xml` feed of blog posts (ties to Skill 05/10's sitemap
  generation — build the RSS feed alongside the sitemap, same data
  source).

---

## 7. Accessibility

- Column header labels use a semantic heading tag (`<h3>` visually
  styled small/uppercase, not a `<span>` — screen reader users rely on
  footer headings to navigate link groups quickly).
- Newsletter input has a visible-or-`sr-only` `<label>`, not placeholder
  text alone as the only label.
- Send button has an accessible name (`aria-label="Subscribe"`) since its
  visible content is icon-only.
- Icon-only social links (GitHub/RSS) get `aria-label`s.
- Color contrast: verify `--heading-label` (#7C8798) and `--body-muted`
  (#64748B) against the footer background meet WCAG AA (4.5:1 for body
  text) — if the background is pure white, #64748B passes; re-check if
  the footer background token differs from page background.

---

## 8. Google AI Studio — Master Build Prompt

```
Rebuild the site footer for GemiPrompts.store as a reusable <Footer />
component per Skill 15, matching this exact structure and content:

5-column desktop grid (1.6fr / 1fr / 1fr / 1fr / 1.4fr, 2.5rem gap):

Column 1 (Brand): a rounded-square logo mark (coral/red #E4433C
background, white sparkle icon, ~30px), wordmark "GemiPrompts" in
near-black (#0F172A) + ".store" in coral (#E4433C), a 3-line muted gray
tagline: "The premier AI Creator Hub. Reimagining prompt libraries as
integrated systems: linking high-fidelity midjourney prompts,
downloadable developer skills, viral video blueprints, and complete SEO
frameworks. Built for builders, writers, and channel growth." Below that,
two muted icon links (GitHub, RSS) that turn dark on hover, RSS linking
to a real generated /rss.xml feed of blog posts.

Column 2 "HUB DIRECTORIES": links to /prompts, /skills, /videos
(labeled "Video Blueprints"), /blog — real Link components with clean
paths, no hash routing.

Column 3 "POPULAR NICHES": links to their correct category routes
(/categories/:type/:slug) — Architecture, Fantasy, Coding, SEO Strategy,
Faceless Video.

Column 4 "CREATOR PERKS": Collections (/collections), Submit Blueprint
(styled in the coral accent color, distinct from the other links,
routing to a submission or contact flow), Saved Prompts (/account/bookmarks).

Column 5 "WEEKLY BLUEPRINTS": heading, description text ("Get the latest
viral hooks, Midjourney settings, and `.cursorrules` directly in your
inbox. No spam, ever." — render `.cursorrules` in a monospace/code
style), an email input + coral send-icon-button form that submits to the
same newsletter_subscribers table and rate-limit logic used on the
homepage newsletter section, and a small compliance line with a shield
icon: "GDPR Compliant · Unsubscribe in 1-click".

Column header labels: small uppercase, letter-spaced, muted gray
(#7C8798), rendered as semantic h3 elements for accessibility.

Responsive: single column stacked below md with Newsletter promoted to
appear right after Brand (before the link columns); 2-column layout at
md; full 5-column at lg+. Newsletter input stays full-width, min 48px
tap height at every breakpoint. All social icons and CTA links have
proper aria-labels. Add a bottom bar below the grid: a thin top divider,
copyright text, and Privacy/Terms/Sitemap links.

Build as components/layout/Footer.tsx composed of BrandColumn,
FooterLinkColumn (reusable, typed { title, links: {label, href,
variant?} }), NewsletterColumn, FooterBottomBar — link column data
should live in typed config objects, not hardcoded per-column JSX.
```

---

## 9. Acceptance Checklist

- [ ] Matches reference layout, colors, and copy exactly at `lg+`
- [ ] All link columns driven by typed config data, not hardcoded JSX
- [ ] Every link is a real crawlable `<a>`/`<Link>` with a clean path
      (Skill 14) — zero hash URLs, zero JS-only navigation
- [ ] Newsletter form reuses the Skill 01 subscription logic exactly,
      no duplicate implementation
- [ ] RSS icon links to a real, working `/rss.xml`
- [ ] Responsive stacking order matches Section 4 (Newsletter promoted
      on mobile)
- [ ] Column headings are semantic `<h3>`, icon-only links have
      `aria-label`s, input has a proper label
- [ ] Color contrast passes WCAG AA for muted text against the footer
      background
