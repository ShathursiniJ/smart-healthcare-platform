import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Verify JWT token from Authorization header
 * Ensures user is authenticated before accessing protected routes
 */
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please authenticate first.',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Verify token for optional auth (doesn't fail if no token)
 * Useful for routes that work with or without auth
 */
export const verifyTokenOptional = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid but optional, just continue
    }
  }

  next();
};

/**
 * Verify token and check user role
 * Ensures user has required role for the endpoint
 */
export const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }
  };
};

/**
 * Add correlation ID to request for tracking
 */
export const correlationId = (req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || `${Date.now()}-${Math.random()}`;
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
};
