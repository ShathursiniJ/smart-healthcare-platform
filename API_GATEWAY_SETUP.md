# API Gateway Setup Guide

## Overview

The API Gateway is a central routing layer for the Smart Healthcare Platform that:

1. **Provides a single entry point** for all client applications
2. **Routes requests** to appropriate microservices
3. **Handles authentication** with JWT token validation
4. **Enforces rate limiting** to prevent abuse
5. **Tracks requests** with correlation IDs
6. **Manages errors** consistently across all services
7. **Enables centralized monitoring** and logging

## Architecture

```
┌─────────────────────────────────────────┐
│           Client Applications           │
│  Web  │  Mobile  │  Desktop  │  IoT    │
└──────────────┬──────────────────────────┘
               │
        ┌──────▼────────┐
        │  API GATEWAY  │  (Port 3000)
        │ - Auth Check  │
        │ - Rate Limit  │
        │ - Request Log │
        │ - Error Handle
        └────┬──────────────────────────┬──────────┐
             │                          │          │
         Auth     Patient   Doctor   Appointment
         5001     5002      5005      5004
             │                          │
         Consultation  Payment  Notification
         5003           5006     5007
```

## Installation Steps

### 1. Build API Gateway Docker Image

```bash
cd services/api-gateway

# Install dependencies
npm install

# Build Docker image (if using Docker Compose)
# This is done automatically with docker-compose
```

### 2. Configure Environment Variables

Update `.env` file in `services/api-gateway/`:

```env
PORT=3000
NODE_ENV=development

# Service URLs (for Docker Compose - localhost)
AUTH_SERVICE_URL=http://localhost:5001
PATIENT_SERVICE_URL=http://localhost:5002
CONSULTATION_SERVICE_URL=http://localhost:5003
APPOINTMENT_SERVICE_URL=http://localhost:5004
DOCTOR_SERVICE_URL=http://localhost:5005
PAYMENT_SERVICE_URL=http://localhost:5006
NOTIFICATION_SERVICE_URL=http://localhost:5007

# For Kubernetes, update to:
# AUTH_SERVICE_URL=http://auth-service.healthcare-platform.svc.cluster.local:5001
# PATIENT_SERVICE_URL=http://patient-service.healthcare-platform.svc.cluster.local:5002
# etc.

JWT_SECRET=f8943733a009e790032476b47e8c0c07140edacf682e27aef88eb754cdcc0257
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=*
```

### 3. Start with Docker Compose

#### Option A: Full Stack (Recommended for Development)

```bash
cd smart-healthcare-platform

# Build all services
docker-compose build

# Start all services including API Gateway
docker-compose up -d

# Verify API Gateway is running
curl http://localhost:3000/health
```

#### Option B: Just API Gateway (If services already running)

```bash
cd services/api-gateway

# Start API Gateway
docker-compose -f docker-compose.yml up -d api-gateway
```

### 4. Verify Installation

```bash
# Check API Gateway health
curl http://localhost:3000/health

# Expected response:
# {
#   "success": true,
#   "message": "API Gateway is healthy",
#   "timestamp": "2026-04-16T10:00:00.000Z"
# }

# List available services
curl http://localhost:3000/api/gateway/services

# List all routes
curl http://localhost:3000/api/gateway/routes
```

## Docker Compose Usage

### Start Services

```bash
# Start all services (MongoDB + 8 microservices + API Gateway + Frontend)
docker-compose up -d

# Start only specific services
docker-compose up -d api-gateway auth-service

# View logs
docker-compose logs -f api-gateway

# Stop all services
docker-compose down

# Remove all volumes (reset database)
docker-compose down -v
```

### Environment Configuration for Docker Compose

The `docker-compose.yml` includes API Gateway with these settings:

