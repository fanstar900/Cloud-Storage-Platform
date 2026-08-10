# Cloud Storage Platform

A full-stack cloud storage platform built with the **PERN stack (PostgreSQL, Express, React, Node.js)**. The backend currently provides JWT authentication, hierarchical folders, local file storage, file metadata, secure downloads/deletions, public share links, search, and Redis caching.

## Current Status

### Backend — Completed

- User registration with password hashing using bcrypt
- User login with JWT authentication
- Authentication middleware for protected routes
- User-isolated folder and file access
- Hierarchical folder structure
- Folder creation and nested folders
- Root and nested folder listing
- Multipart file uploads using Multer
- Local filesystem storage
- PostgreSQL file metadata using Prisma
- File listing
- Secure file downloads using Node.js streams
- File deletion with filesystem cleanup
- Public file-sharing links
- Cryptographically random share tokens
- SHA-256 token hashing before database storage
- Share-link expiration
- Maximum download limits
- Atomic download-limit updates to handle concurrent requests
- File and folder search
- Redis caching for folder metadata
- TTL-based cache expiration
- Explicit cache invalidation after folder creation
- Redis failure handling so PostgreSQL remains the source of truth

## Architecture

```text
                    React Frontend
                         |
                         | HTTP / JSON
                         v
                    Express API
                         |
        +----------------+----------------+
        |                |                |
      Auth            Folders           Files
        |                |                |
        +----------------+----------------+
                         |
                    Service Layer
                         |
          +--------------+--------------+
          |              |              |
        Redis        PostgreSQL      Local Storage
       (cache)        (metadata)      (file bytes)
```

### Data responsibilities

**PostgreSQL**
- Users
- Folders
- File metadata
- Share links

**Redis**
- Frequently accessed folder metadata
- Short-lived cache
- Performance layer only

**Local filesystem**
- Actual uploaded file contents

This separation keeps PostgreSQL as the source of truth while Redis is treated as an optional performance optimization.

## Project Structure

```text
cloud-storage/
├── server/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── uploads/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── multer.js
│   │   │   └── redis.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── file.controller.js
│   │   │   ├── folder.controller.js
│   │   │   └── share.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── file.routes.js
│   │   │   ├── folder.routes.js
│   │   │   └── share.routes.js
│   │   └── services/
│   │       ├── auth.service.js
│   │       ├── cache.service.js
│   │       ├── file.service.js
│   │       ├── folder.service.js
│   │       ├── search.service.js
│   │       ├── share.service.js
│   │       └── storage.service.js
│   └── package.json
│
└── client/                  # React frontend — upcoming
```

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Folders

```text
POST /api/folders
GET  /api/folders
GET  /api/folders/:folder_id
```

### Files

```text
POST   /api/files/upload
GET    /api/files
GET    /api/files/:file_id/download
DELETE /api/files/:file_id
```

### Search

```text
GET /api/search?q=<query>
```

### Sharing

```text
POST /api/files/:file_id/share
GET  /api/share/:token
```

### Health

```text
GET /api/health
```

## Security

The backend currently implements several important security properties:

- Passwords are stored as bcrypt hashes.
- Protected APIs require a valid JWT.
- File and folder queries are scoped by `ownerId`.
- Users cannot access another user's files by knowing their IDs.
- Public share links use cryptographically random tokens.
- Only SHA-256 hashes of share tokens are stored in PostgreSQL.
- Share links can expire.
- Share links can have download limits.
- File downloads are streamed instead of loading the entire file into memory.

## Caching

Folder metadata uses Redis with a 60-second TTL.

```text
GET /api/folders
       |
       v
     Redis
    /     \
  HIT     MISS
   |        |
   v        v
 Return  PostgreSQL
            |
            v
          Redis
            |
            v
          Return
```

Folder mutations invalidate the affected cache entry.

Redis is deliberately treated as a non-critical dependency:

```text
Redis available   -> cache + PostgreSQL
Redis unavailable -> PostgreSQL directly
```

## Local Development

### Backend

From the `server` directory:

```bash
npm install
npm run dev
```

### PostgreSQL

The backend expects a PostgreSQL database configured through:

```env
DATABASE_URL=...
```

### Redis

Redis runs locally by default:

```env
REDIS_URL=redis://localhost:6379
```

Verify Redis:

```bash
redis-cli ping
```

Expected:

```text
PONG
```

## Prisma

After changing the Prisma schema:

```bash
npx prisma migrate dev --name <migration_name>
npx prisma generate
```

## Current Development Roadmap

### Phase 1 — Backend Foundation

- [x] PostgreSQL + Prisma
- [x] Authentication
- [x] JWT middleware
- [x] Folder hierarchy
- [x] Local file storage
- [x] File metadata
- [x] Upload/download/delete
- [x] Public sharing
- [x] Search
- [x] Redis caching

### Phase 2 — Frontend

Build a React/Vite frontend with:

- [ ] Login/register
- [ ] Authentication state
- [ ] Drive dashboard
- [ ] Folder navigation
- [ ] File listing
- [ ] File upload
- [ ] File download
- [ ] File deletion
- [ ] Search UI
- [ ] Share-link generation
- [ ] Share-link display/copying
- [ ] Loading/error/empty states

Target UI:

```text
+------------------------------------------------------+
| CloudDrive       Search files...        Nishant      |
+------------+-----------------------------------------+
| My Drive   |  Folders                                |
| Shared     |  + College                              |
|            |  + Documents                            |
|            |  + Projects                             |
|            |                                         |
|            |  Files                                  |
|            |  resume.pdf                             |
|            |  project.zip                            |
+------------+-----------------------------------------+
```

### Phase 3 — Production-style improvements

After the core frontend works:

- [ ] Better error handling
- [ ] API/client abstraction
- [ ] Storage-provider abstraction
- [ ] File type/size validation
- [ ] Better cache invalidation
- [ ] Improved database indexes
- [ ] Request validation
- [ ] Rate limiting where appropriate
- [ ] Deployment

### Phase 4 — Optional high-value features

Only after the core application is complete:

- [ ] File versioning
- [ ] Trash/recycle bin
- [ ] Share-link management/revocation
- [ ] S3/MinIO storage provider
- [ ] Background jobs for large-file processing
- [ ] Docker deployment

## Design Principles

The project intentionally follows these principles:

1. **PostgreSQL is the source of truth.**
2. **Redis is a performance layer, not persistent storage.**
3. **File bytes and file metadata are stored separately.**
4. **Services contain business logic; routes remain thin.**
5. **Authentication and authorization are separate concerns.**
6. **Every file/folder operation is scoped to its owner.**
7. **Large downloads use streaming instead of buffering entire files.**
8. **External dependencies should fail gracefully when possible.**
9. **Features are implemented incrementally and tested through the API before frontend integration.**

## Planned CV Positioning

The final project can be presented as a cloud-storage platform rather than a basic CRUD application.

Potential CV themes:

- Full-stack storage platform using PERN
- JWT-based authentication and authorization
- Hierarchical folder/file management
- Streaming file uploads/downloads
- Redis caching with TTL and cache invalidation
- Secure tokenized public file sharing
- Expiration and download limits
- PostgreSQL metadata persistence
- Separation of metadata and file storage
- Fault-tolerant cache integration

## Next Immediate Goal

The backend is now sufficiently complete for the one-week project scope.

**Next: build the React frontend and turn the APIs into a usable cloud-drive interface.**
