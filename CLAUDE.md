# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**HogoDog (わんだーネット)** is a comprehensive React SPA that connects Japanese dog rescue organizations with potential adopters. The application features a sophisticated dual-architecture approach combining static organization information with dynamic animal adoption management, built with modern web technologies and secure authentication systems.

## Development Commands

- `npm run dev` - Start development server on localhost:5173
- `npm run build` - Build production bundle 
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report

## Environment Setup

Create a `.env` file based on `.env.example` with your authentication configuration:

```bash
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_API_VERSION=v1

# Authentication Configuration (AWS Cognito)
VITE_AWS_REGION=ap-northeast-1
VITE_AWS_USER_POOL_ID=your-user-pool-id
VITE_AWS_USER_POOL_WEB_CLIENT_ID=your-client-id
VITE_AWS_IDENTITY_POOL_ID=your-identity-pool-id
VITE_AWS_COGNITO_DOMAIN=your-cognito-domain

# Application URL (for OAuth redirects)
VITE_APP_URL=http://localhost:5173

# Development settings (enables advanced development tools)
VITE_NODE_ENV=development
```

## Authentication & Privacy

This application prioritizes user privacy by using **Google OAuth exclusively** through secure authentication services:

### OAuth Authentication
- **Google OAuth Integration**: Users authenticate via Google OAuth through AWS Cognito
- **Privacy-First Design**: No password storage - delegated authentication
- **Secure Redirect Handling**: Automatic redirect after successful authentication
- **Minimal Data Collection**: Only name and email from OAuth provider
- **Session Management**: JWT-based secure token management

### Privacy Protection
- **Minimal Data Storage**: Only essential user information (name and email)
- **OAuth Delegation**: No password management - handled by trusted providers
- **Secure Transmission**: All data encrypted in transit with HTTPS
- **Access Control**: Role-based permissions for sensitive operations

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
- **Advanced Photo Management**: Multi-photo upload with drag & drop sorting
- **Photo Upload Features**: 
  - Drag & drop multiple files simultaneously
  - Real-time preview with modal view
  - Interactive photo reordering using react-beautiful-dnd
  - Primary photo selection
  - Upload progress tracking
  - File validation and error handling
- **User Management**: Personal profile pages and settings
- **Admin Dashboard**: Comprehensive management interface for organizations
- **Member Management**: Role-based access control and invitation system

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
│   │   ├── AnimalList/      # Animal listings grid
│   │   ├── PhotoUpload/     # Multi-photo upload with drag & drop
│   │   ├── PhotoPreview/    # Photo preview with modal view
│   │   └── PhotoSorter/     # Drag & drop photo reordering
│   ├── auth/                # Authentication components
│   │   ├── ProtectedRoute/  # Route access control
│   │   ├── AdminProtectedRoute/ # Admin-only route protection
│   │   └── PermissionGuard/ # Permission-based component access
│   └── admin/               # Admin management components
│       ├── InviteMemberModal/ # Member invitation modal
│       └── EditMemberModal/   # Member role editing modal
├── contexts/
│   ├── AuthContext.jsx     # Global authentication state
│   └── PermissionContext.jsx # Organization permission management
├── pages/                   # Route-level components
│   ├── Home/               # Landing page
│   ├── Organizations/      # Static organization search
│   ├── OrganizationDetail/ # Static organization details
│   ├── Animals/            # Dynamic animal listings
│   ├── AnimalDetail/       # Individual animal pages
│   ├── Shelters/           # Active shelter listings
│   ├── ShelterDetail/      # Active shelter details
│   ├── Adopt/              # Adoption application form (commented out)
│   ├── Login/              # Google authentication
│   ├── MyPage/             # User profile and settings
│   ├── Dashboard/          # User application management (commented out)
│   ├── PrivacyPolicy/      # Privacy information
│   ├── TermsOfService/     # Terms and conditions
│   └── admin/              # Admin pages
│       ├── AdminDashboard/ # Administrative overview dashboard
│       └── MemberManagement/ # Organization member management
├── services/
│   ├── api.js              # Centralized data fetching
│   └── permissionApi.js    # Permission and member management API
├── constants/
│   ├── locales/ja.js       # Japanese text constants
│   ├── pagination.js       # Pagination constants
│   ├── privacyPolicy.js    # Privacy policy content
│   └── termsOfService.js   # Terms of service content
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
- `fetchUserById(userId)` - User profile information
- `fetchAnimalPhotos(animalId)` - Animal photo gallery
- `createUser(userData)` - User registration
- `setAuthToken(token)` - Set API authentication token

### Photo Management API Functions
- **Photo Upload**: S3 presigned URL workflow
  - Get upload URL: `POST /animals/{animalId}/photos/upload-url`
  - Upload to S3: Direct file upload via presigned URL
  - Register metadata: `POST /animals/{animalId}/photos`
- **Photo Management**: Full CRUD operations
  - List photos: `GET /animals/{animalId}/photos`
  - Get photo: `GET /animals/{animalId}/photos/{photoId}`
  - Update photo: `PUT /animals/{animalId}/photos/{photoId}`
  - Delete photo: `DELETE /animals/{animalId}/photos/{photoId}`
  - Set primary: `PUT /animals/{animalId}/photos/{photoId}/set-primary`
  - Reorder photos: `PUT /animals/{animalId}/photos/reorder`

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

### ✅ Phase 4: Advanced Features (COMPLETED)
- **Multi-Photo Upload System**: Complete drag & drop photo management
  - React Beautiful DND integration for intuitive reordering
  - Real-time preview with modal gallery view
  - Primary photo selection and management
  - Upload progress tracking with error handling
  - File validation (format, size, type checking)
