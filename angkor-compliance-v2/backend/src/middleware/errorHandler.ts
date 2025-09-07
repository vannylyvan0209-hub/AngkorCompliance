import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Custom error class
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let details: any = undefined;

  // Log error for debugging
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle different types of errors
  if (error instanceof ZodError) {
    // Validation errors
    statusCode = 400;
    message = 'Validation failed';
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma database errors
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Resource already exists';
        details = {
          field: error.meta?.target,
          message: 'A record with this information already exists',
        };
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        details = {
          message: 'The requested resource does not exist',
        };
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid reference';
        details = {
          message: 'Referenced resource does not exist',
        };
        break;
      default:
        statusCode = 500;
        message = 'Database error';
        details = {
          code: error.code,
          message: 'An error occurred while processing your request',
        };
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Prisma validation errors
    statusCode = 400;
    message = 'Invalid data provided';
    details = {
      message: 'The data provided does not match the expected format',
    };
  } else if (error.name === 'JsonWebTokenError') {
    // JWT errors
    statusCode = 401;
    message = 'Invalid token';
    details = {
      message: 'The provided token is invalid or malformed',
    };
  } else if (error.name === 'TokenExpiredError') {
    // JWT expiration errors
    statusCode = 401;
    message = 'Token expired';
    details = {
      message: 'The provided token has expired',
    };
  } else if (error.name === 'MulterError') {
    // File upload errors
    statusCode = 400;
    message = 'File upload error';
    details = {
      message: error.message,
    };
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !error.isOperational) {
    message = 'Something went wrong';
    details = undefined;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }),
  });
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};

// Validation error helper
export const createValidationError = (message: string, field?: string) => {
  const error = new CustomError(message, 400);
  if (field) {
    (error as any).field = field;
  }
  return error;
};

// Authorization error helper
export const createAuthError = (message: string = 'Unauthorized') => {
  return new CustomError(message, 401);
};

// Forbidden error helper
export const createForbiddenError = (message: string = 'Forbidden') => {
  return new CustomError(message, 403);
};

// Not found error helper
export const createNotFoundError = (resource: string = 'Resource') => {
  return new CustomError(`${resource} not found`, 404);
};

// Conflict error helper
export const createConflictError = (message: string = 'Resource already exists') => {
  return new CustomError(message, 409);
};

// Rate limit error helper
export const createRateLimitError = (message: string = 'Too many requests') => {
  return new CustomError(message, 429);
};
