# Kong API Gateway with Node.js Microservices

A complete microservices architecture setup using Kong API Gateway, PostgreSQL, and Node.js services containerized with Docker.

## Architecture Overview

This project demonstrates a microservices architecture with:

- **Kong API Gateway** - Routes and manages API traffic
- **PostgreSQL Database** - Kong's configuration database
- **4 Node.js Microservices**:
  - User Service (Port 3001)
  - Product Service (Port 3002)
  - Order Service (Port 3003)
  - Notification Service (Port 3004)

## Prerequisites

- Docker and Docker Compose installed
- Node.js (for local development)
- Git

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd kong-nodejs-example
```

### 2. Start the Services

**Option A: Automated Setup (Recommended)**

```bash
docker compose up --build
```

**Option B: Manual Setup (If you encounter database issues)**

```bash
# Stop any running containers
docker compose down

# Start only the database first
docker compose up kong-database -d

# Wait 10-15 seconds for database to initialize, then bootstrap Kong
docker compose run --rm kong kong migrations bootstrap

# Start all services
docker compose up --build
```

### 3. Verify Services

Check that all services are running:

```bash
docker compose ps
```

You should see all services as "running" or "healthy".

## Service Endpoints

Once running, the following endpoints will be available:

### Kong Gateway

- **Proxy**: http://localhost:8000 (Main API endpoint)
- **Admin API**: http://localhost:8001 (Configuration)
- **Admin GUI**: http://localhost:8002 (Web interface)

### Direct Microservice Access

- **User Service**: http://localhost:3001
- **Product Service**: http://localhost:3002
- **Order Service**: http://localhost:3003
- **Notification Service**: http://localhost:3004

## Configuring Kong Routes

After startup, you'll need to configure Kong to route requests to your microservices.

### Using Kong Admin API

1. **Create Services** (backend targets):

```bash
# User Service
curl -X POST http://localhost:8001/services \
  --data "name=user-service" \
  --data "url=http://user-service:3001"

# Product Service
curl -X POST http://localhost:8001/services \
  --data "name=product-service" \
  --data "url=http://product-service:3002"

# Order Service
curl -X POST http://localhost:8001/services \
  --data "name=order-service" \
  --data "url=http://order-service:3003"

# Notification Service
curl -X POST http://localhost:8001/services \
  --data "name=notification-service" \
  --data "url=http://notification-service:3004"
```

2. **Create Routes** (URL paths):

```bash
# User routes
curl -X POST http://localhost:8001/services/user-service/routes \
  --data "paths[]=/api/users"

# Product routes
curl -X POST http://localhost:8001/services/product-service/routes \
  --data "paths[]=/api/products"

# Order routes
curl -X POST http://localhost:8001/services/order-service/routes \
  --data "paths[]=/api/orders"

# Notification routes
curl -X POST http://localhost:8001/services/notification-service/routes \
  --data "paths[]=/api/notifications"
```

### Using Kong Admin GUI

1. Open http://localhost:8002 in your browser
2. Navigate to "Services" and add each microservice
3. Navigate to "Routes" and create routes for each service

## Testing the Setup

Once configured, test your API gateway:

```bash
# Test through Kong Gateway (port 8000)
curl http://localhost:8000/api/users
curl http://localhost:8000/api/products
curl http://localhost:8000/api/orders
curl http://localhost:8000/api/notifications

# Compare with direct service access
curl http://localhost:3001/api/users
curl http://localhost:3002/api/products
```

## Project Structure

```
kong-nodejs-example/
├── docker-compose.yml          # Container orchestration
├── services/
│   ├── user-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   ├── product-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   ├── order-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── server.js
│   └── notification-service/
│       ├── Dockerfile
│       ├── package.json
│       └── server.js
└── README.md
```

## Common Issues & Troubleshooting

### Kong Database Bootstrap Error

**Error**: `Database needs bootstrapping or is older than Kong 1.0`

**Solution**: Run the manual setup steps above, ensuring you bootstrap Kong's database before starting the gateway.

### Service Connection Issues

**Error**: Services not responding through Kong

**Solutions**:

1. Verify all containers are running: `docker compose ps`
2. Check container logs: `docker compose logs <service-name>`
3. Ensure Kong routes are properly configured
4. Verify internal network connectivity

### Port Conflicts

**Error**: `Port already in use`

**Solution**: Stop conflicting services or change ports in `docker-compose.yml`

## Development

### Adding New Services

1. Create service directory under `services/`
2. Add Dockerfile and application code
3. Update `docker-compose.yml` with new service
4. Rebuild: `docker compose up --build`
5. Configure Kong routes for the new service

### Environment Variables

Each service supports these environment variables:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Service port number

### Logs

View logs for specific services:

```bash
# All services
docker compose logs

# Specific service
docker compose logs kong
docker compose logs user-service

# Follow logs
docker compose logs -f
```

## Stopping the Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes (clears database)
docker compose down -v

# Stop and remove images
docker compose down --rmi all
```

## Advanced Configuration

### Kong Plugins

Add plugins for authentication, rate limiting, logging, etc.:

```bash
# Enable rate limiting
curl -X POST http://localhost:8001/services/user-service/plugins \
  --data "name=rate-limiting" \
  --data "config.minute=100"

# Enable API key authentication
curl -X POST http://localhost:8001/services/user-service/plugins \
  --data "name=key-auth"
```

### Database Persistence

Kong's configuration is stored in PostgreSQL and persists between restarts via Docker volumes. To reset:

```bash
docker compose down -v  # Removes volumes
docker compose up --build
# Re-run bootstrap and reconfigure routes
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `docker compose up --build`
5. Submit a pull request

**Need Help?**

- Kong Documentation: https://docs.konghq.com/
- Docker Compose Reference: https://docs.docker.com/compose/
- Node.js Best Practices: https://nodejs.org/en/docs/guides/
