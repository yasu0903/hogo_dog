# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HogoDog** is a React SPA for connecting Japanese dog rescue organizations with potential adopters. The application features a dual-architecture approach with static organization information and dynamic animal adoption management.

## Development Commands

- `npm run dev` - Start development server on localhost:5173
- `npm run build` - Build production bundle 
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report

## Environment Setup

Create a `.env` file based on `.env.example` with your AWS Cognito configuration:

```bash
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_API_VERSION=v1

# AWS Cognito Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_AWS_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_AWS_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_AWS_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com

# Application URL (for OAuth redirects)
VITE_APP_URL=http://localhost:5174

# Development settings
VITE_NODE_ENV=development
```

## Authentication & Privacy

This application prioritizes user privacy by using **Google OAuth exclusively** through AWS Cognito:

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
- **No Email/Password Registration**: Completely removed to prevent personal data collection

## Application Architecture

### Dual Data Architecture
The application separates two distinct types of data:

1. **Static Organization Data (Information Providers)**
   - Japanese rescue organizations and shelters directory
   - Prefecture-based search and filtering
   - Contact information and basic details
   - Stored as static JSON files in `/public/data/`

2. **Dynamic Shelter Data (Active Adopters)**
   - Live animal listings from active shelter management systems
   - Real-time adoption application processing
   - User authentication and application tracking
   - Backend API integration with `hogo_dog_backend`

### Key Features

#### 🔍 Organization Search
- **Geographic Filtering**: By prefecture and region (北海道, 東北, 関東, etc.)
- **Static Data**: Fast, cached organization directory
- **Contact Information**: Direct links to organization websites and social media

#### 🐕 Animal Adoption System
- **Live Animal Listings**: Real-time data from shelter management backend
- **Google Authentication**: Secure, privacy-focused user accounts
- **Adoption Applications**: Comprehensive form with validation
- **Application Tracking**: User dashboard with status management
- **Photo Galleries**: Multi-image display with modal view

#### 🛡️ Security & Privacy
- **Protected Routes**: Authentication-gated access to sensitive features
- **Token Management**: JWT-based session handling
- **Error Handling**: Graceful API failure recovery with mock data
- **Responsive Design**: Mobile-first, accessible UI

### Component Structure

```
src/
├── components/
│   ├── common/              # Shared layout components
│   │   ├── Header/          # Navigation with auth states
│   │   └── Footer/          # Site links and info
│   ├── organizations/       # Static organization components
│   │   ├── AreaFilter/      # Geographic filtering
│   │   ├── OrganizationCard/# Organization display
│   │   ├── OrganizationList/# Search results
│   │   └── PrefectureFilter/# Prefecture selection
│   ├── animals/             # Dynamic animal components
│   │   ├── AnimalCard/      # Animal listing item
│   │   ├── AnimalFilter/    # Search and filter controls
│   │   ├── AnimalGallery/   # Photo gallery with modal
│   │   └── AnimalList/      # Animal listings grid
│   └── auth/                # Authentication components
│       └── ProtectedRoute/  # Route access control
├── contexts/
│   └── AuthContext.jsx     # Global authentication state
├── pages/                   # Route-level components
│   ├── Home/               # Landing page
│   ├── Organizations/      # Static organization search
│   ├── OrganizationDetail/ # Static organization details
│   ├── Animals/            # Dynamic animal listings
│   ├── AnimalDetail/       # Individual animal pages
│   ├── Shelters/           # Active shelter listings
│   ├── ShelterDetail/      # Active shelter details
│   ├── Adopt/              # Adoption application form
│   ├── Login/              # Google authentication
│   ├── Dashboard/          # User application management
│   ├── PrivacyPolicy/      # Privacy information
│   └── TermsOfService/     # Terms and conditions
├── services/
│   └── api.js              # Centralized data fetching
├── constants/
│   └── locales/ja.js       # Japanese text constants
└── routes/
    └── index.jsx           # Application routing
```

## API Service Pattern

All data fetching is centralized in `src/services/api.js`:

### Static Data Functions
- `fetchPrefectures()` - Prefecture list with area mappings
- `fetchOrganizations()` - Organization directory summaries
- `fetchOrganizationDetail(prefectureId)` - Detailed organization data
- `getAreas()` - Unique area list derivation

### Dynamic API Functions
- `fetchAnimals(filters)` - Live animal listings with filtering
- `fetchAnimalById(id)` - Individual animal details
- `fetchShelters()` - Active shelter directory
- `fetchShelterById(id)` - Shelter details and animals
- `createApplication(data)` - Submit adoption applications
- `fetchUserApplications()` - User's application history

### Error Handling
- **Graceful Degradation**: API failures fall back to mock data
- **User Feedback**: Clear error messages and retry options
- **Token Management**: Automatic authentication header handling

## Testing Strategy

This project uses Vitest with React Testing Library for comprehensive test coverage:

