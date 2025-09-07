import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { userManagementService } from '../services/userManagementService';
import { UserRole, UserStatus } from '@prisma/client';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  factoryId: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  employeeId: z.string().optional(),
  hireDate: z.string().transform(str => new Date(str)).optional(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  factoryId: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  employeeId: z.string().optional(),
  hireDate: z.string().transform(str => new Date(str)).optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'New password and confirmation do not match',
  path: ['confirmPassword'],
});

const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  factoryId: z.string().optional(),
  department: z.string().optional(),
  isActive: z.boolean().optional(),
  createdDateFrom: z.string().transform(str => new Date(str)).optional(),
  createdDateTo: z.string().transform(str => new Date(str)).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const assignRoleSchema = z.object({
  roleId: z.string().min(1, 'Role ID is required'),
});

// GET /api/users
router.get('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = userFiltersSchema.parse(req.query);
  const result = await userManagementService.getUsers(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/users/stats
router.get('/stats', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const stats = await userManagementService.getUserStats(req.user!.id);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/users/active
router.get('/active', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = { ...userFiltersSchema.parse(req.query), isActive: true };
  const result = await userManagementService.getUsers(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/users/inactive
router.get('/inactive', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = { ...userFiltersSchema.parse(req.query), isActive: false };
  const result = await userManagementService.getUsers(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/users/recent
router.get('/recent', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = { ...userFiltersSchema.parse(req.query), sortBy: 'createdAt', sortOrder: 'desc' as const };
  const result = await userManagementService.getUsers(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/users/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const user = await userManagementService.getUserById(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: user,
  });
}));

// GET /api/users/:id/activity
router.get('/:id/activity', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  
  const result = await userManagementService.getUserActivity(req.params.id, req.user!.id, page, limit);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// POST /api/users
router.post('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const validatedData = createUserSchema.parse(req.body);
  const user = await userManagementService.createUser(validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
}));

// PUT /api/users/:id
router.put('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const validatedData = updateUserSchema.parse(req.body);
  const user = await userManagementService.updateUser(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
}));

// POST /api/users/:id/change-password
router.post('/:id/change-password', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const validatedData = changePasswordSchema.parse(req.body);
  await userManagementService.changePassword(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'Password changed successfully',
  });
}));

// POST /api/users/:id/activate
router.post('/:id/activate', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const user = await userManagementService.activateUser(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'User activated successfully',
    data: user,
  });
}));

// POST /api/users/:id/deactivate
router.post('/:id/deactivate', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const user = await userManagementService.deactivateUser(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'User deactivated successfully',
    data: user,
  });
}));

// POST /api/users/:id/assign-role
router.post('/:id/assign-role', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const validatedData = assignRoleSchema.parse(req.body);
  await userManagementService.assignRoleToUser(req.params.id, validatedData.roleId, req.user!.id);
  
  res.json({
    success: true,
    message: 'Role assigned successfully',
  });
}));

// DELETE /api/users/:id/remove-role/:roleId
router.delete('/:id/remove-role/:roleId', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  await userManagementService.removeRoleFromUser(req.params.id, req.params.roleId, req.user!.id);
  
  res.json({
    success: true,
    message: 'Role removed successfully',
  });
}));

export default router;
