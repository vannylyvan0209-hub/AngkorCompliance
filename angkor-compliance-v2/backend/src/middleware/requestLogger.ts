import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

// Request logging middleware
export const requestLogger = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;

  // Override res.send to capture response data
  res.send = function (body) {
    const duration = Date.now() - startTime;
    
    // Log request details
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${logData.method} ${logData.url} - ${logData.statusCode} (${logData.duration})`);
    }

    // Log to database for audit trail (only for authenticated users and important operations)
    if (req.user && shouldLogToDatabase(req)) {
      logToDatabase(logData, req, res).catch(error => {
        console.error('Failed to log request to database:', error);
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

// Determine if request should be logged to database
const shouldLogToDatabase = (req: Request): boolean => {
  // Skip logging for health checks and static assets
  if (req.originalUrl === '/health' || req.originalUrl.startsWith('/static/')) {
    return false;
  }

  // Log all authenticated requests for audit purposes
  if (req.user) {
    return true;
  }

  // Log important public endpoints
  const importantEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
  ];

  return importantEndpoints.some(endpoint => req.originalUrl.startsWith(endpoint));
};

// Log request to database
const logToDatabase = async (logData: any, req: Request, res: Response) => {
  try {
    await prisma.auditLog.create({
      data: {
        action: `${req.method} ${req.originalUrl}`,
        resource: req.originalUrl,
        resourceId: req.params.id || null,
        oldValues: null,
        newValues: {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration: logData.duration,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        },
        metadata: {
          query: req.query,
          body: sanitizeRequestBody(req.body),
          headers: sanitizeHeaders(req.headers),
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

// Sanitize request body to remove sensitive information
const sanitizeRequestBody = (body: any): any => {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
};

// Sanitize headers to remove sensitive information
const sanitizeHeaders = (headers: any): any => {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  const sanitized = { ...headers };

  for (const header of sensitiveHeaders) {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  }

  return sanitized;
};

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    // Log slow requests
    if (duration > 1000) { // More than 1 second
      console.warn(`Slow request detected: ${req.method} ${req.originalUrl} took ${duration.toFixed(2)}ms`);
    }

    // Log to metrics service if configured
    if (process.env.METRICS_ENABLED === 'true') {
      // TODO: Send metrics to monitoring service
      console.log(`Metrics: ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
    }
  });

  next();
};

// Request ID middleware
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

// Generate unique request ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};
