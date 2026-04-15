# Complete Microservices Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Smart Healthcare Platform microservices architecture using Docker Compose (local development) or Kubernetes (production).

## Architecture Summary

The platform consists of:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│                    Port 80 / 5173 (dev)                         │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
         ┌──────────▼──────┬──────▼────────────┬─▼────────────┐
         │                 │                   │              │
    ┌────▼─────┐  ┌────────▼────┐  ┌──────────▼──┐  ┌────────▼──┐
    │Auth Svc  │  │Patient Svc  │  │ Doctor Svc │  │Appt Svc  │
    │Port 5001 │  │Port 5002    │  │ Port 5005  │  │Port 5004 │
    └────┬─────┘  └────┬────────┘  │            │  └────┬─────┘
         │            │            └────┬───────┘       │
         │            │                 │               │
         │    ┌───────┴──────┬────────────┴────┬─────────┘
         │    │              │                  │
    ┌────▼────▼──┐  ┌────────▼─────┐  ┌───────▼──────┐
    │Notification│  │Consultation  │  │Payment Svc   │
    │Svc 5007   │  │Svc Port 5003  │  │Port 5006     │
    └────────────┘  └───────────────┘  └──────────────┘
         │
         ├──► Email (Nodemailer)
         └──► SMS (Twilio)
         
         └──► MongoDB (All services)
```

## Prerequisites

### For Docker Compose Deployment
- Docker Desktop (v20.10 or higher)
- Docker Compose (v1.29 or higher)
- 4GB RAM minimum
- 10GB disk space

### For Kubernetes Deployment
- kubectl CLI installed
- Kubernetes cluster (v1.24 or higher)
  - Minikube (local testing)
  - EKS (AWS)
  - GKE (Google Cloud)
  - AKS (Azure)
- Requirements:
  - 8GB RAM minimum
  - 20GB disk space
  - 3 worker nodes recommended for production

## Docker Compose Deployment (Local Development)

### 1. Environment Setup

Create a `.env` file in the project root:

```env
# JWT Configuration
JWT_SECRET=f8943733a009e790032476b47e8c0c07140edacf682e27aef88eb754cdcc0257
JWT_EXPIRES_IN=1d

# MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=admin123

# Email Configuration (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@healthcare.com

# Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Anthropic API (for AI consultation)
ANTHROPIC_API_KEY=your-anthropic-key

# PayHere Configuration
PAYHERE_MERCHANT_ID=your-merchant-id
PAYHERE_API_KEY=your-api-key
```

### 2. Build and Start Services

```bash
# Navigate to project root
cd smart-healthcare-platform

# Build all Docker images
docker-compose build

# Start all services
docker-compose up -d

# Verify all services are running
docker-compose ps

# View logs
docker-compose logs -f frontend
docker-compose logs -f auth-service
# etc.
```

### 3. Verify Services Are Running

```bash
# Check MongoDB
docker exec -it mongodb mongosh -u admin -p admin123 --eval "db.runCommand('ping')"

# Check Auth Service
curl http://localhost:5001/api/auth/health

# Check Patient Service
curl http://localhost:5002/api/health

# Check Doctor Service registers notification properly
curl http://localhost:5005/api/health

# Check Frontend
curl http://localhost:5173
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Auth API**: http://localhost:5001
- **Patient API**: http://localhost:5002
- **Doctor API**: http://localhost:5005
- **Appointment API**: http://localhost:5004
- **Consultation API**: http://localhost:5003
- **Payment API**: http://localhost:5006
- **Notification API**: http://localhost:5007

### 5. Docker Compose Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Remove volumes (resets database)
docker-compose down -v

# View specific service logs
docker-compose logs -f [service-name]

# Execute command in container
docker-compose exec [service-name] [command]

# Rebuild specific service
docker-compose build [service-name]

# Update and restart a service
docker-compose up -d --no-deps --build [service-name]
```

## Kubernetes Deployment (Production)

### 1. Prepare Kubernetes Cluster

```bash
# Check kubectl is configured
kubectl cluster-info

# Set context if multiple clusters
kubectl config use-context [cluster-name]

# Verify connection
kubectl version --short
```

### 2. Create Namespace and Secrets

```bash
# Apply namespace configuration
kubectl apply -f k8s/00-namespace-config.yaml

# Verify namespace created
kubectl get namespaces | grep healthcare-platform

