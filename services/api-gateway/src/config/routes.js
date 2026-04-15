/**
 * Route definitions for API Gateway
 * Maps gateway routes to backend services
 */

export const routes = {
  // ===== AUTH SERVICE ROUTES =====
  'POST /api/auth/register': {
    service: 'auth',
    path: '/api/auth/register',
    requireAuth: false,
    rateLimiter: 'auth'
  },
  'POST /api/auth/login': {
    service: 'auth',
    path: '/api/auth/login',
    requireAuth: false,
    rateLimiter: 'auth'
  },
  'POST /api/auth/refresh': {
    service: 'auth',
    path: '/api/auth/refresh',
    requireAuth: false,
    rateLimiter: 'general'
  },
  'GET /api/auth/health': {
    service: 'auth',
    path: '/api/auth/health',
    requireAuth: false,
    rateLimiter: 'none'
  },

  // ===== PATIENT SERVICE ROUTES =====
  'GET /api/patients': {
    service: 'patient',
    path: '/api/patients',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'GET /api/patients/:id': {
    service: 'patient',
    path: '/api/patients/:id',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'POST /api/patients': {
    service: 'patient',
    path: '/api/patients',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'PUT /api/patients/:id': {
    service: 'patient',
    path: '/api/patients/:id',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'DELETE /api/patients/:id': {
    service: 'patient',
    path: '/api/patients/:id',
    requireAuth: true,
    rateLimiter: 'api'
  },

  // ===== DOCTOR SERVICE ROUTES =====
  'GET /api/doctors': {
    service: 'doctor',
    path: '/api/doctors',
    requireAuth: false,
    rateLimiter: 'general'
  },
  'GET /api/doctors/:id': {
    service: 'doctor',
    path: '/api/doctors/:id',
    requireAuth: false,
    rateLimiter: 'general'
  },
  'POST /api/doctors/register': {
    service: 'doctor',
    path: '/api/doctors/register',
    requireAuth: false,
    rateLimiter: 'api'
  },
  'PUT /api/doctors/:id': {
    service: 'doctor',
    path: '/api/doctors/:id',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'PUT /api/doctors/:id/verify': {
    service: 'doctor',
    path: '/api/doctors/:id/verify',
    requireAuth: true,
    allowedRoles: ['admin'],
    rateLimiter: 'api'
  },

  // ===== APPOINTMENT SERVICE ROUTES =====
  'GET /api/appointments': {
    service: 'appointment',
    path: '/api/appointments',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'GET /api/appointments/:id': {
    service: 'appointment',
    path: '/api/appointments/:id',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'POST /api/appointments': {
    service: 'appointment',
    path: '/api/appointments',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'PUT /api/appointments/:id': {
    service: 'appointment',
    path: '/api/appointments/:id',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'DELETE /api/appointments/:id': {
    service: 'appointment',
    path: '/api/appointments/:id',
    requireAuth: true,
    rateLimiter: 'api'
  },

  // ===== CONSULTATION SERVICE ROUTES =====
  'GET /api/consultations': {
    service: 'consultation',
    path: '/api/consultations',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'POST /api/consultations': {
    service: 'consultation',
    path: '/api/consultations',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'POST /api/consultations/ai-assistant': {
    service: 'consultation',
    path: '/api/consultations/ai-assistant',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'GET /api/consultations/:id': {
    service: 'consultation',
    path: '/api/consultations/:id',
    requireAuth: true,
    rateLimiter: 'api'
  },

  // ===== PAYMENT SERVICE ROUTES =====
  'POST /api/payments': {
    service: 'payment',
    path: '/api/payments',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'GET /api/payments/:id': {
    service: 'payment',
    path: '/api/payments/:id',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'POST /api/payments/payhere/notify': {
    service: 'payment',
    path: '/api/payments/payhere/notify',
    requireAuth: false,
    rateLimiter: 'none'
  },

  // ===== NOTIFICATION SERVICE ROUTES =====
  'GET /api/notifications/:userId': {
    service: 'notification',
    path: '/api/notifications/:userId',
    requireAuth: true,
    rateLimiter: 'api'
  },
  'POST /api/notifications/doctor-registration': {
    service: 'notification',
    path: '/api/notifications/doctor-registration',
    requireAuth: false,
    rateLimiter: 'none'
  },
  'POST /api/notifications/appointment-booked': {
    service: 'notification',
    path: '/api/notifications/appointment-booked',
    requireAuth: false,
    rateLimiter: 'none'
  },
  'POST /api/notifications/appointment-cancelled': {
    service: 'notification',
    path: '/api/notifications/appointment-cancelled',
    requireAuth: false,
    rateLimiter: 'none'
  },
  'POST /api/notifications/consultation-completed': {
    service: 'notification',
    path: '/api/notifications/consultation-completed',
    requireAuth: false,
    rateLimiter: 'none'
  },
  'POST /api/notifications/payment-received': {
    service: 'notification',
    path: '/api/notifications/payment-received',
    requireAuth: false,
    rateLimiter: 'none'
  }
};

/**
 * Get route definition by pattern
 */
export const getRouteDefinition = (method, path) => {
  const key = `${method} ${path}`;
  return routes[key];
};

/**
 * Get all routes
 */
export const getAllRoutes = () => {
  return Object.entries(routes).map(([key, value]) => ({
    key,
    ...value
  }));
};
