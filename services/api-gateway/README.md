# API Gateway - Smart Healthcare Platform

## Overview

The API Gateway is the unified entry point for all Smart Healthcare Platform microservices. It provides:

- **Unified API Endpoint** - Single entry point for all services
- **Request Routing** - Intelligently routes requests to appropriate microservices
- **Authentication** - JWT token verification for protected routes
- **Rate Limiting** - Prevents abuse and ensures fair usage
- **Correlation ID Tracking** - Tracks requests across services for debugging
- **Error Handling** - Consistent error responses across all services
- **Service Discovery** - Routes requests to correct microservice URLs

## Architecture

```
┌─────────────────┐
│   Client Apps   │
├────────┬────────┤
│  Web   │ Mobile │
└────────┬────────┘
         │
    ┌────▼─────┐
    │ API GATEWAY (Port 3000)
    │ - Auth
    │ - Rate Limit
    │ - Route Requests
    │ - Handle Errors
    └────┬──────────────────────────┬──────────┐
         │                          │          │
    ┌────▼────┐  ┌────────┐  ┌─────▼─┐   ┌───▼────┐
    │   Auth   │  │Patient │  │Doctor │   │Appt    │
    │  5001    │  │ 5002   │  │ 5005  │   │ 5004   │
    └──────────┘  └────────┘  └───────┘   └────────┘
    
    ┌──────────┐  ┌──────────┐  ┌────────┐
    │Consult   │  │ Payment  │  │Notifs  │
    │  5003    │  │  5006    │  │  5007  │
    └──────────┘  └──────────┘  └────────┘
```

## Features

### 1. **Request Routing**

All requests come through the gateway and are routed to the appropriate microservice:

```
GET /api/patients/123      →  Patient Service
POST /api/auth/login       →  Auth Service
GET /api/doctors           →  Doctor Service
POST /api/appointments     →  Appointment Service
```

### 2. **Authentication & Authorization**

- Protected routes require JWT token in `Authorization` header
- Token format: `Authorization: Bearer <jwt-token>`
- For protected endpoints, the gateway verifies the token before routing

```javascript
// Protected endpoints
GET /api/patients          // Requires auth
POST /api/appointments     // Requires auth
GET /api/consultations     // Requires auth

// Public endpoints
POST /api/auth/login       // No auth required
GET /api/doctors           // No auth required
POST /api/payments/notify  // Webhook endpoint
```

### 3. **Rate Limiting**

Prevents abuse by limiting requests:

- **General Rate Limit**: 100 requests per 15 minutes
- **Auth Rate Limit**: 5 requests per 15 minutes (brute-force protection)
- **API Rate Limit**: 50 requests per 15 minutes

```
Too many requests response (HTTP 429):
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 1234567890
}
```

### 4. **Correlation ID Tracking**

Unique ID for each request across all services:

```
Request Header: X-Correlation-ID: 1234567890-0.5
Response Header: X-Correlation-ID: 1234567890-0.5
Logs: [1234567890-0.5] Request logged with ID
```

### 5. **Error Handling**

Consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "correlationId": "request-id"
}
```

## Installation

### 1. Install Dependencies

```bash
cd services/api-gateway
npm install
```

### 2. Configure Environment Variables

Create `.env` file (or use provided template):

```env
PORT=3000
NODE_ENV=development

# Service URLs
AUTH_SERVICE_URL=http://localhost:5001
PATIENT_SERVICE_URL=http://localhost:5002
CONSULTATION_SERVICE_URL=http://localhost:5003
APPOINTMENT_SERVICE_URL=http://localhost:5004
DOCTOR_SERVICE_URL=http://localhost:5005
PAYMENT_SERVICE_URL=http://localhost:5006
NOTIFICATION_SERVICE_URL=http://localhost:5007

# JWT Configuration
JWT_SECRET=your-secret-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=*

# Logging
LOG_LEVEL=info
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Start Production Server

```bash
npm start
```

## API Endpoints

### Gateway Info

```bash
# Health Check
GET /health
Response: { success: true, message: "API Gateway is healthy" }

# Gateway Info
GET /api/gateway/info
Response: { success: true, name: "...", version: "1.0.0" }

# List Services
GET /api/gateway/services
Response: { success: true, services: [...] }

# List Routes
GET /api/gateway/routes
Response: { success: true, routes: [...] }
```

### Authentication Routes

```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password",
  "name": "User Name",
  "role": "patient"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Refresh Token
POST /api/auth/refresh
Headers: { "Authorization": "Bearer <token>" }
```

### Protected Routes (Require JWT)

```bash
# Get Patients
GET /api/patients
Headers: { "Authorization": "Bearer <jwt-token>" }

# Get Appointments
GET /api/appointments
Headers: { "Authorization": "Bearer <jwt-token>" }

# Get Consultations
GET /api/consultations
Headers: { "Authorization": "Bearer <jwt-token>" }
```

### Public Routes

```bash
# List Doctors
GET /api/doctors

# Doctor Registration
POST /api/doctors/register

# List Appointments (anyone)
GET /api/appointments/available
```

## Middleware

### Auth Middleware

Verifies JWT tokens for protected routes.

```javascript
// Required authentication
app.use('/api/patients', verifyToken, proxy);

// Optional authentication
app.use('/api/doctors', verifyTokenOptional, proxy);

// Role-based access
app.use('/api/admin', verifyRole(['admin']), proxy);
```

### Rate Limiter Middleware

Controls request frequency per IP/user.

```javascript
// Authentication endpoints (strict)
app.use('/api/auth/login', authLimiter);

// General API endpoints
app.use(generalLimiter);

// Per-user limits (if authenticated)
app.use(perUserLimiter);
```

### Error Handler Middleware

Catches and formats errors consistently.

