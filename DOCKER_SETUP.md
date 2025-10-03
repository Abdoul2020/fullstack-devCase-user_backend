# Docker Setup Guide

This guide will help you set up and run the BackTask application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

## Quick Start

1. **Clone and navigate to the project directory**
   ```bash
   cd /path/to/backtask
   ```

2. **Create environment file**
   ```bash
   cp env.example .env
   ```
   Edit the `.env` file with your configuration values.

3. **Start the application with Docker Compose**
   ```bash
   npm run docker:up
   ```
   Or manually:
   ```bash
   docker-compose up -d
   ```

4. **Check if everything is running**
   ```bash
   docker-compose ps
   ```

5. **View logs**
   ```bash
   npm run docker:logs
   ```

## Available Scripts

- `npm run docker:build` - Build the Docker image
- `npm run docker:run` - Run the container manually
- `npm run docker:up` - Start all services with Docker Compose
- `npm run docker:down` - Stop all services
- `npm run docker:logs` - View logs from all services
- `npm run docker:clean` - Remove all containers, volumes, and images

## Services

The Docker Compose setup includes:

- **app**: Node.js application (port 3000 - from your .env)
- **postgres**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)

## Environment Variables

Your existing `.env` file is automatically loaded by Docker Compose. Key environment variables:

```env
# Application
NODE_ENV=production
APP_PORT=3000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=task_v1
DB_USERNAME=postgres
DB_PASSWORD=123

# JWT
JWT_SECRET=my-secrte-code-jwt
JWT_EXPIRES_IN=15d

# CORS (optional - defaults to localhost origins)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Redis (optional)
REDIS_PORT=6379
REDIS_PASSWORD=
```

**Important**: Your `.env` file is kept secret and is not included in the Docker build context.

## CORS Configuration

The application includes comprehensive CORS configuration that accepts all origins:

- **Development**: Accepts all origins automatically
- **Production**: 
  - If `ALLOWED_ORIGINS` is not set or empty → Accepts all origins
  - If `ALLOWED_ORIGINS` is set → Only accepts specified origins
- **Credentials**: Enabled for authentication
- **Methods**: GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers**: Content-Type, Authorization, X-Requested-With, Accept, Origin
- **No Origin**: Allows requests with no origin (mobile apps, curl, etc.)

## Health Checks

- Application health endpoint: `GET /api/v1/auth/health`
- Database health check included in Docker Compose
- Redis health check included in Docker Compose

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   # Kill the process or change the port in .env
   ```

2. **Database connection issues**
   ```bash
   # Check database logs
   docker-compose logs postgres
   # Restart database
   docker-compose restart postgres
   ```

3. **CORS issues**
   - Check `ALLOWED_ORIGINS` in your `.env` file
   - Ensure your frontend URL is included
   - Check browser console for CORS errors

### Useful Commands

```bash
# View all running containers
docker ps

# View logs for specific service
docker-compose logs app
docker-compose logs postgres
docker-compose logs redis

# Execute commands in running container
docker-compose exec app sh
docker-compose exec postgres psql -U postgres -d backtask_db

# Restart specific service
docker-compose restart app

# Rebuild and restart
docker-compose up --build -d
```

## Production Deployment

For production deployment:

1. Update environment variables in `.env`
2. Set strong passwords and JWT secrets
3. Configure proper CORS origins
4. Use Docker secrets for sensitive data
5. Set up reverse proxy (nginx) if needed
6. Configure SSL/TLS certificates

## Development vs Production

- **Development**: CORS allows all localhost origins
- **Production**: CORS restricted to specified origins
- **Health checks**: Enabled in both environments
- **Logging**: Configured for container environments
