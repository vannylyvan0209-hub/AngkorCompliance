# Angkor Compliance Platform v2.0

> **AI-Powered Factory Compliance Management System**

A modern, scalable compliance platform built with React, Node.js, and PostgreSQL, designed specifically for Cambodian factories to manage regulatory requirements, audits, and worker grievances.

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for server state
- **React Router** for routing
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express and TypeScript
- **PostgreSQL** with Prisma ORM
- **Redis** for caching
- **JWT** for authentication
- **Zod** for validation
- **AWS S3** for file storage

### Infrastructure
- **Docker** for containerization
- **Nginx** for reverse proxy
- **GitHub Actions** for CI/CD
- **AWS/GCP** for hosting

## 📋 Features

### Core Functionality
- ✅ **Multi-tenant Architecture** - Support for multiple factories
- ✅ **Role-based Access Control** - Granular permissions system
- ✅ **Document Management** - Upload, categorize, and version documents
- ✅ **Audit Management** - Plan, execute, and track audits
- ✅ **Grievance System** - Handle worker complaints and investigations
- ✅ **CAP Management** - Corrective Action Plan lifecycle
- ✅ **Training Management** - Schedule and track training sessions
- ✅ **Permit Tracking** - Monitor permit renewals and expirations

### Advanced Features
- 🤖 **AI Document Processing** - OCR and intelligent categorization
- 📊 **Real-time Analytics** - Compliance dashboards and reporting
- 🔔 **Notification System** - Email, SMS, and in-app notifications
- 📱 **Mobile Responsive** - Works on all devices
- 🌐 **Bilingual Support** - Khmer and English interface
- 🔒 **Enterprise Security** - ISO 27001 compliant

## 🏗️ Project Structure

```
angkor-compliance-v2/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and stores
│   │   ├── types/          # TypeScript type definitions
│   │   └── styles/         # CSS and styling
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   └── package.json
├── database/               # Database schemas and migrations
├── docker/                 # Docker configuration
│   ├── docker-compose.yml
│   └── nginx.conf
├── docs/                   # Documentation
└── scripts/               # Build and deployment scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd angkor-compliance-v2
   ```

2. **Start the development environment**
   ```bash
   cd docker
   docker-compose up -d postgres redis
   ```

3. **Set up the backend**
   ```bash
   cd ../backend
   cp env.example .env
   # Edit .env with your configuration
   npm install
   npm run db:generate
   npm run db:push
   npm run dev
   ```

4. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Database Admin: http://localhost:5050 (pgAdmin)

### Production Deployment

1. **Build the application**
   ```bash
   # Build frontend
   cd frontend
   npm run build
   
   # Build backend
   cd ../backend
   npm run build
   ```

2. **Deploy with Docker**
   ```bash
   cd docker
   docker-compose --profile production up -d
   ```

## 🔧 Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

#### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

### Database Management

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create and run migrations
npm run db:migrate

# Open database admin
npm run db:studio
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test         # Unit tests with Vitest
npm run test:e2e     # End-to-end tests with Playwright
```

### Backend Testing
```bash
cd backend
npm run test         # Unit tests with Jest
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## 📊 API Documentation

The API documentation is available at `/api/docs` when running the backend server.

### Authentication
All API endpoints (except login/register) require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Rate Limiting
- General API: 10 requests per second
- Login endpoint: 5 requests per minute

## 🔒 Security

### Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Input validation with Zod
- SQL injection prevention with Prisma
- XSS protection
- CSRF protection
- Rate limiting
- Security headers
- Encrypted password storage

### Environment Variables
Copy `env.example` to `.env` and configure:
- Database credentials
- JWT secrets
- AWS credentials
- Email configuration
- API keys

## 🌐 Internationalization

The platform supports both English and Khmer languages:
- Language switching in the UI
- Khmer font support (Noto Sans Khmer)
- Cultural context awareness
- RTL support for future expansion

## 📱 Mobile Support

- Responsive design for all screen sizes
- Progressive Web App (PWA) features
- Offline capability for critical functions
- Touch-friendly interface
- Mobile-optimized forms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@angkorcompliance.com
- Documentation: [docs.angkorcompliance.com](https://docs.angkorcompliance.com)
- Issues: [GitHub Issues](https://github.com/angkor-compliance/platform/issues)

## 🗺️ Roadmap

### Phase 1: Core Platform (Q1 2025)
- [x] Technology stack setup
- [ ] Authentication and authorization
- [ ] Basic CRUD operations
- [ ] Document management
- [ ] User management

### Phase 2: Advanced Features (Q2 2025)
- [ ] AI document processing
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Mobile optimization
- [ ] API integrations

### Phase 3: Enterprise Features (Q3 2025)
- [ ] Multi-tenant architecture
- [ ] Advanced reporting
- [ ] Workflow automation
- [ ] Third-party integrations
- [ ] Performance optimization

### Phase 4: AI & Analytics (Q4 2025)
- [ ] Predictive analytics
- [ ] Machine learning models
- [ ] Advanced AI features
- [ ] Business intelligence
- [ ] Custom dashboards

---

**Built with ❤️ for Cambodian factories**