```yaml
api-gateway:
  build: ./services/api-gateway
  ports:
    - "3000:3000"
  environment:
    AUTH_SERVICE_URL: http://auth-service:5001      # Service name (Docker DNS)
    PATIENT_SERVICE_URL: http://patient-service:5002
    DOCTOR_SERVICE_URL: http://doctor-service:5005
    # ... other services
  depends_on:
    - auth-service
    - patient-service
    # ... all other services
```

## Kubernetes Deployment

### 1. Deploy API Gateway

```bash
# Deploy API Gateway with ConfigMap, Deployment, and Services
kubectl apply -f k8s/04-api-gateway.yaml

# Verify deployment
kubectl get pods -n healthcare-platform -l app=api-gateway
```

### 2. Check Service Status

```bash
# Get API Gateway service details
kubectl get svc -n healthcare-platform -l app=api-gateway

# Port forward to access locally
kubectl port-forward -n healthcare-platform svc/api-gateway 3000:3000

# Test API Gateway
curl http://localhost:3000/health
```

### 3. Configure Service URLs on Kubernetes

The `k8s/04-api-gateway.yaml` already includes Kubernetes DNS URLs:

```yaml
AUTH_SERVICE_URL: http://auth-service.healthcare-platform.svc.cluster.local:5001
PATIENT_SERVICE_URL: http://patient-service.healthcare-platform.svc.cluster.local:5002
# etc.
```

No changes needed if you follow the provided manifests.

### 4. Update Frontend API URL

For Kubernetes, ensure frontend points to API Gateway:

```yaml
# In k8s/03-frontend-ingress.yaml
env:
- name: VITE_APP_API_URL
  value: "http://api-gateway.healthcare-platform.svc.cluster.local:3000"
```

Or if accessible via LoadBalancer:

```yaml
env:
- name: VITE_APP_API_URL
  value: "http://api-gateway-external:80"  # LoadBalancer service
```

### 5. Scale API Gateway

```bash
# Manual scaling
kubectl scale deployment api-gateway -n healthcare-platform --replicas=3

# Automatic scaling (HPA configured in manifest)
# Auto-scales between 2-5 replicas based on CPU/Memory
```

## Using the API Gateway

### 1. Authentication Flow

```
1. Client calls: POST /api/auth/login
                 { email, password }
                 ↓
2. Gateway routes to Auth Service
                 ↓
3. Auth Service validates, returns JWT
                 ↓
4. Client receives token and stores it

5. Client calls: GET /api/patients
                 Header: Authorization: Bearer <token>
                 ↓
6. Gateway verifies token is valid
                 ↓
7. Gateway routes to Patient Service
                 ↓
8. Patient Service returns data
```

### 2. Example API Calls

#### Login (Without Authentication)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": { ... }
# }
```

#### Get Patients (With Authentication)

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/api/patients \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json"

# Response:
# {
#   "success": true,
#   "patients": [ ... ]
# }
```

#### Register Doctor (Public Endpoint)

```bash
curl -X POST http://localhost:3000/api/doctors/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Smith",
    "email": "smith@hospital.com",
    "phone": "1234567890",
    "specialization": "Cardiology",
    "credentials": "MD"
  }'
```

### 3. JavaScript/Fetch Examples

```javascript
// Create API client
const API_BASE_URL = 'http://localhost:3000';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      this.token = data.token;
      localStorage.setItem('token', data.token);
    }
    return data;
  }

  async request(method, endpoint, body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return await response.json();
  }

  async getPatients() {
    return this.request('GET', '/api/patients');
  }

  async getAppointments() {
    return this.request('GET', '/api/appointments');
  }

  async createAppointment(data) {
    return this.request('POST', '/api/appointments', data);
  }
}

// Usage
const api = new APIClient();

// Login
await api.login('user@example.com', 'password');

// Get patients
const patients = await api.getPatients();
console.log(patients);

// Create appointment
const appointment = await api.createAppointment({
  patientId: '123',
  doctorId: '456',
  dateTime: '2026-04-20T10:00:00'
});
```

