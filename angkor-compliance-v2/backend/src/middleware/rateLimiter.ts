import { Request, Response, NextFunction } from 'express';
import { redis } from '../index';
import { createRateLimitError } from './errorHandler';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Default rate limit configuration
const defaultConfig: RateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later',
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

// Rate limiter middleware
export const rateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = `rate_limit:${req.ip}`;
      const window = Math.floor(Date.now() / finalConfig.windowMs);
      const windowKey = `${key}:${window}`;

      // Get current request count for this window
      const currentCount = await redis.get(windowKey);
      const count = currentCount ? parseInt(currentCount) : 0;

      // Check if limit exceeded
      if (count >= finalConfig.maxRequests) {
        const error = createRateLimitError(finalConfig.message);
        return next(error);
      }

      // Increment counter
      await redis.incr(windowKey);
      await redis.expire(windowKey, Math.ceil(finalConfig.windowMs / 1000));

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': finalConfig.maxRequests.toString(),
        'X-RateLimit-Remaining': Math.max(0, finalConfig.maxRequests - count - 1).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + finalConfig.windowMs).toISOString(),
      });

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // If Redis is down, allow the request to proceed
      next();
    }
  };
};

// Strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later',
});

// General API rate limiter
export const apiRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many API requests, please try again later',
});

// File upload rate limiter
export const uploadRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 uploads per hour
  message: 'Too many file uploads, please try again later',
});

// Password reset rate limiter
export const passwordResetRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again later',
});

// User registration rate limiter
export const registrationRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 registrations per hour per IP
  message: 'Too many registration attempts, please try again later',
});

// Email verification rate limiter
export const emailVerificationRateLimiter = rateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 3, // 3 verification attempts per 5 minutes
  message: 'Too many email verification attempts, please try again later',
});

// Admin operations rate limiter
export const adminRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 admin operations per minute
  message: 'Too many admin operations, please slow down',
});

// Search rate limiter
export const searchRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 searches per minute
  message: 'Too many search requests, please try again later',
});

// Export default rate limiter
export default rateLimiter();
