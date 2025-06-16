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
git clone https://github.com/emmayusufu/Kong-API-Gateway-with-Node.js-Microservices.git
cd Kong-API-Gateway-with-Node.js-Microservices
```

### 2. Make Setup Script Executable

```bash
chmod +x ./setup-kong.sh
```

### 3. Start the Services

**Option A: Automated Setup with Script (Recommended)**

```bash
# Start all services
docker compose up --build -d

# Wait for services to be ready, then configure Kong
./setup-kong.sh
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
docker compose up --build -d

# Configure Kong
./setup-kong.sh
```

### 4. Verify Services

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

## Kong Configuration

The project includes an automated setup script that configures all Kong services, routes, and plugins.

### Automated Configuration (Recommended)

The `setup-kong.sh` script automatically configures:

- **4 Microservices** as Kong services
- **Routes** for each service (`/users`, `/products`, `/orders`, `/notifications`)
- **Rate Limiting** (100/min for users, 200/min for products)
- **CORS** support for all origins
- **Request Logging** to `/tmp/access.log`

Simply run:

```bash
chmod +x ./setup-kong.sh
./setup-kong.sh
```

### Manual Configuration (Alternative)

If you prefer manual setup, use the Kong Admin API:

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
```

2. **Create Routes** (URL paths):

```bash
# User routes
curl -X POST http://localhost:8001/services/user-service/routes \
  --data "hosts[]=localhost" \
  --data "paths[]=/users" \
  --data "strip_path=true"
```

### Using Kong Admin GUI

1. Open http://localhost:8002 in your browser
2. Navigate to "Services" and add each microservice
3. Navigate to "Routes" and create routes for each service

## Testing the Setup

The project includes test requests you can use to verify your setup.

### Using the Test File

Open `client-examples/test-requests.http` in your HTTP client (VS Code REST Client, Postman, etc.) or run:

```bash
# Test through Kong Gateway (port 8000)
curl http://localhost:8000/users
curl http://localhost:8000/products
curl http://localhost:8000/orders
curl http://localhost:8000/notifications

# Compare with direct service access
curl http://localhost:3001
curl http://localhost:3002
curl http://localhost:3003
curl http://localhost:3004
```

### Expected Responses

With the setup script, Kong routes are configured as:

- `http://localhost:8000/users` → User Service
- `http://localhost:8000/products` → Product Service
- `http://localhost:8000/orders` → Order Service
- `http://localhost:8000/notifications` → Notification Service

### Rate Limiting Test

The setup includes rate limiting:

- User Service: 100 requests/minute
- Product Service: 200 requests/minute
- Other services: No rate limiting

Test by making multiple rapid requests to see the rate limiting in action.

## Project Structure

```
kong-nodejs-example/
├── client-examples/
│   └── test-requests.http       # HTTP test requests
├── docker-compose.yaml          # Container orchestration
├── README.md                    # This file
├── setup-kong.sh               # Kong configuration script
└── services/
    ├── user-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── package-lock.json
    │   └── server.js
    ├── product-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── server.js
    ├── order-service/
    │   ├── Dockerfile
    │   ├── package.json
    │   └── server.js
    └── notification-service/
        ├── Dockerfile
        ├── package.json
        └── server.js
```

## Common Issues & Troubleshooting

### Kong Database Bootstrap Error

**Error**: `Database needs bootstrapping or is older than Kong 1.0`

**Solution**: Run the manual setup steps above, ensuring you bootstrap Kong's database before starting the gateway.

### Kong Configuration Script Issues

**Error**: `Permission denied: ./setup-kong.sh`

**Solution**: Make the script executable:

```bash
chmod +x ./setup-kong.sh
```

**Error**: Kong services not ready when script runs

**Solution**: Increase wait time in script or run manually after confirming Kong is up:

```bash
# Check Kong is responding
curl http://localhost:8001/status

# Then run setup
./setup-kong.sh
```

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

## License

This project is licensed under the MIT License.

---

**Need Help?**

- Kong Documentation: https://docs.konghq.com/
- Docker Compose Reference: https://docs.docker.com/compose/
- Node.js Best Practices: https://nodejs.org/en/docs/guides/
