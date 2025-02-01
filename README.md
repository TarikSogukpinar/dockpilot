# DockPilot

A modern, secure, and scalable backend application built with NestJS for container management and authentication.

## Overview

DockPilot is a comprehensive container management platform that provides robust authentication, user management, and container orchestration capabilities. Built with NestJS, it offers a scalable and maintainable architecture for managing Docker containers with enterprise-grade security features.

## Features

- 🔐 Authentication System

  - Local authentication (email/password)
  - OAuth2 integration (GitHub, Google)
  - JWT-based authentication
  - Token refresh mechanism
  - Secure password hashing
  - Session management

- 👤 User Management

  - User profiles with customizable settings
  - Password management
  - Email updates
  - Role-based access control
  - User preferences (theme, language, timezone)

- 🐳 Container Management

  - Container operations and monitoring
  - Connection management
  - Container health checks
  - Resource usage tracking
  - Container logs management

- 🚀 Technical Features
  - Clustering support for better performance
  - Redis caching integration
  - Prisma ORM for database operations
  - Swagger API documentation
  - API versioning
  - Environment-based configuration
  - Global error handling
  - Request validation
  - Rate limiting
  - Logging system

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Redis
- Docker (for container management features)
- Git

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dockpilot.git
cd dockpilot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev
```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
API_PORT=3000
API_GLOBAL_PREFIX=api

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/dockpilot"

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# With clustering enabled
CLUSTERING=true npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
`http://localhost:{PORT}/docs`

The API documentation includes:

- Detailed endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate test coverage
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Project Structure

DockPilot follows a modular architecture pattern, with each module handling specific functionality:

### Core Modules

- **Auth Module** (`src/auth/`)

  - Handles user authentication and authorization
  - Implements local and OAuth2 strategies
  - Manages JWT token generation and validation
  - Handles user session management

- **User Module** (`src/user/`)

  - Manages user profiles and preferences
  - Handles user CRUD operations
  - Implements user settings management

- **Container Module** (`src/container/`)
  - Core container management functionality
  - Container lifecycle operations (create, start, stop, remove)
  - Container monitoring and health checks
  - Container configuration management

### Docker Management Modules

- **Image Module** (`src/image/`)

  - Docker image management
  - Image pulling and pushing
  - Image tagging and versioning
  - Image cleanup and maintenance

- **Volume Module** (`src/volume/`)

  - Docker volume operations
  - Volume creation and mounting
  - Volume backup and restore
  - Volume cleanup

- **Network Module** (`src/network/`)

  - Docker network management
  - Network creation and configuration
  - Container network connectivity
  - Network isolation and security

- **Compose Module** (`src/compose/`)
  - Docker Compose operations
  - Multi-container application deployment
  - Service orchestration
  - Environment management

### Infrastructure Modules

- **Connection Module** (`src/connection/`)

  - Docker daemon connection management
  - Remote Docker host connectivity
  - Connection pooling and health checks

- **Resource Module** (`src/resource/`)

  - Resource monitoring and metrics
  - Resource allocation management
  - Usage statistics and reporting

- **Backup Module** (`src/backup/`)
  - Container and volume backup strategies
  - Backup scheduling and automation
  - Restore operations
  - Backup retention policies

### Core Infrastructure

- **Core Module** (`src/core/`)

  - Global exception handling
  - Caching mechanisms
  - Common utilities and helpers
  - Shared interfaces and types

- **Database Module** (`src/database/`)

  - Database connection management
  - Prisma ORM configuration
  - Migration management
  - Database utilities

- **Utils Module** (`src/utils/`)
  - Shared utility functions
  - Helper classes
  - Common constants
  - Type definitions

Each module follows SOLID principles and maintains its own:

- Controllers for handling HTTP requests
- Services for business logic
- DTOs for data validation
- Interfaces for type definitions
- Unit and integration tests

## Module Dependencies

```
app.module
├── auth.module
├── user.module
├── container.module
│   ├── image.module
│   ├── volume.module
│   ├── network.module
│   └── compose.module
├── connection.module
├── resource.module
├── backup.module
└── core.module
    ├── cache.module
    └── database.module
```
