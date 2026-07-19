# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on localhost:5173
- `npm run build` - Build production bundle 
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Architecture Overview

This is a React SPA for searching Japanese dog rescue organizations with geographic filtering capabilities.

### Data Flow Architecture
- **Static JSON Data**: All organization data lives in `/public/data/` as static JSON files
- **Prefecture-based routing**: Organization detail pages use prefecture ID from URL params
- **Two-tier data structure**:
  - `source.json` - Prefecture-level organization summaries  
  - `organizations/{prefecture}.json` - Detailed organization data per prefecture
- **Generated search index (Phase 3)**: `scripts/build_search_index.mjs` runs automatically before
  `npm run dev` / `npm run build` (predev/prebuild hooks) and generates `public/data/search_index.json`
  (unified all-organizations index for the national search page), `public/sitemap.xml`, and
  `public/robots.txt`. All three are gitignored — never hand-edit them; edit the source JSONs instead

### Key Data Relationships
- Prefecture IDs (e.g. "08") map to English names (e.g. "ibaraki") 
- English names are used to fetch detailed organization data from `/data/organizations/{englishName}.json`
- Organizations are grouped by prefecture and filtered by geographic areas (北海道, 東北, 関東, etc.)

### Routing (Phase 3)
- `/` Home, `/organizations` national cross-prefecture search (filters `q` / `area` / `pref` /
  `species` / `view` / `page` are synced to URL query; `?view=map` shows the SVG tile choropleth),
  `/organizations/:id` per-prefecture list, `/organizations/:prefectureId/:orgId` single-organization
  page (per-page SEO/OGP via react-helmet-async)

### Component Structure
- **Pages**: Route-level components in `src/pages/`
- **Layout**: Common Header/Footer components, shared `Seo` and `Pagination` in `src/components/common/`
- **Organization Components**: `OrgCard` (shared card for search + prefecture pages),
  `JapanTileMap` (tile-grid choropleth), `AreaFilter`, `PrefectureFilter`
- **Modular CSS**: Each component has its own `.module.css` file

### API Service Pattern
All data fetching is centralized in `src/services/api.js`:
- `fetchPrefectures()` - Gets prefecture list with area mappings
- `fetchOrganizations()` - Gets organization summaries by prefecture  
- `fetchOrganizationDetail(prefectureId)` - Gets detailed organization data
- `getAreas()` - Derives unique area list from prefecture data

### Internationalization
Japanese text constants are centralized in `src/constants/locales/ja.js` with categorized message objects.

### FontAwesome Integration
Uses FontAwesome React components for social media icons with dynamic icon mapping based on SNS type strings.

## Development Notes

### Adding New Prefectures
1. Add prefecture data to `/public/data/prefecture.json`
2. Create corresponding `/public/data/organizations/{englishName}.json` file
3. Update area mappings if introducing new geographic areas
4. Update `listed_num` in `/public/data/source.json` to match the number of organizations in the prefecture's organizations file (prefectures with `listed_num` 0 are hidden from the list page)

### Data File Structure
- Prefecture files follow: `{no, name, english_name, area}` format
- Organization files follow: `{organizations: [{id, name, area, city, species, source_type, url, caution, note, sns, last_verified?, link_broken?}]}` format
  - `species`: array of `"dog"` / `"cat"` (empty array = 未確認, shown without badges)
  - `city`: 活動市区町村・地域 (empty string if unknown; displayed as `{area}・{city}`)
  - `source_type`: `"official"` (県公表一覧掲載) or `"independent"` (独自調査)
  - `caution`: 注意事項 (e.g. 引取り不可), rendered as a warning on the card
  - `note`: free text only — 出典・地域・犬猫の別 must go in the structured fields above, not here
  - `last_verified`: date (e.g. "2026-07-19") the org's URL/site was last checked (Phase 2.5 enrichment; basis for Phase 3 freshness display)
  - `link_broken`: `true` only when the URL is dead or hijacked (omit otherwise)
- SNS objects use `{type, url, name}` structure for social media links
- `source.json` entries include `as_of` (時点, e.g. "令和5年9月12日") shown in the per-prefecture source banner; `source_url` non-empty marks the prefecture list as officially published
- Never include phone numbers in data files (個人情報方針); `scripts/migrate_phase2_notes.py` contains the note-migration logic and a phone-number validation check
- `scripts/enrichment/` is the Phase 2.5 pipeline (inventory → URL liveness → HTML snippet extraction → Gemini judgment → apply). Rerunnable; needs `GEMINI_API_KEY`. Hand-reviewed values live in `scripts/enrichment/manual_overrides.json` — LLM caution text is never applied without session review. Intermediate outputs are in `scripts/enrichment/out/` (regenerable, not for hand-editing)