### Test Structure
- **Unit Tests**: Component logic and utility functions
- **Integration Tests**: Component interactions and API calls
- **Authentication Tests**: Google OAuth flow and protected routes
- **Form Tests**: Adoption application validation and submission
- **API Tests**: Service functions with error handling

### Key Test Coverage
- **Authentication Flow**: Google OAuth, session management, logout
- **Protected Routes**: Access control, permission checks, redirects
- **Form Validation**: Adoption applications, error states, submission
- **API Integration**: Data fetching, error handling, mock fallbacks
- **User Interactions**: Component behavior, state changes, navigation

### Test Files Location
```
src/
├── contexts/__tests__/
│   └── AuthContext.test.jsx
├── components/auth/__tests__/
│   └── ProtectedRoute.test.jsx
├── pages/Adopt/__tests__/
│   └── Adopt.test.jsx
├── pages/Login/__tests__/
│   └── Login.test.jsx
└── services/__tests__/
    └── api.test.js
```

### Running Tests
```bash
npm run test              # Run all tests
npm run test:ui           # Interactive test UI
npm run test:coverage     # Coverage report
```

## Development Phase Status

### ✅ Phase 1: Infrastructure (COMPLETED)
- HTTP client integration (Axios)
- Environment-based configuration
- Authentication context setup
- Route protection implementation

### ✅ Phase 2: Animal Management (COMPLETED)
- Dynamic animal listings with filtering
- Photo galleries with modal views
- Animal detail pages
- Shelter management integration
- Mock data fallback systems

### ✅ Phase 3: User Experience (COMPLETED)
- Google OAuth authentication integration
- Adoption application form with validation
- User dashboard and application tracking
- Privacy-focused design implementation
- Comprehensive test suite

### 🔄 Phase 4: Deployment & Optimization (PENDING)
- Production environment setup
- AWS Cognito configuration
- Performance optimization
- SEO and accessibility improvements

## Data File Structure

### Static Organization Data
- **Prefecture List**: `/public/data/prefecture.json`
  ```json
  [{ "no": "08", "name": "茨城県", "english_name": "ibaraki", "area": "関東" }]
  ```
- **Organization Directory**: `/public/data/source.json`
  ```json
  [{ "id": 1, "name": "団体名", "area": "関東", "prefecture": "08" }]
  ```
- **Detailed Data**: `/public/data/organizations/{prefecture}.json`
  ```json
  { "organizations": [{ "id": 1, "name": "団体名", "url": "https://...", "sns": [...] }] }
  ```

### Dynamic API Data
- **Animals**: Live animal listings from backend
- **Applications**: User adoption applications
- **Shelters**: Active shelter management data
- **Users**: Google OAuth user profiles (name, email only)

## Development Guidelines

### Adding New Features
1. **Privacy First**: Ensure no additional personal data collection
2. **Authentication**: Use Google OAuth exclusively
3. **Error Handling**: Implement graceful API failure recovery
4. **Testing**: Write comprehensive tests for new functionality
5. **Responsive Design**: Mobile-first, accessible implementation

### Code Style
- **Component Structure**: Functional components with hooks
- **CSS Modules**: Scoped styling for each component
- **State Management**: Context API for global state
- **Type Safety**: PropTypes for component validation
- **Error Boundaries**: Graceful error handling

### Security Best Practices
- **No Secrets in Code**: All sensitive data in environment variables
- **Token Security**: Secure JWT handling and storage
- **HTTPS Only**: Production deployment requires SSL
- **Input Validation**: All forms validated on frontend and backend
- **CORS Configuration**: Proper cross-origin request handling

## Backend Integration

This frontend integrates with `hogo_dog_backend` (Go/AWS Lambda) for:
- **Animal Management**: CRUD operations for shelter animals
- **Application Processing**: Adoption application workflow
- **User Management**: Google OAuth user profile handling
- **Photo Storage**: S3-based image management
- **Email Notifications**: Application status updates

### API Endpoints
- `GET /api/v1/animals` - Animal listings
- `GET /api/v1/animals/:id` - Animal details
- `POST /api/v1/applications` - Submit applications
- `GET /api/v1/applications` - User applications
- `GET /api/v1/shelters` - Active shelters

## Deployment Notes

### Environment Requirements
- **Node.js**: 18+ for Vite compatibility
- **AWS Cognito**: User pool with Google identity provider
- **Backend API**: `hogo_dog_backend` deployment
- **Domain**: HTTPS required for OAuth redirects
- **CDN**: Recommended for static asset delivery

### Production Configuration
- Set appropriate `VITE_APP_URL` for production domain
- Configure Cognito redirect URLs
- Enable production error monitoring
- Set up automated testing pipeline
- Configure backup and recovery procedures

This architecture ensures a secure, privacy-focused, and scalable animal adoption platform that connects rescue organizations with caring adopters while maintaining the highest standards of user data protection.