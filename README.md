# わんだーネット (Hogo Dog)

A comprehensive web application for connecting Japanese dog rescue organizations with potential adopters. Built with React and Vite, this platform features both static organization discovery and dynamic animal adoption management with secure authentication.

## 🌟 Overview

HogoDog bridges the gap between animal rescue organizations and caring families across Japan. The platform combines efficient organization discovery with a full-featured adoption management system, ensuring both rescuers and adopters have the tools they need to find perfect matches.

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

# Authentication Configuration (Configure with your AWS Cognito settings)
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

## Architecture

### Frontend Architecture
- **React 18** with modern hooks and concurrent features
- **Vite** for fast development and optimized production builds
- **React Router** for client-side routing with protected routes
- **CSS Modules** for scoped styling and maintainable CSS
- **React Beautiful DND** for intuitive drag-and-drop interfaces

### Backend Integration
- **RESTful API** communication with `hogo_dog_backend`
- **JWT Authentication** for secure API access
- **Real-time Data** synchronization for animal listings and applications
- **S3 Integration** for photo storage and management

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

### Infrastructure as Code
The project uses Terraform for AWS infrastructure management:

- **S3 + CloudFront**: Static website hosting with global CDN
- **Route53**: DNS management with health checks
- **ACM**: SSL certificates with automatic renewal
- **Environment Separation**: Dedicated dev/staging/prod environments

### Deployment Process
```bash
# Deploy to development
cd terraform/environments/dev
cp backend.hcl.example backend.hcl
cp terraform.tfvars.example terraform.tfvars
# Configure your settings
terraform init -backend-config=backend.hcl
terraform apply

# Deploy to production
cd ../prod
# Configure production settings
terraform init -backend-config=backend.hcl
terraform apply
```

### CI/CD Pipeline
- **GitHub Actions** for automated deployment
- **Environment-specific** builds and configurations
- **Automatic** CloudFront cache invalidation
- **Production** deployment protection with approval gates

See `terraform/` directory and `.github/workflows/` for complete infrastructure and deployment code.

## Security Considerations

This application handles sensitive data related to animal welfare organizations and users. Please observe the following security practices:

### Environment Variables
- **Never commit `.env` files** containing real configuration
- Use `.env.example` as a template for required environment variables
- Store sensitive configuration in secure environment variable management systems

### Development Mode
- Development tools are automatically disabled in production builds
- Development configuration is separate from production settings
- Always use production-grade authentication and security measures in live deployments

### Data Privacy
- **Minimal Data Collection**: Only essential user information (name and email)
- **OAuth Authentication**: No password storage, delegated to trusted providers
- **Secure Transmission**: All data encrypted in transit with HTTPS
- **Access Control**: Role-based permissions for sensitive operations

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Make your changes following the existing code style
5. Run tests: `npm run test`
6. Run linting: `npm run lint`
7. Ensure no sensitive information is included in commits
8. Test with development environment variables only
9. Submit a pull request with a clear description

### Development Guidelines
- Follow React best practices and hooks patterns
- Write tests for new features using Vitest
- Use CSS Modules for component styling
- Maintain accessibility standards (ARIA labels, keyboard navigation)
- Ensure responsive design works across devices

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## License

This project is licensed under the terms specified in the LICENSE file.