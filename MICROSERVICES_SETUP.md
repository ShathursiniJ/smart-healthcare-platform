# MediConnect Smart Healthcare Platform - Microservices Setup

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                     Port 5173 (Async/AJAX)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    (REST API Calls)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      API Gateway / Ingress                       │
│                   (Kubernetes Ingress / NGINX)                   │
└──────────┬────────────────┬──────────────────┬───────────────────┘
           │                │                  │
    ┌──────▼──┐      ┌──────▼──┐       ┌──────▼──┐
    │  Auth   │      │ Patient │       │ Doctor  │
    │Service  │      │Service  │       │Service  │
    │ :5001   │      │ :5002   │       │ :5005   │
    └─────────┘      └─────────┘       └─────────┘
    
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │Appointment│      │Consultation│    │ Payment  │
    │Service   │      │Service   │    │Service   │
    │ :5004    │      │ :5003    │    │ :5006    │
    └──────────┘      └──────────┘    └──────────┘
    
              ┌──────────────────────┐
              │ Notification Service │
              │      :5007           │
              └──────────────────────┘
              
         ┌────────────────────────────┐
         │   MongoDB (Shared Database) │
         │         :27017             │
         └────────────────────────────┘
```

---

## 📦 Services Directory

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| **auth-service** | 5001 | auth_db | Authentication & Authorization |
| **patient-service** | 5002 | patient_db | Patient Management |
| **consultation-service** | 5003 | consultation_db | Consultation & AI Health Assistant |
| **appointment-service** | 5004 | appointment_db | Appointment Scheduling |
| **doctor-service** | 5005 | doctor_db | Doctor Profile & Registration |
| **payment-notification-service** | 5006 | payment_db | PayHere Payment Gateway |
| **notification-service** | 5007 | notification_db | Email & SMS Notifications |
| **frontend** | 5173 | - | React Web Application |

---

## 🐳 Docker Setup

### Prerequisites
- Docker: v20.10+
- Docker Compose: v2.0+
- Node.js: v18+ (for local development)

### Build and Run with Docker Compose

```bash
# 1. Navigate to project root
cd smart-healthcare-platform

# 2. Build all service images
docker-compose build

# 3. Start all services
docker-compose up -d

# 4. Check service status
docker-compose ps

# 5. View logs
docker-compose logs -f

# 6. Stop all services
docker-compose down

# 7. Clean up volumes
docker-compose down -v
```

### Individual Service Commands

```bash
# Build specific service
docker-compose build auth-service

# Start only auth service
docker-compose up -d auth-service

# View logs for specific service
docker-compose logs -f auth-service

# Shell access to container
docker-compose exec auth-service sh
```

### Access Points

- **Frontend:** http://localhost:5173
- **Auth Service:** http://localhost:5001
- **Patient Service:** http://localhost:5002
- **Consultation Service:** http://localhost:5003
- **Appointment Service:** http://localhost:5004
- **Doctor Service:** http://localhost:5005
- **Payment Service:** http://localhost:5006
- **Notification Service:** http://localhost:5007
- **MongoDB:** mongodb://localhost:27017
  - Username: `admin`
  - Password: `admin123`

---

## ☸️ Kubernetes Setup

### Prerequisites
- Kubernetes Cluster: v1.24+
  - **Local options:**
    - [Minikube](https://minikube.sigs.k8s.io/)
    - [Docker Desktop K8s](https://www.docker.com/products/docker-desktop)
    - [Kind](https://kind.sigs.k8s.io/)
- `kubectl` CLI
- Docker images pushed to container registry

###  1. Prepare Images for Kubernetes

```bash
# Build images with registry prefix (e.g., Docker Hub)
REGISTRY=yourusername

docker build -t $REGISTRY/auth-service:latest ./services/auth-service
docker build -t $REGISTRY/patient-service:latest ./services/patient-service
docker build -t $REGISTRY/doctor-service:latest ./services/doctor-service
docker build -t $REGISTRY/appointment-service:latest ./services/appointment-service
docker build -t $REGISTRY/consultation-service:latest ./services/consultation-service
docker build -t $REGISTRY/payment-notification-service:latest ./services/payment-notification-service
docker build -t $REGISTRY/notification-service:latest ./services/notification-service
docker build -t $REGISTRY/frontend:latest ./frontend

