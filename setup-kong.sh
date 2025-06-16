#!/bin/bash

# Wait for Kong to be ready
echo "Waiting for Kong to be ready..."
sleep 30

# Create Services
echo "Creating services..."

# User Service
curl -i -X POST http://localhost:8001/services/ \
  --data "name=user-service" \
  --data "url=http://user-service:3001"

# Product Service
curl -i -X POST http://localhost:8001/services/ \
  --data "name=product-service" \
  --data "url=http://product-service:3002"

# Order Service
curl -i -X POST http://localhost:8001/services/ \
  --data "name=order-service" \
  --data "url=http://order-service:3003"

# Notification Service
curl -i -X POST http://localhost:8001/services/ \
  --data "name=notification-service" \
  --data "url=http://notification-service:3004"

# Create Routes
echo "Creating routes..."

# User Service Routes
curl -i -X POST http://localhost:8001/services/user-service/routes \
  --data "hosts[]=localhost" \
  --data "paths[]=/users" \
  --data "strip_path=true"

# Product Service Routes
curl -i -X POST http://localhost:8001/services/product-service/routes \
  --data "hosts[]=localhost" \
  --data "paths[]=/products" \
  --data "strip_path=true"

# Order Service Routes
curl -i -X POST http://localhost:8001/services/order-service/routes \
  --data "hosts[]=localhost" \
  --data "paths[]=/orders" \
  --data "strip_path=true"

# Notification Service Routes
curl -i -X POST http://localhost:8001/services/notification-service/routes \
  --data "hosts[]=localhost" \
  --data "paths[]=/notifications" \
  --data "strip_path=true"

# Add Rate Limiting Plugin
echo "Adding rate limiting..."
curl -i -X POST http://localhost:8001/services/user-service/plugins \
  --data "name=rate-limiting" \
  --data "config.minute=100" \
  --data "config.hour=1000"

curl -i -X POST http://localhost:8001/services/product-service/plugins \
  --data "name=rate-limiting" \
  --data "config.minute=200" \
  --data "config.hour=2000"

# Add CORS Plugin
echo "Adding CORS..."
curl -i -X POST http://localhost:8001/plugins \
  --data "name=cors" \
  --data "config.origins=*" \
  --data "config.methods=GET,POST,PUT,DELETE,OPTIONS" \
  --data "config.headers=Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Auth-Token,Authorization"

# Add Logging Plugin
echo "Adding request logging..."
curl -i -X POST http://localhost:8001/plugins \
  --data "name=file-log" \
  --data "config.path=/tmp/access.log"

echo "Kong configuration completed!"