import { Router } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService';
import { authenticateToken, authRateLimiter } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR', 'ANALYTICS_USER', 'WORKER']),
  factoryId: z.string().optional(),
  tenantId: z.string().min(1, 'Tenant ID is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

// POST /api/auth/login
router.post('/login', authRateLimiter, asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);
  
  const result = await authService.login(validatedData);
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      tokens: result.tokens,
    },
  });
}));

// POST /api/auth/register
router.post('/register', authRateLimiter, asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);
  
  const result = await authService.register(validatedData);
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: result.user,
      tokens: result.tokens,
    },
  });
}));

// POST /api/auth/refresh
router.post('/refresh', asyncHandler(async (req, res) => {
  const validatedData = refreshTokenSchema.parse(req.body);
  
  const tokens = await authService.refreshToken(validatedData.refreshToken);
  
  res.json({
    success: true,
    message: 'Token refreshed successfully',
    data: { tokens },
  });
}));

// POST /api/auth/logout
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  const validatedData = refreshTokenSchema.parse(req.body);
  
  await authService.logout(validatedData.refreshToken);
  
  res.json({
    success: true,
    message: 'Logout successful',
  });
}));

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, asyncHandler(async (req, res) => {
  const validatedData = changePasswordSchema.parse(req.body);
  
  await authService.changePassword(
    req.user!.id,
    validatedData.currentPassword,
    validatedData.newPassword
  );
  
  res.json({
    success: true,
    message: 'Password changed successfully',
  });
}));

// POST /api/auth/forgot-password
router.post('/forgot-password', authRateLimiter, asyncHandler(async (req, res) => {
  const validatedData = resetPasswordSchema.parse(req.body);
  
  await authService.resetPassword(validatedData.email);
  
  res.json({
    success: true,
    message: 'If the email exists, a password reset link has been sent',
  });
}));

// POST /api/auth/verify-email
router.post('/verify-email', authenticateToken, asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.user!.id);
  
  res.json({
    success: true,
    message: 'Email verified successfully',
  });
}));

// GET /api/auth/me
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user!.id);
  
  res.json({
    success: true,
    data: { user },
  });
}));

// GET /api/auth/validate
router.get('/validate', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user!.id,
        email: req.user!.email,
        role: req.user!.role,
        tenantId: req.user!.tenantId,
        factoryId: req.user!.factoryId,
      },
    },
  });
}));

export default router;