# Create Secrets from .env file (IMPORTANT - Use real credentials!)
kubectl create secret generic app-secrets \
  -n healthcare-platform \
  --from-literal=JWT_SECRET='your-jwt-secret' \
  --from-literal=EMAIL_USER='your-email@gmail.com' \
  --from-literal=EMAIL_PASSWORD='your-app-password' \
  --from-literal=TWILIO_ACCOUNT_SID='your-twilio-sid' \
  --from-literal=TWILIO_AUTH_TOKEN='your-twilio-token' \
  --from-literal=ANTHROPIC_API_KEY='your-anthropic-key' \
  --from-literal=PAYHERE_MERCHANT_ID='your-merchant-id' \
  --from-literal=PAYHERE_API_KEY='your-api-key'

# Verify secrets created
kubectl get secrets -n healthcare-platform
```

### 3. Deploy MongoDB

```bash
# Deploy MongoDB StatefulSet and PersistentVolume
kubectl apply -f k8s/01-mongodb.yaml

# Verify MongoDB is running
kubectl get pods -n healthcare-platform -l app=mongodb
kubectl get pv -n healthcare-platform

# Wait for MongoDB to be ready (status should be 1/1 Running)
kubectl wait --for=condition=ready pod \
  -l app=mongodb \
  -n healthcare-platform \
  --timeout=300s
```

### 4. Deploy Microservices

```bash
# Deploy all microservices
kubectl apply -f k8s/02-microservices.yaml

# Verify all services are running
kubectl get pods -n healthcare-platform

# Check logs of a service
kubectl logs -n healthcare-platform deployment/auth-service -f

# Port forward to test service locally
kubectl port-forward -n healthcare-platform svc/auth-service 5001:5001
curl http://localhost:5001/api/auth/health
```

### 5. Deploy Frontend and Configure Ingress

```bash
# Deploy frontend
kubectl apply -f k8s/03-frontend-ingress.yaml

# Verify frontend is running
kubectl get pods -n healthcare-platform -l app=frontend

# Get frontend LoadBalancer external IP
kubectl get svc -n healthcare-platform frontend

# Access frontend
# For Minikube: minikube service frontend -n healthcare-platform
# For cloud: Use the external IP from above
```

### 6. Configure Ingress Controller (If Using Hostname-Based Routing)

```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Wait for Ingress controller to be ready
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/name=ingress-nginx \
  --timeout=300s \
  -n ingress-nginx

# Get Ingress controller IP
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Update /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
# Add: <ingress-ip> healthcare.local

# Access via hostname
curl http://healthcare.local
```

### 7. Verify All Services Are Communicating

```bash
# Port forward each service and test
kubectl port-forward -n healthcare-platform svc/auth-service 5001:5001 &
kubectl port-forward -n healthcare-platform svc/doctor-service 5005:5005 &
kubectl port-forward -n healthcare-platform svc/notification-service 5007:5007 &

# Test doctor registration notification flow
curl -X POST http://localhost:5005/api/doctors/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test",
    "email": "doctor@test.com",
    "phone": "1234567890",
    "specialization": "General",
    "credentials": "MD"
  }'

# Check if notification was sent
curl http://localhost:5007/api/notifications/admin
```

## Kubernetes Management Commands

### Monitoring and Debugging

```bash
# View all resources in namespace
kubectl get all -n healthcare-platform

# View pods with more details
kubectl get pods -n healthcare-platform -o wide

# View pod logs
kubectl logs -n healthcare-platform pod/[pod-name]
kubectl logs -n healthcare-platform deployment/auth-service -f

# Describe pod (detailed info and events)
kubectl describe pod -n healthcare-platform [pod-name]

# Port forwarding (access service locally)
kubectl port-forward -n healthcare-platform svc/[service-name] [local-port]:[service-port]

# Execute command in pod
kubectl exec -n healthcare-platform -it pod/[pod-name] -- /bin/sh

# View resource usage
kubectl top nodes
kubectl top pods -n healthcare-platform
```

### Scaling

```bash
# Scale a deployment
kubectl scale deployment auth-service -n healthcare-platform --replicas=3

# Auto-scaling setup
kubectl autoscale deployment auth-service -n healthcare-platform --min=2 --max=5 --cpu-percent=70

# View HPA status
kubectl get hpa -n healthcare-platform
```

### Updates and Rollouts

```bash
# Update image for deployment
kubectl set image deployment/auth-service \
  -n healthcare-platform \
  auth-service=auth-service:v2.0