# Push images to registry
docker push $REGISTRY/auth-service:latest
docker push $REGISTRY/patient-service:latest
# ... push all images
```

### 2. Deploy to Kubernetes

```bash
# 1. Create namespace and configuration
kubectl apply -f k8s/00-namespace-config.yaml

# 2. Deploy MongoDB
kubectl apply -f k8s/01-mongodb.yaml

# 3. Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n healthcare-platform --timeout=300s

# 4. Deploy microservices
kubectl apply -f k8s/02-microservices.yaml

# 5. Deploy frontend and ingress
kubectl apply -f k8s/03-frontend-ingress.yaml

# 6. Verify deployments
kubectl get deployments -n healthcare-platform
kubectl get services -n healthcare-platform
kubectl get pods -n healthcare-platform
```

### 3. Check Deployment Status

```bash
# View all resources
kubectl get all -n healthcare-platform

# Check pod status
kubectl get pods -n healthcare-platform -w

# View service endpoints
kubectl get svc -n healthcare-platform

# Get ingress status
kubectl get ingress -n healthcare-platform

# View deployment logs
kubectl logs -f deployment/auth-service -n healthcare-platform

# Access pod shell
kubectl exec -it pod/auth-service-xxxxx -n healthcare-platform -- sh
```

### 4. Port Forwarding (for local access)

```bash
# Forward frontend
kubectl port-forward svc/frontend 5173:5173 -n healthcare-platform

# Forward auth service
kubectl port-forward svc/auth-service 5001:5001 -n healthcare-platform

# Forward MongoDB
kubectl port-forward svc/mongodb 27017:27017 -n healthcare-platform
```

### 5. Scaling Services

```bash
# Scale auth service to 5 replicas
kubectl scale deployment auth-service --replicas=5 -n healthcare-platform

# Check autoscaling status
kubectl get hpa -n healthcare-platform

# Watch scaling in real-time
kubectl get deployment -n healthcare-platform -w
```

### 6. Cleanup

```bash
# Delete all resources in namespace
kubectl delete namespace healthcare-platform

# Or selectively delete
kubectl delete -f k8s/03-frontend-ingress.yaml
kubectl delete -f k8s/02-microservices.yaml
kubectl delete -f k8s/01-mongodb.yaml
kubectl delete -f k8s/00-namespace-config.yaml
```

---

## 🔄 Service Communication

### Inter-Service Communication Pattern

All services communicate using **HTTP REST APIs** within the cluster:

```javascript
// Example: Appointment Service calling Doctor Service
const doctorServiceUrl = process.env.DOCTOR_SERVICE_URL; // "http://doctor-service:5005"

const getDoctor = async (doctorId) => {
  const response = await axios.get(`${doctorServiceUrl}/api/doctors/${doctorId}`);
  return response.data;
};
```

### Environment Variables for Service URLs

Each service has access to other service URLs via environment variables:

```
AUTH_SERVICE_URL=http://auth-service:5001
PATIENT_SERVICE_URL=http://patient-service:5002
CONSULTATION_SERVICE_URL=http://consultation-service:5003
APPOINTMENT_SERVICE_URL=http://appointment-service:5004
DOCTOR_SERVICE_URL=http://doctor-service:5005
PAYMENT_SERVICE_URL=http://payment-notification-service:5006
NOTIFICATION_SERVICE_URL=http://notification-service:5007
```

---

## 🛡️ Security Best Practices

### 1. Secrets Management
```bash
# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=JWT_SECRET=your-secret-key \
  --from-literal=MONGODB_USER=admin \
  --from-literal=MONGODB_PASSWORD=secure-password \
  -n healthcare-platform
```

### 2. Network Policies
Already configured in `03-frontend-ingress.yaml`:
- Pods can only communicate within the namespace
- External traffic only through Ingress
- DNS access allowed (port 53)

### 3. Resource Limits
All deployments have CPU and memory limits:
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "500m"
```

