# わんだーネット (Hogo Dog)

A comprehensive web application for connecting Japanese dog rescue organizations with potential adopters. Built with React and Vite, this platform features both static organization discovery and dynamic animal adoption management with secure authentication.

## Features

### 🔍 Organization Discovery
- **Geographic Search**: Filter organizations by area (北海道, 東北, 関東, etc.) and prefecture
- **Organization Profiles**: Detailed information including contact details, websites, and social media links
- **Static Data**: Fast loading with JSON-based organization directory

### 🐕 Animal Adoption System
- **Live Animal Listings**: Real-time data from shelter management backend
- **Advanced Photo Management**: Multi-photo upload with drag & drop sorting
- **Secure Authentication**: OAuth-based user accounts with privacy-focused design
- **User Management**: Personal profile pages and application tracking
- **Admin Dashboard**: Comprehensive management interface for organizations

### 📸 Photo Management
- **Multi-Photo Upload**: Drag & drop interface with real-time validation
- **Interactive Gallery**: Modal view with detailed photo information
- **Photo Reordering**: Drag & drop sorting using React Beautiful DND
- **Primary Photo Selection**: Users can designate main photos
- **Progress Tracking**: Real-time upload progress with error handling

### 🛡️ Security & Privacy
- **OAuth Authentication**: Secure, privacy-focused user accounts (no password storage)
- **Protected Routes**: Authentication-gated access to sensitive features
- **Role-based Access**: Granular permission system for organizations
- **Development Testing**: Multiple user role simulation for testing

## Tech Stack

- **Frontend**: React 18, React Router DOM, React Beautiful DND
- **Build Tool**: Vite
- **Styling**: CSS Modules
- **Authentication**: OAuth integration with secure token management
- **Backend Integration**: RESTful API with JWT authentication
- **Infrastructure**: AWS (S3, CloudFront, Route53) via Terraform

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm

### Environment Setup

Create a `.env` file based on `.env.example` with your configuration:

```bash
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_API_VERSION=v1

# Authentication Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_AWS_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_AWS_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_AWS_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com

# Application URL (for OAuth redirects)
VITE_APP_URL=http://localhost:5174

# Development settings (affects user role testing)
VITE_NODE_ENV=development
```

**Important**: The `VITE_NODE_ENV=development` setting enables:
- **Development User Switcher**: Test different user roles without multiple accounts
- **Backend Permission Testing**: Validate role-based access control
- **Mock Authentication**: Simulate various user permissions for development

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hogo_dog
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Development Mode Features

When `VITE_NODE_ENV=development` is set, the application includes additional development tools:

- **🔧 User Switcher**: Floating development panel to test different user roles
  - Normal User (no organization access)
  - Organization Member (basic organization features)
  - Organization Admin (full organization management)
  - System Administrator (system management features)
- **🧪 API Testing**: Built-in API permission testing for each user role
- **🔐 Backend Integration**: Real permission validation with backend services

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Layout components (Header, Footer)
│   ├── organizations/  # Organization-specific components
│   ├── animals/        # Animal adoption components
│   │   ├── PhotoUpload/    # Multi-photo upload with drag & drop
│   │   ├── PhotoPreview/   # Photo gallery with modal view
│   │   └── PhotoSorter/    # Drag & drop photo reordering
│   ├── auth/           # Authentication components
│   ├── admin/          # Admin management components
│   └── dev/            # Development tools (User Switcher)
├── pages/              # Route-level components
│   ├── MyPage/         # User profile page
│   ├── Login/          # Authentication page
│   └── admin/          # Admin dashboard and management
├── contexts/           # React context for global state
│   ├── AuthContext.jsx     # Authentication state
│   └── PermissionContext.jsx # Permission management
├── services/           # API and data fetching logic
├── constants/          # Configuration and localization
└── routes/             # React Router configuration

public/
└── data/               # Static JSON data files
    ├── prefecture.json # Prefecture and area data
    ├── source.json     # Organization summaries
    └── organizations/  # Detailed organization data by prefecture
```

## Data Architecture

The application features a dual data architecture:

### Static Organization Data
1. **Prefecture Data** (`public/data/prefecture.json`): Contains prefecture information with area mappings
2. **Organization Summaries** (`public/data/source.json`): High-level organization data by prefecture
3. **Detailed Organization Data** (`public/data/organizations/{prefecture}.json`): Complete organization profiles

### Dynamic Backend Data
- **Live Animal Listings**: Real-time data from `hogo_dog_backend` API
- **User Management**: Secure authentication and profile management
- **Application Processing**: Adoption application workflow
- **Photo Storage**: S3-based image management with metadata
- **Medical Records**: Animal health and treatment history

## Authentication & Privacy

This application prioritizes user privacy through:

### Secure Authentication
- **OAuth Integration**: Users authenticate via established OAuth providers
- **No Password Storage**: Eliminates the need for custom password management
- **Privacy-First Design**: Minimal data collection (name and email only)
- **Secure Token Management**: JWT-based session handling

### Development Environment
- **Role Simulation**: Test different user permissions without multiple accounts
- **Permission Validation**: Real-time backend permission testing
- **Development Testing**: Safe testing environment with mock data

## Deployment

The project includes Terraform configurations for AWS deployment:

- **S3**: Static website hosting with secure bucket policies
- **CloudFront**: CDN distribution with HTTPS enforcement
- **Route53**: DNS management with health checks
- **ACM**: SSL certificates with automatic renewal

See `terraform/` directory for infrastructure code.

## Security Considerations

This application handles sensitive data related to animal welfare organizations and users. Please observe the following security practices:

### Environment Variables
- **Never commit `.env` files** containing real credentials
- Use `.env.example` as a template for required environment variables
- Configure proper authentication credentials for production deployment

### Development Mode
- Development tools are automatically disabled in production builds
- Test credentials in development mode are not valid for production use
- Always use secure, production-grade authentication in live deployments

### Data Privacy
- User data collection is minimal (name and email only)
- All authentication is handled through secure OAuth providers
- No sensitive personal information is stored in the application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure no sensitive information is included in commits
5. Run linting: `npm run lint`
6. Test with development environment variables only
7. Submit a pull request

## License

This project is licensed under the terms specified in the LICENSE file.