# Check rollout status
kubectl rollout status deployment/auth-service -n healthcare-platform

# View rollout history
kubectl rollout history deployment/auth-service -n healthcare-platform

# Rollback to previous version
kubectl rollout undo deployment/auth-service -n healthcare-platform
```

### Cleanup

```bash
# Delete entire healthcare-platform namespace
kubectl delete namespace healthcare-platform

# Or selectively delete resources
kubectl delete deployment auth-service -n healthcare-platform
kubectl delete svc auth-service -n healthcare-platform
```

## Service Communication Matrix

| Service | Port | Dependencies | Communicates With |
|---------|------|--------------|-------------------|
| Auth | 5001 | MongoDB | - |
| Patient | 5002 | MongoDB | Auth Service |
| Doctor | 5005 | MongoDB | Auth Service, Notification Service |
| Appointment | 5004 | MongoDB | Doctor Service |
| Consultation | 5003 | MongoDB | Appointment Service (Anthropic API) |
| Payment | 5006 | MongoDB | - |
| Notification | 5007 | MongoDB | All Services (Email/SMS) |
| Frontend | 80/5173 | - | All Services (HTTP) |

## Kubernetes DNS Service Discovery

Within Kubernetes, services use DNS for communication:

```
http://[service-name].[namespace].svc.cluster.local:[port]

Examples:
- http://auth-service.healthcare-platform.svc.cluster.local:5001
- http://notification-service.healthcare-platform.svc.cluster.local:5007
- http://mongodb.healthcare-platform.svc.cluster.local:27017
```

Update service URLs in ConfigMap: `k8s/00-namespace-config.yaml`

## Monitoring Setup

### Option 1: Prometheus + Grafana

```bash
# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  -n healthcare-platform \
  -f - <<EOF
prometheus:
  prometheusSpec:
    retention: 7d
    resources:
      requests:
        memory: 500Mi
grafana:
  adminPassword: admin123
EOF

# Access Grafana
kubectl port-forward -n healthcare-platform svc/prometheus-grafana 3000:80
# Login: admin / admin123
# Visit: http://localhost:3000
```

### Option 2: Simple Health Checks

All services expose health check endpoints:
- `/api/auth/health` - Auth Service
- `/api/health` - Other Services

Monitor these endpoints using external monitoring tools (Datadog, New Relic, etc.)

## Horizontal Pod Autoscaling

```bash
# Create HPA for Auth Service
kubectl autoscale deployment auth-service \
  -n healthcare-platform \
  --min=2 --max=5 \
  --cpu-percent=70

# View HPA status
kubectl get hpa -n healthcare-platform

# Monitor autoscaler
kubectl describe hpa auth-service -n healthcare-platform
```

Repeat for other critical services:
- doctor-service (receives doctor registrations)
- notification-service (sends emails/SMS)
- consultation-service (AI processing)

## Troubleshooting

### Issue 1: Pods Not Starting

```bash
# Check pod events
kubectl describe pod [pod-name] -n healthcare-platform

# View logs
kubectl logs [pod-name] -n healthcare-platform

# Common causes:
# - Image not found: Check image names in K8s manifests
# - Readiness probe failing: Service might not be ready
# - Resource limits: Insufficient cluster resources
```

### Issue 2: Services Can't Communicate

```bash
# Verify DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never \
  -n healthcare-platform \
  -- nslookup auth-service

# Test service connectivity
kubectl exec -it [pod-name] -n healthcare-platform -- \
  wget -O- http://auth-service:5001/api/auth/health

# Check NetworkPolicy (if defined)
kubectl get networkpolicies -n healthcare-platform
```

### Issue 3: Database Connection Issues

```bash
# Verify MongoDB is running
kubectl get pods -n healthcare-platform -l app=mongodb

# Check MongoDB logs
kubectl logs -n healthcare-platform mongodb-0

# Connect to MongoDB
kubectl port-forward -n healthcare-platform svc/mongodb 27017:27017
mongosh -u admin -p admin123 --eval "show databases"

# Check PersistentVolume
kubectl get pv -n healthcare-platform
kubectl get pvc -n healthcare-platform
```

### Issue 4: Persistent Volume Not Mounting

```bash
# Check PVC status
kubectl get pvc -n healthcare-platform

# Check PV status
kubectl get pv

# View PVC details
kubectl describe pvc mongodb -n healthcare-platform

# Verify storage class
kubectl get storageclass

