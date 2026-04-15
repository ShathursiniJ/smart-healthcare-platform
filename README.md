# Smart Healthcare Appointment & Telemedicine Platform

A cloud-native microservices-based telemedicine platform built with React, Node.js, MongoDB, Docker, and Kubernetes.

## Services
- auth-service
- patient-service
- doctor-service
- appointment-service
- consultation-service
- payment-notification-service

## E2E Smoke Test

Run this from the project root after all services are up:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\e2e-smoke.ps1
```

This validates the full role-based workflow:
- admin, doctor, and patient authentication
- doctor availability in listing and approval state
- appointment booking and confirmation
- consultation start
- prescription creation
- payment initiate and confirm
- notifications and admin payment stats