```javascript
// All errors are caught and returned as JSON
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "correlationId": "request-id"
}
```

## Docker Deployment

### Build Image

```bash
docker build -t api-gateway:latest .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e AUTH_SERVICE_URL=http://auth-service:5001 \
  -e PATIENT_SERVICE_URL=http://patient-service:5002 \
  -e JWT_SECRET=your-secret \
  api-gateway:latest
```

### Health Check

```bash
curl http://localhost:3000/health
```

## Kubernetes Deployment

### Apply Manifest

```bash
kubectl apply -f k8s/api-gateway-deployment.yaml
```

### Access Service

```bash
# Port forward (development)
kubectl port-forward svc/api-gateway 3000:3000

# LoadBalancer (production)
kubectl get svc api-gateway
```

## Configuration Options

### Service URLs

Configure where each microservice is located:

```env
AUTH_SERVICE_URL=http://auth-service:5001
PATIENT_SERVICE_URL=http://patient-service:5002
DOCTOR_SERVICE_URL=http://doctor-service:5005
APPOINTMENT_SERVICE_URL=http://appointment-service:5004
CONSULTATION_SERVICE_URL=http://consultation-service:5003
PAYMENT_SERVICE_URL=http://payment-service:5006
NOTIFICATION_SERVICE_URL=http://notification-service:5007
```

### Rate Limiting

Customize rate limits:

```env
# Time window in milliseconds
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes

# Max requests per window
RATE_LIMIT_MAX_REQUESTS=100
```

### JWT Configuration

```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1d
```

### CORS Configuration

```env
# Allow specific origin
CORS_ORIGIN=https://example.com

# Allow multiple origins
CORS_ORIGIN=https://example.com,https://app.example.com

# Allow all (development)
CORS_ORIGIN=*
```

## Monitoring & Debugging

### Enable Detailed Logging

```env
LOG_LEVEL=debug
NODE_ENV=development
```

### View Logs

```bash
# Docker Compose
docker-compose logs api-gateway -f

# Kubernetes
kubectl logs -f deployment/api-gateway
```

### Check Service Health

```bash
# Gateway health
curl http://localhost:3000/health

# All services health
curl http://localhost:3000/api/gateway/services

# Specific service
curl http://localhost:3000/api/auth/health
```

## Troubleshooting

### Service Unavailable (503)

```
Response: {
  "success": false,
  "message": "Service unavailable",
  "code": "SERVICE_UNAVAILABLE"
}
```

**Solution:**
1. Check if backend service is running
2. Verify service URL in `.env`
3. Check logs: `docker-compose logs [service]`

### Unauthorized (401)

```
Response: {
  "success": false,
  "message": "Invalid or expired token",
  "code": "INVALID_TOKEN"
}
```

**Solution:**
1. Ensure token is included in `Authorization` header
2. Token format should be `Bearer <jwt-token>`
3. Check token expiration
4. Re-login to get new token

### Rate Limit Exceeded (429)

```
Response: {
  "success": false,
  "message": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**Solution:**
1. Wait for the rate limit window to reset
2. Check `X-RateLimit-Reset` header for reset time
3. Implement exponential backoff in client

### CORS Error

```
Error: Cross-Origin Request Blocked
```

**Solution:**
1. Check `CORS_ORIGIN` environment variable
2. Ensure client origin matches
3. Include proper headers in request
4. For development, use `CORS_ORIGIN=*`

## Performance Optimization

### 1. Connection Pooling

The proxy middleware automatically reuses connections.

### 2. Request Timeout

Services have configurable timeouts:

```javascript
{
  auth: { timeout: 5000 },      // 5 seconds
  consultation: { timeout: 30000 } // 30 seconds (AI processing)
}
```

### 3. Compression

Enable gzip compression:

```javascript
app.use(compression());
```

### 4. Caching

Consider adding caching layer:

```javascript
app.use(redis.cache()); // Optional
```

## Security Best Practices

1. **Always use HTTPS in production**
2. **Keep JWT_SECRET secure and rotate regularly**
3. **Implement proper CORS policy** (don't use `*` in production)
4. **Monitor rate limiting and adjust as needed**
5. **Use correlation IDs for audit trails**
6. **Keep dependencies updated** (`npm audit fix`)
7. **Implement request validation** on backend services
8. **Use HTTPS between gateway and services** in production

## API Gateway vs Direct Service Access

```
❌ Direct Access:
Client → Service 1 (5001)
Client → Service 2 (5002)
Client → Service 3 (5003)
(Multiple URLs, no unified auth, harder to manage)

✅ Gateway Access:
Client → API Gateway (3000)
    ├→ Service 1 (5001)
    ├→ Service 2 (5002)
    └→ Service 3 (5003)
(Single URL, unified auth, easy to manage)
```

## Usage Examples

### Using curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "pass"}'

# Access protected route with token
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/patients

# Check rate limit
curl -i http://localhost:3000/api/patients
# Look for X-RateLimit-* headers
```

### Using JavaScript/Fetch

```javascript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'pass' })
});
const { token } = await response.json();

// Access protected route
const result = await fetch('http://localhost:3000/api/patients', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Using Axios

```javascript
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// All requests will include the token
client.get('/api/patients');
```

## Next Steps

1. ✅ API Gateway created and running
2. ⏳ Update docker-compose.yml to include API Gateway
3. ⏳ Update Kubernetes manifests for API Gateway
4. ⏳ Add API documentation (Swagger/OpenAPI)
5. ⏳ Implement request/response validation
6. ⏳ Add caching layer (Redis)
7. ⏳ Implement circuit breaker for resilience
8. ⏳ Set up monitoring (Prometheus metrics)
9. ⏳ Add API versioning support
10. ⏳ Implement request logging to database
