import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { tenantManagementService } from '../services/tenantManagementService';
import { TenantStatus, TenantPlan } from '@prisma/client';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createTenantSchema = z.object({
  name: z.string().min(1, 'Tenant name is required'),
  code: z.string().min(1, 'Tenant code is required'),
  description: z.string().optional(),
  status: z.nativeEnum(TenantStatus).default(TenantStatus.ACTIVE),
  plan: z.nativeEnum(TenantPlan),
  maxUsers: z.number().min(1, 'Max users must be at least 1'),
  maxFactories: z.number().min(1, 'Max factories must be at least 1'),
  maxStorageGB: z.number().min(1, 'Max storage must be at least 1 GB'),
  features: z.array(z.string()).default([]),
  settings: z.record(z.any()).default({}),
  billingEmail: z.string().email('Invalid billing email address'),
  contactEmail: z.string().email('Invalid contact email address'),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.string().min(1, 'Language is required'),
  currency: z.string().min(1, 'Currency is required'),
  metadata: z.record(z.any()).optional(),
});

const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(TenantStatus).optional(),
  plan: z.nativeEnum(TenantPlan).optional(),
  maxUsers: z.number().min(1).optional(),
  maxFactories: z.number().min(1).optional(),
  maxStorageGB: z.number().min(1).optional(),
  features: z.array(z.string()).optional(),
  settings: z.record(z.any()).optional(),
  billingEmail: z.string().email('Invalid billing email address').optional(),
  contactEmail: z.string().email('Invalid contact email address').optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
  currency: z.string().min(1).optional(),
  metadata: z.record(z.any()).optional(),
});

const tenantFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(TenantStatus).optional(),
  plan: z.nativeEnum(TenantPlan).optional(),
  country: z.string().optional(),
  createdDateFrom: z.string().transform(str => new Date(str)).optional(),
  createdDateTo: z.string().transform(str => new Date(str)).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const tenantConfigurationSchema = z.object({
  settings: z.record(z.any()).optional(),
  features: z.array(z.string()).optional(),
  limits: z.object({
    maxUsers: z.number().min(1).optional(),
    maxFactories: z.number().min(1).optional(),
    maxStorageGB: z.number().min(1).optional(),
  }).optional(),
  billing: z.object({
    plan: z.string().optional(),
    billingEmail: z.string().email().optional(),
    nextBillingDate: z.string().transform(str => new Date(str)).optional(),
  }).optional(),
  compliance: z.object({
    standards: z.array(z.string()).optional(),
    auditFrequency: z.string().optional(),
    reportingFrequency: z.string().optional(),
  }).optional(),
  notifications: z.object({
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    inAppEnabled: z.boolean().optional(),
  }).optional(),
});

// GET /api/tenants
router.get('/', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const filters = tenantFiltersSchema.parse(req.query);
  const result = await tenantManagementService.getTenants(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/tenants/stats
router.get('/stats', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const stats = await tenantManagementService.getTenantStats(req.user!.id);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/tenants/active
router.get('/active', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const filters = { ...tenantFiltersSchema.parse(req.query), status: TenantStatus.ACTIVE };
  const result = await tenantManagementService.getTenants(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/tenants/suspended
router.get('/suspended', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const filters = { ...tenantFiltersSchema.parse(req.query), status: TenantStatus.SUSPENDED };
  const result = await tenantManagementService.getTenants(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/tenants/recent
router.get('/recent', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const filters = { ...tenantFiltersSchema.parse(req.query), sortBy: 'createdAt', sortOrder: 'desc' as const };
  const result = await tenantManagementService.getTenants(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/tenants/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const tenant = await tenantManagementService.getTenantById(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: tenant,
  });
}));

// GET /api/tenants/:id/usage
router.get('/:id/usage', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const usage = await tenantManagementService.getTenantUsage(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: usage,
  });
}));

// GET /api/tenants/:id/configuration
router.get('/:id/configuration', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const configuration = await tenantManagementService.getTenantConfiguration(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: configuration,
  });
}));

// POST /api/tenants
router.post('/', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const validatedData = createTenantSchema.parse(req.body);
  const tenant = await tenantManagementService.createTenant(validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Tenant created successfully',
    data: tenant,
  });
}));

// PUT /api/tenants/:id
router.put('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const validatedData = updateTenantSchema.parse(req.body);
  const tenant = await tenantManagementService.updateTenant(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'Tenant updated successfully',
    data: tenant,
  });
}));

// POST /api/tenants/:id/activate
router.post('/:id/activate', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const tenant = await tenantManagementService.activateTenant(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Tenant activated successfully',
    data: tenant,
  });
}));

// POST /api/tenants/:id/suspend
router.post('/:id/suspend', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const tenant = await tenantManagementService.suspendTenant(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Tenant suspended successfully',
    data: tenant,
  });
}));

// PUT /api/tenants/:id/configuration
router.put('/:id/configuration', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const validatedData = tenantConfigurationSchema.parse(req.body);
  const configuration = await tenantManagementService.updateTenantConfiguration(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'Tenant configuration updated successfully',
    data: configuration,
  });
}));

export default router;