### 4. Health Checks
All services implement:
- **Liveness Probe:** Restarts container if unhealthy
- **Readiness Probe:** Removes from load balancer if not ready

---

## 📊 Monitoring & Logging

### Using kubectl logs

```bash
# View recent logs
kubectl logs deployment/auth-service -n healthcare-platform --tail=100

# Stream logs in real-time
kubectl logs -f deployment/auth-service -n healthcare-platform

# View logs from all pods in a service
kubectl logs -l app=auth-service -n healthcare-platform --all-containers=true
```

### HorizontalPodAutoscaler (HPA) Metrics

```bash
# View HPA status
kubectl get hpa -n healthcare-platform

# Describe HPA conditions
kubectl describe hpa auth-service-hpa -n healthcare-platform

# View metrics (requires metrics-server)
kubectl top nodes
kubectl top pods -n healthcare-platform
```

---

## ⚙️ Configuration Management

### Using ConfigMaps and Secrets

**ConfigMaps** (non-sensitive):
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: healthcare-platform
data:
  NODE_ENV: "production"
  JWT_EXPIRES_IN: "1d"
```

**Secrets** (sensitive):
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: healthcare-platform
type: Opaque
stringData:
  JWT_SECRET: "your-secret-key"
  MONGODB_PASSWORD: "secure-password"
```

---

## 🔄 CI/CD Integration

### Example GitHub Actions Workflow

```yaml
name: Deploy to Kubernetes
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t ghcr.io/username/healthcare/auth-service:latest ./services/auth-service
          # ... build all services
      
      - name: Push images
        run: docker push ghcr.io/username/healthcare/auth-service:latest
      
      - name: Deploy to K8s
        run: |
          kubectl set image deployment/auth-service auth-service=ghcr.io/username/healthcare/auth-service:latest -n healthcare-platform
```

---

## ✅ Troubleshooting

### Service Won't Start

```bash
# Check pod events
kubectl describe pod <pod-name> -n healthcare-platform

# View pod logs
kubectl logs <pod-name> -n healthcare-platform

# Check resource availability
kubectl top nodes
kubectl top pods -n healthcare-platform
```

### Port Conflicts

```bash
# Find service listening on port
lsof -i :5001

# Kill process (Linux/Mac)
kill -9 <PID>

# Or use Docker Compose
docker-compose restart auth-service
```

### MongoDB Connection Issues

```bash
# Test MongoDB connectivity
kubectl exec -it pod/mongodb-xxxxx -n healthcare-platform -- mongosh

# Check MongoDB logs
kubectl logs -f pod/mongodb-xxxxx -n healthcare-platform
```

---

## 📚 Documentation

- **API Documentation:** See [API_CONTRACT.md](../docs/API_CONTRACT.md)
- **Development Guide:** See [DEVELOPMENT_RULES.md](../docs/DEVELOPMENT_RULES.md)
- **Team Guide:** See [TEAM_DEVELOPMENT_GUIDE.md](../docs/TEAM_DEVELOPMENT_GUIDE.md)

---

## 🎓 Technology Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | React + Vite | 18.x |
| **Async Programming** | JavaScript Promises & Async/Await | ES2020+ |
| **Backend Framework** | Express.js | 5.2.x |
| **Database** | MongoDB | 7.0 |
| **Container Orchestration** | Docker & Kubernetes | 1.24+ |
| **API Design** | RESTful Microservices | - |
| **Authentication** | JWT | - |
| **Message Queue** | (Future: RabbitMQ/Apache Kafka) | - |

---

## 📞 Support

For issues or questions:
1. Check service logs: `kubectl logs deployment/<service> -n healthcare-platform`
2. Verify inter-service connectivity: `kubectl exec <pod> -- curl <service-url>`
3. Review application logs: `docker-compose logs <service>`

---

**Last Updated:** April 2026  
**Project:** Smart Healthcare Platform  
**Status:** ✅ Production Ready
