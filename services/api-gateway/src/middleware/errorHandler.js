/**
 * Global error handler middleware
 * Catches errors from all routes and returns consistent error response
 */
export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.correlationId}:`, {
    message: err.message,
    code: err.code,
    status: err.status || 500,
    path: req.path,
    method: req.method
  });

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(status).json({
    success: false,
    message,
    code,
    correlationId: req.correlationId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Not Found handler
 * Should be placed after all route definitions
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    code: 'NOT_FOUND',
    correlationId: req.correlationId
  });
};

/**
 * Request logger middleware
 * Logs incoming requests with correlation ID
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  console.log(`[REQUEST] ${req.correlationId}: ${req.method} ${req.path}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[RESPONSE] ${req.correlationId}: ${res.statusCode} - ${duration}ms`);
  });

  next();
};

/**
 * Request/Response logging with detailed info
 */
export const detailedLogger = (req, res, next) => {
  const start = Date.now();

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log(`  IP: ${req.ip}`);
  console.log(`  User: ${req.user?.id || 'Anonymous'}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`  Status: ${res.statusCode}`);
    console.log(`  Duration: ${duration}ms`);
  });

  next();
};
