import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { auditService } from '../services/auditService';
import { AuditType, AuditStatus } from '@prisma/client';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createAuditSchema = z.object({
  title: z.string().min(1, 'Audit title is required'),
  type: z.nativeEnum(AuditType),
  standard: z.string().min(1, 'Standard is required'),
  scope: z.string().min(1, 'Scope is required'),
  objectives: z.string().min(1, 'Objectives are required'),
  methodology: z.string().min(1, 'Methodology is required'),
  factoryId: z.string().min(1, 'Factory ID is required'),
  plannedStartDate: z.string().transform(str => new Date(str)),
  plannedEndDate: z.string().transform(str => new Date(str)),
  auditorIds: z.array(z.string()).min(1, 'At least one auditor is required'),
  witnessIds: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateAuditSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.nativeEnum(AuditType).optional(),
  standard: z.string().min(1).optional(),
  scope: z.string().min(1).optional(),
  objectives: z.string().min(1).optional(),
  methodology: z.string().min(1).optional(),
  status: z.nativeEnum(AuditStatus).optional(),
  actualStartDate: z.string().transform(str => new Date(str)).optional(),
  actualEndDate: z.string().transform(str => new Date(str)).optional(),
  score: z.number().min(0).max(100).optional(),
  summary: z.string().optional(),
  recommendations: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const auditFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(AuditType).optional(),
  status: z.nativeEnum(AuditStatus).optional(),
  standard: z.string().optional(),
  factoryId: z.string().optional(),
  auditorId: z.string().optional(),
  dateFrom: z.string().transform(str => new Date(str)).optional(),
  dateTo: z.string().transform(str => new Date(str)).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const createFindingSchema = z.object({
  title: z.string().min(1, 'Finding title is required'),
  description: z.string().min(1, 'Description is required'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  category: z.string().min(1, 'Category is required'),
  requirement: z.string().min(1, 'Requirement is required'),
  evidence: z.string().min(1, 'Evidence is required'),
  rootCause: z.string().optional(),
  impact: z.string().optional(),
  recommendation: z.string().optional(),
});

const createCorrectiveActionSchema = z.object({
  title: z.string().min(1, 'Action title is required'),
  description: z.string().min(1, 'Description is required'),
  actionType: z.enum(['IMMEDIATE', 'SHORT_TERM', 'LONG_TERM']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assignedToId: z.string().min(1, 'Assigned user ID is required'),
  dueDate: z.string().transform(str => new Date(str)),
  estimatedCost: z.number().optional(),
  resources: z.string().optional(),
  verificationMethod: z.string().optional(),
});

const completeAuditSchema = z.object({
  score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
  summary: z.string().min(1, 'Summary is required'),
  recommendations: z.string().min(1, 'Recommendations are required'),
});

// GET /api/audits
router.get('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const filters = auditFiltersSchema.parse(req.query);
  const result = await auditService.getAudits(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/audits/stats
router.get('/stats', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const factoryId = req.query.factoryId as string;
  const stats = await auditService.getAuditStats(factoryId, req.user!.id);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/audits/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const audit = await auditService.getAuditById(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: audit,
  });
}));

// POST /api/audits
router.post('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const validatedData = createAuditSchema.parse(req.body);
  const audit = await auditService.createAudit(validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Audit created successfully',
    data: audit,
  });
}));

// PUT /api/audits/:id
router.put('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const validatedData = updateAuditSchema.parse(req.body);
  const audit = await auditService.updateAudit(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'Audit updated successfully',
    data: audit,
  });
}));

// POST /api/audits/:id/start
router.post('/:id/start', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const audit = await auditService.startAudit(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Audit started successfully',
    data: audit,
  });
}));

// POST /api/audits/:id/complete
router.post('/:id/complete', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const validatedData = completeAuditSchema.parse(req.body);
  const audit = await auditService.completeAudit(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'Audit completed successfully',
    data: audit,
  });
}));

// POST /api/audits/:id/findings
router.post('/:id/findings', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const validatedData = createFindingSchema.parse(req.body);
  const finding = await auditService.createAuditFinding(req.params.id, validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Audit finding created successfully',
    data: finding,
  });
}));

// POST /api/audits/findings/:findingId/corrective-actions
router.post('/findings/:findingId/corrective-actions', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const validatedData = createCorrectiveActionSchema.parse(req.body);
  const correctiveAction = await auditService.createCorrectiveAction(req.params.findingId, validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Corrective action created successfully',
    data: correctiveAction,
  });
}));

export default router;