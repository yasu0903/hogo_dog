# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on localhost:5173
- `npm run build` - Build production bundle 
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Environment Setup

Create a `.env` file based on `.env.example` with your AWS Cognito configuration:

```bash
# AWS Cognito Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_AWS_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_AWS_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_AWS_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
VITE_APP_URL=http://localhost:5174
```

## Authentication Flow

This application uses **Google OAuth only** through AWS Cognito for enhanced privacy:

### Google Authentication (Only)
- **OAuth Flow**: Users can only sign in with their Google account
- **Privacy First**: No custom password storage - only Google name and email are used
- **Redirect Handling**: Automatic redirect after successful authentication
- **User Data**: Minimal data usage - only name and email from Google profile
- **Session Management**: Secure token-based authentication via Cognito

### Privacy Protection
- **No Personal Data Storage**: The service doesn't store any personal information beyond what Google provides
- **Google-Only Authentication**: Eliminates the need for users to create new accounts with personal details
- **Minimal Data Usage**: Only email and name are used for authentication and display purposes

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

## Future Enhancement Plans

### Data Architecture Evolution
This project is designed to support expansion beyond static organization listings:

**Current Implementation**
- Static JSON-based organization directory
- Prefecture-based filtering and search
- Basic contact information display

**Planned Enhancements**
- Dynamic content management capabilities
- Enhanced user interaction features
- Extended search and filtering options

### Development Roadmap

**Phase 1: Infrastructure**
- HTTP client integration for API communication
- Environment-based configuration management
- Enhanced routing capabilities

**Phase 2: Content Expansion**
- Additional content types and categories
- Improved user interface components
- Advanced filtering and search features

**Phase 3: User Experience** ✅ COMPLETED
- AWS Cognito authentication integration
- User registration with email verification
- Adoption application management
- User dashboard and application tracking

### Component Architecture
The project follows a modular component structure that supports:
- Scalable feature additions
- Maintainable code organization
- Reusable UI components
- Consistent styling patterns

### Technical Approach
- **Modularity**: Components are designed for easy extension
- **Compatibility**: New features maintain existing functionality
- **Performance**: Efficient data loading and caching strategies
- **Accessibility**: Responsive design and user-friendly interfaces