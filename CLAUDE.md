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

### Key Data Relationships
- Prefecture IDs (e.g. "08") map to English names (e.g. "ibaraki") 
- English names are used to fetch detailed organization data from `/data/organizations/{englishName}.json`
- Organizations are grouped by prefecture and filtered by geographic areas (北海道, 東北, 関東, etc.)

### Component Structure
- **Pages**: Route-level components in `src/pages/`
- **Layout**: Common Header/Footer components
- **Organization Components**: Specialized components for organization display and filtering
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

### Data File Structure
- Prefecture files follow: `{no, name, english_name, area}` format
- Organization files follow: `{organizations: [{id, name, area, url, note, sns}]}` format
- SNS objects use `{type, url, name}` structure for social media links