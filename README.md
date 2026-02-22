# Movie Management Application

A full-stack movie management system built with **NestJS** (backend) and **Next.js** (frontend). Browse movies, discover actors, explore ratings, and manage content with JWT authentication.

## Tech Stack

- **Backend:** NestJS, TypeScript, TypeORM, PostgreSQL, Passport (JWT)
- **Frontend:** Next.js 14, TypeScript, TailwindCSS, TanStack React Query, Axios
- **Infrastructure:** Docker, Docker Compose, GitHub Actions CI/CD

## Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) and Docker Compose (for containerized setup)
- PostgreSQL 16 (if running without Docker)

## Quick Start (Docker)

The easiest way to run everything:

```bash
docker compose up
```

This starts:
- **PostgreSQL** on port 5432
- **Backend API** on http://localhost:3000
- **Frontend** on http://localhost:3001

The database is automatically seeded with sample data.

## Manual Setup

### Backend (movie-api)

```bash
cd movie-api

# Install dependencies
npm install

# Configure environment (or use defaults)
cp .env.example .env

# Start PostgreSQL (via Docker or local install)
# Ensure DB exists: movie_db

# Start development server
npm run start:dev
```

The API runs on http://localhost:3000.

### Frontend (movie-app)

```bash
cd movie-app

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Start development server
npm run dev
```

The frontend runs on http://localhost:3001.

## Default Credentials

```
Username: admin
Password: password123
```

## API Documentation

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Login and get JWT token |

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

Response: `{"access_token": "eyJ..."}`

### Movies

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/movies` | Public | List movies (supports `?search=`, `?page=`, `?limit=`) |
| `GET` | `/movies/:id` | Public | Get movie with actors and ratings |
| `GET` | `/movies/:id/actors` | Public | Get actors in a movie |
| `POST` | `/movies` | JWT | Create a movie |
| `PATCH` | `/movies/:id` | JWT | Update a movie |
| `DELETE` | `/movies/:id` | JWT | Delete a movie |

**Examples:**
```bash
# List all movies
curl http://localhost:3000/movies

# Search movies
curl "http://localhost:3000/movies?search=inception"

# Paginated list
curl "http://localhost:3000/movies?page=1&limit=5"

# Create movie (requires JWT)
curl -X POST http://localhost:3000/movies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "New Movie", "genre": "Action", "actorIds": [1, 2]}'
```

### Actors

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/actors` | Public | List actors (supports `?search=`, `?page=`, `?limit=`) |
| `GET` | `/actors/:id` | Public | Get actor with their movies |
| `GET` | `/actors/:id/movies` | Public | Get movies an actor has been in |
| `POST` | `/actors` | JWT | Create an actor |
| `PATCH` | `/actors/:id` | JWT | Update an actor |
| `DELETE` | `/actors/:id` | JWT | Delete an actor |

**Examples:**
```bash
# List all actors
curl http://localhost:3000/actors

# Search actors by name
curl "http://localhost:3000/actors?search=dicaprio"

# Get actor's filmography
curl http://localhost:3000/actors/1/movies
```

### Ratings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/ratings` | Public | List ratings (supports `?movieId=`, `?page=`, `?limit=`) |
| `GET` | `/ratings/:id` | Public | Get a rating |
| `POST` | `/ratings` | JWT | Create a rating |
| `PATCH` | `/ratings/:id` | JWT | Update a rating |
| `DELETE` | `/ratings/:id` | JWT | Delete a rating |

**Examples:**
```bash
# Get ratings for a movie
curl "http://localhost:3000/ratings?movieId=1"

# Add a rating (requires JWT)
curl -X POST http://localhost:3000/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"value": 8, "comment": "Great movie!", "movieId": 1}'
```

## Architecture Decisions

### Vertical Slices / Feature Folders
Both backend and frontend are organized by feature (movies, actors, ratings, auth) rather than by technical layer. Each feature contains its own controllers/services (backend) or components/hooks/api (frontend), making the codebase easy to navigate and maintain.

### TypeORM Code-First
Database schema is defined through TypeScript entities with decorators. TypeORM synchronizes the schema automatically in development, eliminating the need for manual migrations during development.

### TanStack React Query
Chosen over SWR for its superior pagination support (`keepPreviousData`), built-in devtools, and more granular cache control. Server state is managed entirely through React Query, keeping the client-side state minimal.

### Global JWT Guard with @Public() Decorator
Instead of manually decorating each protected endpoint, the `JwtAuthGuard` is registered globally via `APP_GUARD`. Public endpoints (all GET routes + auth routes) opt out using the `@Public()` decorator. This secure-by-default approach prevents accidentally exposing CUD endpoints.

### Axios Interceptors
The Axios instance automatically attaches the JWT token from localStorage on every request and handles 401 responses by redirecting to the login page. This centralizes auth logic rather than repeating it in every API call.

## Running Tests

### Backend
```bash
cd movie-api
npm test              # Run tests
npm run test:cov      # Run with coverage
```

### Frontend
```bash
cd movie-app
npm test              # Run tests
npm run test:cov      # Run with coverage
```

## Project Structure

```
movie/
├── .github/workflows/ci.yml    # CI/CD pipeline
├── docker-compose.yml           # Docker orchestration
├── movie-api/                   # NestJS backend
│   ├── src/
│   │   ├── auth/                # JWT authentication
│   │   ├── movies/              # Movie CRUD + search
│   │   ├── actors/              # Actor CRUD + search
│   │   ├── ratings/             # Rating CRUD
│   │   ├── users/               # User management
│   │   ├── database/seeds/      # Sample data seeding
│   │   └── common/              # Filters, guards, DTOs
│   └── Dockerfile
├── movie-app/                   # Next.js frontend
│   ├── src/
│   │   ├── app/                 # Route pages (thin)
│   │   ├── features/            # Feature slices
│   │   │   ├── auth/            # Login, auth context
│   │   │   ├── movies/          # Movie components + hooks
│   │   │   ├── actors/          # Actor components + hooks
│   │   │   └── ratings/         # Rating components
│   │   └── shared/              # UI components, utils
│   └── Dockerfile
└── README.md
```
