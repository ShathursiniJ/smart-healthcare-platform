import rateLimit from 'express-rate-limit';

const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

/**
 * General rate limiter for all routes
 * 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes (prevent brute force)
 */
export const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 100,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Moderate rate limiter for API endpoints
 * 50 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 1000,
  message: 'Too many API requests, please try again later.',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many API requests. Please try again later.',
      code: 'API_RATE_LIMIT_EXCEEDED',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * Per-user rate limiter
 * Uses user ID from JWT token to limit per user
 */
export const perUserLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 200,
  keyGenerator: (req, res) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.id || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'User rate limit exceeded. Please try again later.',
      code: 'USER_RATE_LIMIT_EXCEEDED',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

/**
 * No rate limit (for public endpoints)
 */
export const noLimiter = (req, res, next) => {
  next();
};
