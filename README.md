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
# Node and API Configuration
NODE_ENV=development
CLUSTERING=false
API_PORT=5000
API_GLOBAL_PREFIX=api

# Database Configuration
DATABASE_URL="postgresql://admin:admin@localhost:5432/mydb"

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
GITHUB_EMAILS_URL=https://api.github.com/user/emails

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=3600
```

Each environment variable serves a specific purpose:

- `NODE_ENV`: Defines the environment (development/production)
- `CLUSTERING`: Enables/disables application clustering
- `API_PORT`: The port number for the API server
- `API_GLOBAL_PREFIX`: Global prefix for all API endpoints
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `JWT_EXPIRES_IN`: JWT token expiration time
- `JWT_REFRESH_SECRET`: Secret key for refresh token
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration time
- `GITHUB_*`: GitHub OAuth configuration
- `GOOGLE_*`: Google OAuth configuration
- `REDIS_*`: Redis cache configuration

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

## Share on LinkedIn

Here's a template for sharing DockPilot on LinkedIn:

```
🚀 Excited to announce DockPilot - An Open Source Container Management Platform! 

🔥 Key Features:
• Modern Docker container management with NestJS
• Enterprise-grade authentication system
• Multi-container orchestration
• Real-time monitoring and logging
• Scalable and production-ready architecture

🛠️ Tech Stack:
• NestJS
• TypeScript
• PostgreSQL
• Redis
• Docker
• OAuth2

🔐 Security Features:
• JWT Authentication
• OAuth2 Integration
• Role-based Access Control
• Rate Limiting
• Advanced Security Headers

🌟 Why DockPilot?
• Production-ready container management
• Enterprise-grade security
• Scalable architecture
• Comprehensive documentation
• Active community

🔗 GitHub Repository: [Your Repository Link]

#OpenSource #Docker #NestJS #DevOps #ContainerManagement #TypeScript #WebDevelopment #GitHub #Programming

Join us in making container management better! Star ⭐ the repository, contribute, or share your feedback.
```

### Tips for LinkedIn Announcement:
1. Add relevant screenshots or demo GIFs
2. Tag relevant technology communities
3. Use appropriate hashtags for visibility
4. Engage with comments and questions
5. Share updates on new features regularly
