import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       API Gateway - Smart Healthcare Platform              ║
╚════════════════════════════════════════════════════════════╝
  
  🚀 Server running in ${NODE_ENV} mode
  🌐 API Gateway listening on port ${PORT}
  🔗 Base URL: http://localhost:${PORT}
  
  📍 Available Endpoints:
    - Health Check: GET /health
    - Gateway Info: GET /api/gateway/info
    - Services List: GET /api/gateway/services
    - Routes List: GET /api/gateway/routes
  
  🔐 Secure Endpoints (require JWT):
    - /api/patients/*
    - /api/appointments/*
    - /api/consultations/*
  
  📡 Public Endpoints:
    - /api/auth/* (login, register, refresh)
    - /api/doctors/* (list, register)
    - /api/payments/* (PayHere webhook)
    - /api/notifications/* (internal notifications)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
