import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { factoryService } from '../services/factoryService';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createFactorySchema = z.object({
  name: z.string().min(1, 'Factory name is required'),
  code: z.string().min(1, 'Factory code is required'),
  address: z.string().min(1, 'Address is required'),
  country: z.string().min(1, 'Country is required'),
  industry: z.string().min(1, 'Industry is required'),
  size: z.number().min(1, 'Factory size must be at least 1'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
});

const updateFactorySchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  industry: z.string().min(1).optional(),
  size: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
});

const factoryFiltersSchema = z.object({
  search: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// GET /api/factories
router.get('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const filters = factoryFiltersSchema.parse(req.query);
  const result = await factoryService.getFactories(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/factories/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const factory = await factoryService.getFactoryById(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: factory,
  });
}));

// GET /api/factories/:id/stats
router.get('/:id/stats', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const stats = await factoryService.getFactoryStats(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/factories/:id/compliance
router.get('/:id/compliance', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const compliance = await factoryService.getFactoryComplianceOverview(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: compliance,
  });
}));

// POST /api/factories
router.post('/', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const validatedData = createFactorySchema.parse(req.body);
  const factory = await factoryService.createFactory(validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Factory created successfully',
    data: factory,
  });
}));

// PUT /api/factories/:id
router.put('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const validatedData = updateFactorySchema.parse(req.body);
  const factory = await factoryService.updateFactory(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'Factory updated successfully',
    data: factory,
  });
}));

// DELETE /api/factories/:id
router.delete('/:id', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  await factoryService.deleteFactory(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Factory deleted successfully',
  });
}));

export default router;
