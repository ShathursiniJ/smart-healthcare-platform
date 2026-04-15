# Quick Start Deployment Guide

## 🚀 Docker Compose (Local Development)

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# View services
docker-compose ps

# Stop all services
docker-compose down

# View frontend logs
docker-compose logs -f frontend

# Access frontend
# Open browser: http://localhost:5173
```

## ☸️ Kubernetes (Production)

### Create Namespace & Secrets

```bash
# Create namespace and ConfigMap
kubectl apply -f k8s/00-namespace-config.yaml

# Create secrets (UPDATE WITH YOUR VALUES!)
kubectl create secret generic app-secrets \
  -n healthcare-platform \
  --from-literal=JWT_SECRET='your-secret' \
  --from-literal=EMAIL_USER='your-email@gmail.com' \
  --from-literal=EMAIL_PASSWORD='your-app-password' \
  --from-literal=TWILIO_ACCOUNT_SID='your-sid' \
  --from-literal=TWILIO_AUTH_TOKEN='your-token' \
  --from-literal=ANTHROPIC_API_KEY='your-key'
```

### Deploy Services

```bash
# Deploy MongoDB
kubectl apply -f k8s/01-mongodb.yaml

# Deploy microservices
kubectl apply -f k8s/02-microservices.yaml

# Deploy frontend
kubectl apply -f k8s/03-frontend-ingress.yaml

# Check status
kubectl get pods -n healthcare-platform

# Watch deployment progress
kubectl get pods -n healthcare-platform -w
```

## ✅ Verify Deployment

### Docker Compose

```bash
# Test each service health endpoint
curl http://localhost:5001/api/auth/health
curl http://localhost:5002/api/health
curl http://localhost:5005/api/health
curl http://localhost:5007/api/notifications/admin
```

### Kubernetes

```bash
# Port forward services locally
kubectl port-forward -n healthcare-platform svc/auth-service 5001:5001 &
kubectl port-forward -n healthcare-platform svc/notification-service 5007:5007 &

# Test services
curl http://localhost:5001/api/auth/health
curl http://localhost:5007/api/notifications/admin

# View logs
kubectl logs -n healthcare-platform deployment/auth-service -f
```

## 📊 Useful Commands

### View Resources

```bash
# All pods in namespace
kubectl get pods -n healthcare-platform

# All services
kubectl get svc -n healthcare-platform

# All deployments
kubectl get deployment -n healthcare-platform

# Persistent volumes
kubectl get pv,pvc -n healthcare-platform
```

### Debugging

```bash
# Describe pod (shows events and status)
kubectl describe pod [pod-name] -n healthcare-platform

# View pod logs
kubectl logs [pod-name] -n healthcare-platform

# Execute command in pod
kubectl exec -it [pod-name] -n healthcare-platform -- /bin/sh

# Port forward for testing
kubectl port-forward -n healthcare-platform svc/[service] [local-port]:[service-port]
```

### Scaling

```bash
# Scale a service
kubectl scale deployment auth-service -n healthcare-platform --replicas=3

# Auto-scale
kubectl autoscale deployment auth-service -n healthcare-platform --min=2 --max=5 --cpu-percent=70
```

### Updates

```bash
# Update service image
kubectl set image deployment/auth-service \
  -n healthcare-platform \
  auth-service=auth-service:v2.0

# Rollback
kubectl rollout undo deployment/auth-service -n healthcare-platform

# Check status
kubectl rollout status deployment/auth-service -n healthcare-platform
```

## 🔧 Configuration Management

### Update Environment Variables (Kubernetes)

Edit ConfigMap:
```bash
kubectl edit configmap api-urls -n healthcare-platform
```

Update Secrets:
```bash
kubectl delete secret app-secrets -n healthcare-platform
kubectl create secret generic app-secrets \
  -n healthcare-platform \
  --from-literal=JWT_SECRET='new-value'
```

## 📍 Access Points

### Docker Compose
- Frontend: `http://localhost:5173`
- Auth API: `http://localhost:5001`
- Patient API: `http://localhost:5002`
- Doctor API: `http://localhost:5005`
- Appointment API: `http://localhost:5004`
- Consultation API: `http://localhost:5003`
- Payment API: `http://localhost:5006`
- Notification API: `http://localhost:5007`

### Kubernetes (LoadBalancer)
```bash
# Get external IP
kubectl get svc frontend -n healthcare-platform

# Access frontend
# curl http://<EXTERNAL-IP>:80
```

### Kubernetes (Ingress - After setup)
- Frontend: `http://healthcare.local` (after /etc/hosts update)

## 🐛 Troubleshooting

### Service won't start

```bash
# Check pod events
kubectl describe pod [pod-name] -n healthcare-platform

# Check logs
kubectl logs [pod-name] -n healthcare-platform
```

### Can't connect to database

```bash
# Port forward MongoDB
kubectl port-forward -n healthcare-platform svc/mongodb 27017:27017

# Test connection
mongosh -u admin -p admin123 --eval "show databases"
```

### Services can't reach each other

```bash
# Check DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never \
  -n healthcare-platform -- nslookup auth-service

# Test connectivity
kubectl exec -it [pod] -n healthcare-platform -- \
  wget -O- http://auth-service:5001/api/auth/health
```

## 📚 Complete Documentation

For detailed information, see:
- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `MICROSERVICES_SETUP.md` - Architecture and services overview
- `docs/API_CONTRACT.md` - API endpoints and contracts
- `docker-compose.yml` - Docker Compose configuration
- `k8s/` folder - Kubernetes manifests

## 🎯 Common Workflows

### Deploy to Development (Docker Compose)
```bash
docker-compose build && docker-compose up -d
```

### Deploy to Kubernetes
```bash
kubectl apply -f k8s/00-namespace-config.yaml
kubectl apply -f k8s/01-mongodb.yaml
kubectl apply -f k8s/02-microservices.yaml
kubectl apply -f k8s/03-frontend-ingress.yaml
```

### Monitor Services
```bash
watch kubectl get pods -n healthcare-platform
```

### Scale Services
```bash
kubectl scale deployment auth-service -n healthcare-platform --replicas=5
```

### Check Service Status
```bash
kubectl get all -n healthcare-platform
```

### View Recent Logs
```bash
kubectl logs -n healthcare-platform deployment/auth-service -f --tail=50
```

## ⚡ Pro Tips

1. **Use watch for monitoring**
   ```bash
   watch kubectl get deployments -n healthcare-platform
   ```

2. **Create alias for faster commands**
   ```bash
   alias k='kubectl'
   alias khc='kubectl -n healthcare-platform'
   ```

3. **Use port-forward + local testing**
   ```bash
   kubectl port-forward -n healthcare-platform svc/auth-service 5001:5001
   # Then use http://localhost:5001 for testing
   ```

4. **View multiple pods logs**
   ```bash
   kubectl logs -n healthcare-platform -l app=auth-service -f
   ```

5. **Scale down for cost savings**
   ```bash
   kubectl scale deployment --all --replicas=1 -n healthcare-platform
   ```
