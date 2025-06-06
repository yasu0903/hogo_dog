# わんだーネット (Hogo Dog)

A web application for searching and discovering dog rescue organizations across Japan. Built with React and Vite, this platform helps users find animal welfare organizations by geographic region.

## Features

- **Geographic Search**: Filter organizations by area (北海道, 東北, 関東, etc.) and prefecture
- **Organization Profiles**: Detailed information including contact details, websites, and social media links
- **Responsive Design**: Mobile-friendly interface with modern CSS modules
- **Static Data**: Fast loading with JSON-based data storage

## Tech Stack

- **Frontend**: React 18, React Router DOM
- **Build Tool**: Vite
- **Styling**: CSS Modules
- **Icons**: FontAwesome
- **Infrastructure**: AWS (S3, CloudFront, Route53) via Terraform

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm

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

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Layout components (Header, Footer)
│   └── organizations/  # Organization-specific components
├── pages/              # Route-level components
├── services/           # API and data fetching logic
├── constants/          # Configuration and localization
└── routes/             # React Router configuration

public/
└── data/               # Static JSON data files
    ├── prefecture.json # Prefecture and area data
    ├── source.json     # Organization summaries
    └── organizations/  # Detailed organization data by prefecture
```

## Data Structure

The application uses a two-tier data structure:

1. **Prefecture Data** (`public/data/prefecture.json`): Contains prefecture information with area mappings
2. **Organization Summaries** (`public/data/source.json`): High-level organization data by prefecture
3. **Detailed Organization Data** (`public/data/organizations/{prefecture}.json`): Complete organization profiles

## Deployment

The project includes Terraform configurations for AWS deployment:

- **S3**: Static website hosting
- **CloudFront**: CDN distribution
- **Route53**: DNS management
- **ACM**: SSL certificates

See `terraform/` directory for infrastructure code.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Submit a pull request

## License

This project is licensed under the terms specified in the LICENSE file.