- **User Management Pages**: 
  - Personal user profile page (`/mypage`) with settings
  - Admin dashboard (`/admin`) with organization statistics
  - Member management system with role-based permissions
- **Enhanced Routing**: Protected routes for user and admin areas
- **Component Architecture**: Modular photo management components

### 🔄 Phase 5: Deployment & Optimization (PENDING)
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
- `GET /api/v1/users/:id` - User profile information
- `POST /api/v1/users` - Create user account
- **Photo Management Endpoints**:
  - `POST /api/v1/animals/:id/photos/upload-url` - Get S3 upload URL
  - `POST /api/v1/animals/:id/photos` - Register photo metadata
  - `GET /api/v1/animals/:id/photos` - List animal photos
  - `PUT /api/v1/animals/:id/photos/:photoId` - Update photo
  - `DELETE /api/v1/animals/:id/photos/:photoId` - Delete photo
  - `PUT /api/v1/animals/:id/photos/:photoId/set-primary` - Set primary photo
  - `PUT /api/v1/animals/:id/photos/reorder` - Reorder photos

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

## Latest Updates (December 2024)

### 📸 Advanced Photo Management System
The application now features a comprehensive photo management system with the following capabilities:

#### PhotoUpload Component (`/src/components/animals/PhotoUpload/`)
- **Multi-file Selection**: Support for selecting multiple images simultaneously
- **Drag & Drop Interface**: Intuitive file dropping with visual feedback
- **Real-time Validation**: File format, size, and type checking
- **Upload Progress**: Individual file progress tracking with error handling
- **Primary Photo Selection**: Users can designate main photos before upload

#### PhotoPreview Component (`/src/components/animals/PhotoPreview/`)
- **Grid Layout**: Clean, responsive photo gallery
- **Modal View**: Click-to-expand with detailed information
- **Interactive Controls**: Set primary photo, delete images
- **File Information**: Display file name, size, and format details

#### PhotoSorter Component (`/src/components/animals/PhotoSorter/`)
- **React Beautiful DND**: Smooth drag-and-drop reordering
- **Visual Feedback**: Clear visual cues during drag operations
- **Alternative Controls**: Arrow buttons for precise positioning
- **Order Display**: Numbered sequence for clarity

#### Integration Features
- **S3 Presigned URLs**: Secure direct-to-S3 upload workflow
- **Backend Synchronization**: Automatic metadata registration
- **Error Recovery**: Graceful handling of upload failures
- **Mobile Responsive**: Touch-friendly interface for mobile devices

### 👥 User and Admin Management

#### User Profile System
- **MyPage** (`/mypage`): Personal profile with user information and notification settings
- **Profile Display**: User name, email, phone, and address information
- **Notification Preferences**: Configurable email notification settings

#### Administrative Interface
- **Admin Dashboard** (`/admin`): Statistical overview and quick actions
- **Member Management** (`/admin/members`): Role-based team management
- **Permission System**: Granular access control for organization features

### 🛡️ Enhanced Security and Routing
- **Route Protection**: Separate guards for user and admin areas
- **Permission Context**: Centralized permission management
- **Role-based Access**: Flexible permission system for organizations

### 🎨 User Experience Improvements
- **Responsive Design**: Mobile-first approach across all new components
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Visual Consistency**: Unified design language and component styling
- **Performance**: Optimized rendering and state management

## Deployment and Infrastructure

### Terraform Infrastructure
The project uses Infrastructure as Code (Terraform) for AWS deployment:

```
terraform/
├── environments/
│   ├── dev/                    # Development environment
│   └── prod/                   # Production environment
├── shared/                     # Common configurations
└── modules/                    # Reusable infrastructure components
```

### Deployment Commands
```bash
# Development deployment
cd terraform/environments/dev
cp backend.hcl.example backend.hcl
cp terraform.tfvars.example terraform.tfvars
terraform init -backend-config=backend.hcl
terraform apply

# Production deployment
cd ../prod
terraform init -backend-config=backend.hcl
terraform apply
```

### CI/CD Pipeline
- **GitHub Actions** for automated deployment
- **Environment-specific** configurations
- **S3 + CloudFront** for static hosting
- **Route53** for DNS management

## Security Best Practices

### Environment Configuration
- Never commit `.env` files with real configuration
- Use `.env.example` as template
- Store sensitive data in secure environment management systems
- Separate development and production configurations

### Authentication Security
- OAuth-only authentication (no password storage)
- JWT token-based session management
- Role-based access control for admin features
- Secure HTTPS transmission for all data

### Code Security
- Input validation on all user inputs
- XSS protection through React's built-in escaping
- CSRF protection through SameSite cookies
- Secure API communication with proper error handling

## Development Best Practices

### Code Style
- Use functional components with React hooks
- Implement CSS Modules for scoped styling
- Follow React best practices and patterns
- Write comprehensive tests with Vitest

### Performance
- Optimize bundle size with Vite's tree shaking
- Implement lazy loading for route-based code splitting
- Use React.memo for expensive component renders
- Optimize images and assets for web delivery

### Accessibility
- Implement proper ARIA labels and roles
- Ensure keyboard navigation support
- Maintain sufficient color contrast ratios
- Test with screen readers and accessibility tools

This architecture ensures a secure, privacy-focused, and scalable animal adoption platform that connects rescue organizations with caring adopters while maintaining the highest standards of user data protection and providing an exceptional user experience.