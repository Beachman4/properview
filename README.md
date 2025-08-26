# 🏡 Properview

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red.svg)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.14-green.svg)](https://www.prisma.io/)

## 🚀 Quick Start

### Prerequisites

- **Docker** - For PostgreSQL database
- **Node.js** (v18+) - JavaScript runtime
- **pnpm** - Fast, disk space efficient package manager
- Mapbox api keys(public & secret token)

### Installation

1. **Clone and setup the project:**
   ```bash
   git clone https://github.com/Beachman4/properview.git
   cd properview
   pnpm run setup
   ```

2. **Start development servers:**
   ```bash
   pnpm dev
   ```

3. **Access the applications:**
   - 🌐 **Frontend**: http://localhost:3000
   - 🚀 **API**: http://localhost:4500
   - 📊 **Database**: PostgreSQL on port 5432

## 🏗️ Architecture

```
properview/
├── apps/
│   ├── api/          # NestJS backend service
│   └── frontend/     # Next.js web application
├── packages/
│   ├── api-contract/ # Shared API contracts & types
│   └── eslint-config/# Shared linting configuration
```

### Tech Stack

**Backend (NestJS)**
- **Framework**: NestJS with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Argon2 hashing
- **Validation**: Zod schemas
- **Maps**: Mapbox SDK integration

**Frontend (Next.js)**
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: React Query (TanStack)
- **Forms**: React Hook Form with Zod validation
- **Maps**: Mapbox GL JS

## 📝 Available Scripts

### Root Level
```bash
pnpm setup          # Initial project setup
pnpm dev             # Start all development servers
pnpm lint            # Run linting across all packages
pnpm format          # Format code across all packages
```

### API Specific
```bash
pnpm -F api dev              # Start API development server
pnpm -F api prisma:migrate   # Run database migrations
pnpm -F api prisma:seed      # Seed database with sample data
pnpm -F api test             # Run API tests
```

### Frontend Specific
```bash
pnpm -F frontend dev    # Start frontend development server
pnpm -F frontend build  # Build for production
pnpm -F frontend start  # Start production server
```

## 🔧 Development

### Environment Setup

Create `.env` files in both `apps/api/` and `apps/frontend/` based on the provided `.env.example` files.

### Database Management

```bash
# Reset database
pnpm -F api prisma:migrate:reset

# Generate Prisma client
pnpm -F api prisma:generate
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# API unit tests
pnpm -F api test

# API e2e tests  
pnpm -F api test:e2e

# Test coverage
pnpm -F api test:cov
```
