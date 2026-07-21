# Search entity conflict report — Ivori Digitals

---

## Problem

Branded queries for **“Ivori Digitals”** compete with:

- Generic “Ivory” / ivory marketing agencies  
- **Ivori Wear** and other “Ivori” apparel entities  
- Unrelated “Ivori” brands in MENA

---

## Why visibility may have weakened

| Factor | Assessment |
|--------|------------|
| **Title dilution** | Pages used short titles without consistent `Ivori Digitals` prefix in SERP snippets |
| **alternateName too generic** | Schema used `Ivori`, `Ivori CRO studio` — collides with other entities |
| **sameAs incomplete** | Canonical site URL not in `sameAs` graph |
| **Homepage entity signal** | H1 was thematic (“Premium commerce”) not brand-led in visible copy |
| **Internal anchors** | Nav logo “IVORI DIGITALS” but body copy rarely repeated full legal name |
| **robots** | Admin paths not disallowed (crawl budget noise) |

No evidence of canonical breakage or sitemap errors.

---

## Fixes applied

### Metadata

- Default title: `Ivori Digitals | Premium ecommerce & CRO studio · Egypt & MENA`
- `pageMetadata()` appends `| Ivori Digitals` when absent (consistent SERP brand tail)
- Keywords refocused on **Ivori Digitals + Egypt/MENA + ecommerce CRO** (removed generic “Ivori fashion” alone)

### Schema (`lib/seo/site.ts`)

- `alternateName`: Ivori Digitals Egypt, MENA, ecommerce studio, Shopify CRO  
- `identifier` PropertyValue: `ivoridigitals.com`  
- `slogan`, expanded `longDescription` with disambiguation (not Ivori Wear / ivory agencies)  
- `sameAs` includes canonical `https://www.ivoridigitals.com/`  
- Brand `alternateName` uses full “Ivori Digitals …” phrases

### On-page

- Homepage lead names **Ivori Digitals** + Cairo/MENA  
- Footer entity paragraph with full brand + service definition  
- Work index + case study titles include **Ivori Digitals**  
- Nav home `title` attribute

### Crawl

- `robots.ts` disallows `/studio-ops/`, `/admin/`, `/api/`  
- Sitemap priority: `/contact`, `/approach` elevated

---

## SEO impact (expected)

- **Short term:** clearer entity association in rich results and social cards  
- **Medium term (4–8 weeks):** improved disambiguation for branded queries after re-crawl  
- **Not guaranteed:** outranking Ivori Wear without backlinks and Search Console property verification

---

## Actions for owner (post-deploy)

1. Google Search Console → confirm property `https://www.ivoridigitals.com`  
2. Inspect URL `/` → validate Organization + WebSite schema  
3. Monitor queries: `Ivori Digitals`, `Ivori Digitals Egypt`, `Ivori Digitals Shopify`  
4. Keep Instagram/LinkedIn bios linking to `ivoridigitals.com` (sameAs consistency)

---

## Future recommendations

- Add verified `google` site verification meta when available  
- Publish 2–4 `/notes` pieces citing “Ivori Digitals” in first paragraph (natural, not stuffed)  
- Consider Google Business Profile for Cairo studio (LocalBusiness already in schema)
