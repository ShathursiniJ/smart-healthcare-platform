import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import {
  verifyToken,
  verifyTokenOptional,
  correlationId
} from './middleware/auth.js';
import {
  generalLimiter,
  authLimiter,
  apiLimiter,
  noLimiter,
  perUserLimiter
} from './middleware/rateLimiter.js';
import {
  errorHandler,
  notFoundHandler,
  requestLogger
} from './middleware/errorHandler.js';
import { getServiceUrl, getServicesInfo } from './config/services.js';
import { getAllRoutes } from './config/routes.js';

const app = express();

// ===== MIDDLEWARE SETUP =====

// Correlation ID for request tracking
app.use(correlationId);

// Request logging
app.use(morgan(':method :url :status :response-time ms'));
app.use(requestLogger);

// CORS setup
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID']
}));

// Body parsing will be added after proxies for local routes if needed


// ===== RATE LIMITING =====
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use(generalLimiter);

// ===== PUBLIC ROUTES =====

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Gateway is healthy',
    timestamp: new Date().toISOString()
  });
});

/**
 * API Gateway info endpoint
 */
app.get('/api/gateway/info', (req, res) => {
  res.json({
    success: true,
    name: 'Smart Healthcare Platform - API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * List all available services
 */
app.get('/api/gateway/services', (req, res) => {
  res.json({
    success: true,
    services: getServicesInfo(),
    timestamp: new Date().toISOString()
  });
});

/**
 * List all available routes
 */
app.get('/api/gateway/routes', (req, res) => {
  res.json({
    success: true,
    routes: getAllRoutes(),
    timestamp: new Date().toISOString()
  });
});

// ===== AUTH SERVICE PROXY =====
app.use(
  '/api/auth',
  createProxyMiddleware({
    target: getServiceUrl('auth'),
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${req.correlationId} - Auth Service:`, err.message);
      res.status(503).json({
        success: false,
        message: 'Auth Service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
  })
);

// ===== ADMIN ROUTES PROXY (Doctor Service) =====
app.use(
  '/api/admin/doctors',
  verifyToken,
  createProxyMiddleware({
    target: getServiceUrl('doctor'),
    changeOrigin: true,
    pathRewrite: { '^/api/admin/doctors': '/api/admin/doctors' },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${req.correlationId} - Doctor Service (Admin):`, err.message);
      res.status(503).json({
        success: false,
        message: 'Doctor Service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
  })
);

// ===== ADMIN ROUTES PROXY (Auth Service) =====
app.use(
  '/api/admin',
  verifyToken,
  createProxyMiddleware({
    target: getServiceUrl('auth'),
    changeOrigin: true,
    pathRewrite: { '^/api/admin': '/api/admin' },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${req.correlationId} - Auth Service (Admin):`, err.message);
      res.status(503).json({
        success: false,
        message: 'Auth Service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
  })
);

// ===== PATIENT SERVICE PROXY (Protected) =====
app.use(
  '/api/patients',
  verifyToken,
  createProxyMiddleware({
    target: getServiceUrl('patient'),
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${req.correlationId} - Patient Service:`, err.message);
      res.status(503).json({
        success: false,
        message: 'Patient Service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
  })
);

// ===== DOCTOR SERVICE PROXY =====
app.use(
  '/api/doctors',
  createProxyMiddleware({
    target: getServiceUrl('doctor'),
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${req.correlationId} - Doctor Service:`, err.message);
      res.status(503).json({
        success: false,
        message: 'Doctor Service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
  })
);

// ===== APPOINTMENT SERVICE PROXY (Protected) =====
app.use(
  '/api/appointments',
  verifyToken,
  createProxyMiddleware({
    target: getServiceUrl('appointment'),
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${req.correlationId} - Appointment Service:`, err.message);
      res.status(503).json({
        success: false,
        message: 'Appointment Service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
  })
);

// ===== CONSULTATION SERVICE PROXY (Protected) =====
app.use(
  '/api/consultations',
  verifyToken,
  createProxyMiddleware({
    target: getServiceUrl('consultation'),
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${req.correlationId} - Consultation Service:`, err.message);
      res.status(503).json({
        success: false,
        message: 'Consultation Service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
  })
);

// ===== PRESCRIPTION SERVICE PROXY (Protected) =====
app.use(
  '/api/prescriptions',
  verifyToken,
  createProxyMiddleware({
    target: getServiceUrl('consultation'),
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${req.correlationId} - Prescription (Consultation) Service:`, err.message);
      res.status(503).json({
        success: false,
        message: 'Consultation Service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
  })
);

// ===== AI ASSISTANT PROXY =====
app.use(
  '/api/ai-assistant',
  createProxyMiddleware({
    target: getServiceUrl('consultation'),
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${req.correlationId} - AI Assistant (Consultation) Service:`, err.message);
      res.status(503).json({
        success: false,
        message: 'Consultation Service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
  })
);

// ===== PAYMENT SERVICE PROXY =====
app.use(
  '/api/payments',
  createProxyMiddleware({
    target: getServiceUrl('payment'),
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${req.correlationId} - Payment Service:`, err.message);
      res.status(503).json({
        success: false,
        message: 'Payment Service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
  })
);

// ===== NOTIFICATION SERVICE PROXY =====
app.use(
  '/api/notifications',
  createProxyMiddleware({
    target: getServiceUrl('notification'),
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${req.correlationId} - Notification Service:`, err.message);
      res.status(503).json({
        success: false,
        message: 'Notification Service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
  })
);

// ===== LOCAL ROUTES BODY PARSING =====
// Added after proxies to prevent hanging on proxied POST requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== 404 AND ERROR HANDLING =====
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
