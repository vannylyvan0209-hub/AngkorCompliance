import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { permitService } from '../services/permitService';
import { PermitType, PermitStatus } from '@prisma/client';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createPermitSchema = z.object({
  type: z.nativeEnum(PermitType),
  number: z.string().min(1, 'Permit number is required'),
  title: z.string().min(1, 'Permit title is required'),
  description: z.string().optional(),
  factoryId: z.string().min(1, 'Factory ID is required'),
  issuedBy: z.string().min(1, 'Issued by is required'),
  issuedDate: z.string().transform(str => new Date(str)),
  expiryDate: z.string().transform(str => new Date(str)),
  renewalRequired: z.boolean().default(true),
  renewalPeriod: z.number().min(1).optional(),
  requirements: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  contactInfo: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const updatePermitSchema = z.object({
  type: z.nativeEnum(PermitType).optional(),
  number: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  issuedBy: z.string().min(1).optional(),
  issuedDate: z.string().transform(str => new Date(str)).optional(),
  expiryDate: z.string().transform(str => new Date(str)).optional(),
  renewalRequired: z.boolean().optional(),
  renewalPeriod: z.number().min(1).optional(),
  requirements: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  contactInfo: z.string().optional(),
  status: z.nativeEnum(PermitStatus).optional(),
  metadata: z.record(z.any()).optional(),
});

const permitFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(PermitType).optional(),
  status: z.nativeEnum(PermitStatus).optional(),
  factoryId: z.string().optional(),
  issuedBy: z.string().optional(),
  expiryDateFrom: z.string().transform(str => new Date(str)).optional(),
  expiryDateTo: z.string().transform(str => new Date(str)).optional(),
  isExpiring: z.boolean().optional(),
  isExpired: z.boolean().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const renewPermitSchema = z.object({
  newExpiryDate: z.string().transform(str => new Date(str)),
  renewalNotes: z.string().optional(),
});

const revokePermitSchema = z.object({
  revocationReason: z.string().min(1, 'Revocation reason is required'),
});

// GET /api/permits
router.get('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = permitFiltersSchema.parse(req.query);
  const result = await permitService.getPermits(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/permits/stats
router.get('/stats', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const factoryId = req.query.factoryId as string;
  const stats = await permitService.getPermitStats(factoryId, req.user!.id);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/permits/expiring
router.get('/expiring', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = permitFiltersSchema.parse({ ...req.query, isExpiring: true });
  const result = await permitService.getPermits(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/permits/expired
router.get('/expired', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = permitFiltersSchema.parse({ ...req.query, isExpired: true });
  const result = await permitService.getPermits(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/permits/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const permit = await permitService.getPermitById(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: permit,
  });
}));

// POST /api/permits
router.post('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const validatedData = createPermitSchema.parse(req.body);
  const permit = await permitService.createPermit(validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Permit created successfully',
    data: permit,
  });
}));

// PUT /api/permits/:id
router.put('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const validatedData = updatePermitSchema.parse(req.body);
  const permit = await permitService.updatePermit(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'Permit updated successfully',
    data: permit,
  });
}));

// POST /api/permits/:id/renew
router.post('/:id/renew', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const validatedData = renewPermitSchema.parse(req.body);
  const permit = await permitService.renewPermit(
    req.params.id,
    validatedData.newExpiryDate,
    validatedData.renewalNotes,
    req.user!.id
  );
  
  res.json({
    success: true,
    message: 'Permit renewed successfully',
    data: permit,
  });
}));

// POST /api/permits/:id/revoke
router.post('/:id/revoke', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const validatedData = revokePermitSchema.parse(req.body);
  const permit = await permitService.revokePermit(
    req.params.id,
    validatedData.revocationReason,
    req.user!.id
  );
  
  res.json({
    success: true,
    message: 'Permit revoked successfully',
    data: permit,
  });
}));

export default router;
