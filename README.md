# Cloud Storage Platform

A full-stack cloud storage application built with the PERN stack (PostgreSQL, Express, React, Node.js). This system provides secure file storage, hierarchical folder management, and controlled file sharing through cryptographically secure tokenized links.

## Project Status

- Backend: Complete
- Frontend: In Active Development

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [System Architecture](#system-architecture)
- [Implemented Features](#implemented-features)
- [Directory Structure](#directory-structure)
- [Technology Stack](#technology-stack)
- [Development Roadmap](#development-roadmap)
- [API Endpoints](#api-endpoints)
- [Security Implementation](#security-implementation)
- [Caching Mechanism](#caching-mechanism)
- [Development Environment Setup](#development-environment-setup)
- [Testing and Quality Assurance](#testing-and-quality-assurance)
- [Contributing Guidelines](#contributing-guidelines)
- [Deployment](#deployment)
- [Architectural Principles](#architectural-principles)

---

## Prerequisites

- Node.js version 18 or higher
- PostgreSQL version 14 or higher (or Supabase)
- Redis (optional, for performance optimization)
- npm or yarn package manager

---

## Installation and Setup

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd cloud-storage-platform
```

### Step 2: Backend Configuration

```bash
cd server
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Backend API: `http://localhost:5000`

### Step 3: Frontend Configuration

```bash
cd ../client
npm install
npm run dev
```

Frontend: `http://localhost:5173`

---

## System Architecture

```
                    React Frontend (Vite)
                            |
                    HTTP / JSON / JWT
                            |
                       Express API
                            |
        +-------------------+-------------------+
        |                   |                   |
    Authentication      Folders              Files
        |                   |                   |
        v                   v                   v
    JWT Tokens         Hierarchies          Metadata
    Bcrypt Hashing     Permissions          Downloads
                       Sharing              Deletion
                            |
        +-------------------+-------------------+
        |                   |                   |
      Redis           PostgreSQL          Local Storage
     (Cache)        (Persistence)        (File Bytes)
```

### Data Layer Responsibilities

| Storage Medium | Purpose | Classification |
|----------------|---------|-----------------|
| PostgreSQL | User accounts, folder hierarchy, file metadata, share links | Authoritative data store |
| Redis | Cached folder metadata and access patterns | Performance optimization layer |
| Local Filesystem | Uploaded file binary content | Object storage |

---

## Implemented Features

### Backend Capabilities (Complete)

- User registration with bcrypt password hashing
- JWT-based authentication and login mechanism
- Protected API routes with token validation
- Hierarchical folder structure with nested folder support
- Folder creation, listing, and navigation operations
- Multipart file uploads via Multer middleware
- Secure file downloads using stream-based transmission
- File deletion with associated filesystem cleanup
- Public file-sharing links with expiration controls
- Download limits on shared resources
- Full-text search across files and folder hierarchies
- Redis-backed caching with time-to-live (TTL) configuration
- User-isolated data access (no cross-user visibility)
- Graceful Redis failure handling with PostgreSQL fallback

### Frontend Capabilities (In Development)

- Authentication user interface for login and registration
- Authentication state management
- Drive dashboard and navigation interface
- Folder hierarchy visualization
- File listing with type indicators
- Drag-and-drop file upload functionality
- File download capability
- File deletion with confirmation dialogs
- Full-text search interface
- Share link generation and management
- Loading state indicators and error handling

---

## Directory Structure

```
cloud-storage-platform/
├── server/                           # Backend API server
│   ├── prisma/
│   │   └── schema.prisma             # Database schema
│   ├── src/
│   │   ├── app.js                    # Express entry point
│   │   ├── config/                   # Configuration
│   │   │   ├── database.js
│   │   │   ├── multer.js
│   │   │   └── redis.js
│   │   ├── controllers/              # Request handlers
│   │   ├── middleware/               # Express middleware
│   │   ├── routes/                   # API routes
│   │   ├── services/                 # Business logic
│   │   └── utils/                    # Utilities
│   └── package.json
│
├── client/                           # Frontend React application
│   ├── src/
│   │   ├── main.jsx                  # Entry point
│   │   ├── App.jsx                   # Root component
│   │   ├── api/                      # API client
│   │   ├── components/               # React components
│   │   ├── pages/                    # Page components
│   │   ├── routes/                   # Router config
│   │   └── context/                  # State management
│   └── package.json
│
└── README.md                         # This file
```

---

## Technology Stack

### Backend Technologies

| Component | Technology |
|-----------|-----------|
| Runtime Environment | Node.js |
| Web Framework | Express 5.x |
| Database System | PostgreSQL 14+ |
| Object-Relational Mapper | Prisma |
| Authentication Protocol | JWT |
| Password Hashing | bcrypt |
| File Upload Processing | Multer |
| Caching Layer | Redis |
| Development Server | Nodemon |

### Frontend Technologies

| Component | Technology |
|-----------|-----------|
| UI Framework | React 18 |
| Build Tool | Vite |
| Router | React Router 7 |
| HTTP Client | Axios |
| Icon Library | Lucide React |
| Styling | CSS Modules / Tailwind CSS |

---

## Development Roadmap

### Phase 1: Backend Foundation ✓ Complete

- PostgreSQL integration with Prisma ORM
- User registration and authentication
- JWT token middleware
- Hierarchical folder structure
- Local file storage system
- File metadata persistence
- Upload, download, deletion operations
- Public file-sharing functionality
- Full-text search implementation
- Redis caching with TTL

### Phase 2: Frontend User Interface 🚧 In Progress

- Authentication interface
- Authentication state management
- Drive dashboard
- Folder navigation
- File listing
- Drag-and-drop upload
- File download and deletion
- Search functionality
- Share link generation
- Error handling and loading states

### Phase 3: Production Enhancement 📋 Planned

- Enhanced error messaging
- API response validation
- Storage provider abstraction (S3/MinIO)
- File type and size validation
- Cache invalidation optimization
- Database query optimization
- Input validation schemas
- API rate limiting
- Structured logging

### Phase 4: Advanced Capabilities 🌟 Future

- File versioning
- Trash/recycle bin
- Advanced share link management
- Background job processing
- Docker containerization
- CI/CD pipeline
- Unit and integration tests
- End-to-end testing

---

## API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Folder Management
```
POST   /api/folders
GET    /api/folders
GET    /api/folders/:folder_id
```

### File Management
```
POST   /api/files/upload
GET    /api/files
GET    /api/files/:file_id/download
DELETE /api/files/:file_id
```

### Search
```
GET /api/search?q=<query>
```

### File Sharing
```
POST /api/files/:file_id/share
GET  /api/share/:token
```

### Health Check
```
GET /api/health
```

See [server/README.md](./server/README.md) for detailed API documentation.

---

## Security Implementation

### Authentication and Authorization

- Passwords stored as bcrypt hashes only
- All protected endpoints require valid JWT
- File/folder access controlled by user ownership
- Enumeration attacks prevented through scope-based access

### File Sharing Security

- Public share links use cryptographically secure random tokens (UUID v4)
- Only SHA-256 hashes stored in database
- Share links support expiration date enforcement
- Configurable download count limits

### Data Processing

- Large file downloads use stream-based transmission (no buffering)
- File uploads validated at middleware level
- File deletion removes metadata and binary content
- User namespaces isolated (no cross-user access)

### System Resilience

- Graceful degradation when Redis unavailable
- PostgreSQL serves as authoritative data source
- Full functionality maintained if caching layer fails

---

## Caching Mechanism

Redis implements intelligent caching:

```
Folder Metadata Request
    |
    v
Check Redis Cache
   /        \
Cache Hit   Cache Miss
   |          |
   v          v
Return    Query PostgreSQL
          |
          v
        Update Redis (60s TTL)
          |
          v
        Return Result
```

**Invalidation Strategy:**
- Folder mutations clear affected cache entries
- File operations cascade-invalidate parent folder caches
- Automatic expiration after 60 seconds

---

## Development Environment Setup

### Backend Environment Variables

Create `.env` in `server/` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/cloud_storage"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key-here"
PORT=5000
NODE_ENV=development
```

### Frontend Environment Variables

Create `.env` in `client/` directory:

```env
VITE_API_BASE_URL="http://localhost:5000/api"
```

### Starting Development Services

**Backend (Terminal 1):**
```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd client
npm install
npm run dev
```

Access frontend: `http://localhost:5173`

### Database Schema Updates

After modifying `prisma/schema.prisma`:

```bash
cd server
npx prisma migrate dev --name <migration_name>
npx prisma generate
```

### Redis Verification

```bash
redis-cli ping
```

Expected: `PONG`

Note: Application continues if Redis unavailable (PostgreSQL fallback).

---

## Testing and Quality Assurance

### Backend

```bash
cd server
npm run dev
npm run lint
```

### Frontend

```bash
cd client
npm run dev
npm run build
npm run lint
npm run preview
```

---

## Contributing Guidelines

### Development Workflow

1. Clone repository
2. Set up local development environment
3. Create feature branch: `git checkout -b feature/description`
4. Implement changes
5. Test locally
6. Commit with conventional messages
7. Submit pull request

### Code Quality Standards

- Backend: ESLint configuration
- Frontend: ESLint with React best practices
- Naming: camelCase for variables, PascalCase for components
- Comments: only for complex logic

### Commit Message Format

```
feat: add file versioning
fix: resolve Redis connection timeout
docs: update API documentation
refactor: simplify folder service
test: add authentication tests
```

---

## Deployment

### Backend Deployment Options

- Heroku (hobby dyno+)
- Railway
- Render
- Fly.io
- AWS EC2 / Elastic Beanstalk
- DigitalOcean App Platform

**Requirements:**
- Node.js runtime
- PostgreSQL database
- Redis (optional)
- File storage (local or S3)

### Frontend Deployment Options

- Vercel (recommended for Vite)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Static hosting services

**Build:**
```bash
cd client
npm run build
# Output: dist/
```

---

## Architectural Principles

1. PostgreSQL is the authoritative data source
2. Redis functions as performance optimization layer
3. File binary content and metadata stored separately
4. Service layer contains business logic; controllers thin
5. Authentication and authorization are distinct concerns
6. User-isolated access control on all queries
7. Large files use stream-based transmission
8. External dependencies degrade gracefully
9. Features validated through API before frontend integration

---

## License

ISC

---

## Project Information

**Author**: Nishant (fanstar900)

**Repository**: fanstar900/Cloud-Storage-Platform

**Related Documentation**:
- [Server README](./server/README.md)
- [Client README](./client/README.md)

For questions or issues, refer to repository issue tracker.