## Monitoring and Debugging

### 1. Check Gateway Logs

#### Docker Compose
```bash
docker-compose logs -f api-gateway
```

#### Kubernetes
```bash
# View logs
kubectl logs -f deployment/api-gateway -n healthcare-platform

# View logs with timestamps
kubectl logs -f deployment/api-gateway -n healthcare-platform --timestamps=true

# View logs for specific pod
kubectl logs -f pod/api-gateway-xxxxx -n healthcare-platform
```

### 2. Health Check Endpoints

```bash
# Gateway health
curl http://localhost:3000/health

# Gateway info
curl http://localhost:3000/api/gateway/info

# All services info
curl http://localhost:3000/api/gateway/services

# All routes info
curl http://localhost:3000/api/gateway/routes
```

### 3. Test Service Connectivity

```bash
# Test auth service through gateway
curl http://localhost:3000/api/auth/health

# Test patient service (requires auth)
TOKEN="your-token-here"
curl -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:3000/api/patients

# Test rate limiting
for i in {1..101}; do
  curl http://localhost:3000/api/health
done
# Should get 429 (Too Many Requests) after 100 requests
```

### 4. Monitor Rate Limiting

```bash
# Check rate limit headers
curl -i http://localhost:3000/api/health

# Look for headers like:
# RateLimit-Limit: 100
# RateLimit-Remaining: 99
# RateLimit-Reset: 1634567890
```

### 5. Correlation ID Tracking

All requests get a unique correlation ID for debugging:

```bash
# In logs, you'll see:
# [REQUEST] 1234567890-0.5: GET /api/patients
# [RESPONSE] 1234567890-0.5: 200 - 45ms

# To trace specific request, send custom correlation ID:
curl -H "X-Correlation-ID: my-custom-id" \
  http://localhost:3000/api/health

# Response will include:
# X-Correlation-ID: my-custom-id
```

## Configuration Reference

### Environment Variables

```env
# Server
PORT=3000                        # Port to listen on
NODE_ENV=development             # development | production

# JWT
JWT_SECRET=your-secret-key      # Must match all services

# Service URLs (update based on environment)
# Development (Docker Compose):
AUTH_SERVICE_URL=http://auth-service:5001

# Production (Kubernetes):
AUTH_SERVICE_URL=http://auth-service.healthcare-platform.svc.cluster.local:5001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000     # Time window (15 minutes)
RATE_LIMIT_MAX_REQUESTS=100     # Max requests per window

# CORS
CORS_ORIGIN=*                    # Front-end origin(s)

# Logging
LOG_LEVEL=info                   # debug | info | warn | error
```

### Rate Limit Configuration

```javascript
// In src/middleware/rateLimiter.js
authLimiter:    5 requests per 15 minutes  (prevent brute force)
apiLimiter:    50 requests per 15 minutes  (general API use)
generalLimiter: 100 requests per 15 minutes (all endpoints)
```

Customize in `.env`:
```env
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=100      # Max requests in window
```

## Troubleshooting

### Issue 1: API Gateway Won't Start

```
Error: connect ECONNREFUSED 127.0.0.1:5001
```

**Solution:**
1. Check if backend services are running: `docker-compose ps`
2. Verify service URLs in `.env` are correct
3. Check service names match: `auth-service` (Docker) vs `auth-service.healthcare-platform.svc.cluster.local` (K8s)

### Issue 2: "Service Unavailable" (503)

```json
{
  "success": false,
  "message": "Auth Service unavailable",
  "code": "SERVICE_UNAVAILABLE"
}
```

**Solutions:**
1. Check if service is running: `docker-compose logs auth-service`
2. Test service directly: `curl http://localhost:5001/api/auth/health`
3. For Kubernetes: `kubectl describe pod -n healthcare-platform [pod-name]`

### Issue 3: "Unauthorized" (401)