# For Minikube:
minikube ssh
ls -la /data/   # Check if volume exists
```

## Environment Variables Reference

All environment variables are configured in:
- **Docker Compose**: `docker-compose.yml` (services section)
- **Kubernetes**: `k8s/00-namespace-config.yaml` (ConfigMap/Secrets)

Key variables:

```env
# Service URLs
NOTIFICATION_SERVICE_URL=http://notification-service:5007
AUTH_SERVICE_URL=http://auth-service:5001
DOCTOR_SERVICE_URL=http://doctor-service:5005

# Database
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/[db-name]?authSource=admin
DB_NAME=[service-name]_db

# Authentication
JWT_SECRET=[secret-key]
JWT_EXPIRES_IN=1d

# External Services
ANTHROPIC_API_KEY=[key]
TWILIO_ACCOUNT_SID=[sid]
TWILIO_AUTH_TOKEN=[token]
PAYHERE_MERCHANT_ID=[id]
PAYHERE_API_KEY=[key]
```

## Performance Optimization

### 1. Resource Limits

Current settings in K8s manifests:
- Most services: 500m CPU, 256Mi RAM
- Consultation (AI): 1000m CPU, 512Mi RAM
- Frontend: 200m CPU, 256Mi RAM

Adjust based on monitoring data:

```bash
kubectl set resources deployment auth-service \
  -n healthcare-platform \
  --limits=cpu=1000m,memory=512Mi \
  --requests=cpu=500m,memory=256Mi
```

### 2. Caching

Frontend nginx configuration includes:
- Browser caching for static assets (30 days)
- 1-year cache for hashed build files
- Gzip compression enabled

### 3. Database Optimization

```bash
# Create indexes in MongoDB
kubectl exec -it -n healthcare-platform mongodb-0 -- mongosh
# Once in mongosh:
use doctor_db
db.doctors.createIndex({ "email": 1 })
db.doctors.createIndex({ "status": 1 })
```

## Security Considerations

### 1. HTTPS/TLS

Update Ingress for TLS:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: frontend-ingress
  namespace: healthcare-platform
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - healthcare.local
    secretName: healthcare-tls
  # ... rest of config
```

### 2. Network Policies

```bash
# Restrict traffic between namespaces
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: healthcare-platform
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
EOF
```

### 3. RBAC

Create service accounts with minimal permissions:

```bash
kubectl create serviceaccount healthcare-app -n healthcare-platform
kubectl create role healthcare-reader --verb=get,list --resource=pods -n healthcare-platform
kubectl create rolebinding healthcare-read-pods --clusterrole=healthcare-reader --serviceaccount=healthcare-platform:healthcare-app -n healthcare-platform
```

## Backup and Recovery

### MongoDB Backup

```bash
# Backup MongoDB
kubectl exec -n healthcare-platform mongodb-0 -- mongodump --out=/backup

# Extract backup
kubectl cp healthcare-platform/mongodb-0:/backup ./backup

# Restore from backup
kubectl cp ./backup healthcare-platform/mongodb-0:/restore
kubectl exec -n healthcare-platform mongodb-0 -- mongorestore /restore
```

### PersistentVolume Backup

```bash
# Create snapshot (AWS EBS example)
aws ec2 create-snapshot --volume-id vol-xxxxx --description "MongoDB backup"

# For other providers, use similar snapshot mechanisms
```

## Next Steps

1. ✅ Deploy using Docker Compose for testing
2. ✅ Verify all services communicate properly
3. ✅ Deploy to Kubernetes cluster
4. ✅ Configure Ingress for external access
5. ⏳ Set up monitoring (Prometheus/Grafana)
6. ⏳ Configure logging (ELK/Loki)
7. ⏳ Set up CI/CD pipeline
8. ⏳ Implement backup strategy
9. ⏳ Security hardening
10. ⏳ Performance optimization

## Support and Documentation

- **Microservices Overview**: See `MICROSERVICES_SETUP.md`
- **API Documentation**: See `docs/API_CONTRACT.md`
- **Development Rules**: See `docs/DEVELOPMENT_RULES.md`
- **Docker Compose**: Run `docker-compose config` to view merged configuration
- **Kubernetes**: Run `kubectl api-resources` for available resource types

## Contact

For questions or issues:
1. Check logs: `docker-compose logs` or `kubectl logs`
2. Review configuration files
3. Verify environment variables
4. Check service dependencies
5. Run health checks on all services