```json
{
  "success": false,
  "message": "No token provided",
  "code": "NO_TOKEN"
}
```

**Solutions:**
1. Include Authorization header: `Authorization: Bearer <token>`
2. Check token format is correct
3. Verify JWT_SECRET matches between gateway and auth service
4. Check token hasn't expired

### Issue 4: "Rate Limit Exceeded" (429)

```json
{
  "success": false,
  "message": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**Solutions:**
1. Wait for rate limit window to reset
2. Check `RateLimit-Reset` header for reset time (Unix timestamp)
3. Implement exponential backoff in your client
4. Adjust `RATE_LIMIT_MAX_REQUESTS` if needed

### Issue 5: CORS Errors

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**
1. Check `CORS_ORIGIN` environment variable
2. For development: `CORS_ORIGIN=*`
3. For production: `CORS_ORIGIN=https://yourdomain.com`
4. Ensure Content-Type header is included

## Performance Optimization

### 1. Docker Environment

- API Gateway runs in lightweight Node 18 Alpine (~150MB)
- Health checks configured for fast failover
- Automatic restart on failure

### 2. Kubernetes Environment

- 2 replicas by default for high availability
- Auto-scaling enabled (2-5 replicas)
- Readiness/Liveness probes for reliability
- Pod distribution across nodes

### 3. Request Timeout

```javascript
// Services configured with timeouts:
auth: 5 seconds
consultation: 30 seconds (AI processing)
others: 5-10 seconds
```

### 4. Connection Pooling

HTTP proxy automatically reuses connections for efficiency.

## Security Considerations

### 1. Production Deployment

```bash
# Use HTTPS in production
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
JWT_SECRET=<rotate-regularly>
```

### 2. Rate Limiting

Adjust limits based on your needs:

```env
# Strict (more protection, less throughput)
RATE_LIMIT_MAX_REQUESTS=50

# Moderate (balanced)
RATE_LIMIT_MAX_REQUESTS=100

# Relaxed (more throughput, less protection)
RATE_LIMIT_MAX_REQUESTS=200
```

### 3. CORS Policy

```env
# Development (allow all)
CORS_ORIGIN=*

# Production (specific domains)
CORS_ORIGIN=https://app.example.com,https://admin.example.com
```

## Integration with Frontend

### Update Frontend API URL

#### For Docker Compose (Development)

```javascript
// In frontend/src/services/apiClient.js
const API_BASE_URL = process.env.VITE_APP_API_URL || 'http://localhost:3000';

// In docker-compose.yml
environment:
  VITE_APP_API_URL: http://localhost:3000
```

#### For Kubernetes (Production)

```javascript
// Configure based on deployment method:
// LoadBalancer: http://api-gateway-external
// ClusterIP: http://api-gateway.healthcare-platform.svc.cluster.local:3000
// Ingress: http://healthcare.local/api
```

### Update API Client

```javascript
// Old (direct service calls)
const authApi = 'http://localhost:5001';
const patientApi = 'http://localhost:5002';
const doctorApi = 'http://localhost:5005';

// New (through API Gateway)
const api = 'http://localhost:3000';
```

## Next Steps

1. ✅ API Gateway created and deployed
2. ⏳ Add API documentation (Swagger/OpenAPI)
3. ⏳ Implement request validation middleware
4. ⏳ Add caching layer (Redis)
5. ⏳ Implement circuit breaker pattern
6. ⏳ Set up metrics collection (Prometheus)
7. ⏳ Create monitoring dashboard (Grafana)
8. ⏳ Implement request body logging
9. ⏳ Add API versioning support
10. ⏳ Setup distributed tracing (Jaeger)

## References

- [API Gateway Source Code](./services/api-gateway)
- [API Gateway README](./services/api-gateway/README.md)
- [Docker Compose Configuration](./docker-compose.yml)
- [Kubernetes Manifest](./k8s/04-api-gateway.yaml)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
