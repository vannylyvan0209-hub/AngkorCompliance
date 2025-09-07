import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { correctiveActionService } from '../services/correctiveActionService';
import { ActionStatus, ActionPriority, ActionType } from '@prisma/client';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createCorrectiveActionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.nativeEnum(ActionType),
  priority: z.nativeEnum(ActionPriority),
  status: z.nativeEnum(ActionStatus).default(ActionStatus.PENDING),
  dueDate: z.string().transform(str => new Date(str)),
  assignedToId: z.string().min(1, 'Assigned user ID is required'),
  factoryId: z.string().min(1, 'Factory ID is required'),
  auditId: z.string().optional(),
  grievanceId: z.string().optional(),
  trainingId: z.string().optional(),
  permitId: z.string().optional(),
  complianceStandardId: z.string().optional(),
  requirementId: z.string().optional(),
  controlId: z.string().optional(),
  rootCause: z.string().min(1, 'Root cause is required'),
  correctiveMeasures: z.array(z.string()).min(1, 'At least one corrective measure is required'),
  preventiveMeasures: z.array(z.string()).min(1, 'At least one preventive measure is required'),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  estimatedDuration: z.number().min(0).optional(),
  actualDuration: z.number().min(0).optional(),
  evidenceRequired: z.array(z.string()).min(1, 'Evidence required is required'),
  verificationMethod: z.string().min(1, 'Verification method is required'),
  effectivenessReviewDate: z.string().transform(str => new Date(str)).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateCorrectiveActionSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  type: z.nativeEnum(ActionType).optional(),
  priority: z.nativeEnum(ActionPriority).optional(),
  status: z.nativeEnum(ActionStatus).optional(),
  dueDate: z.string().transform(str => new Date(str)).optional(),
  assignedToId: z.string().min(1).optional(),
  rootCause: z.string().min(1).optional(),
  correctiveMeasures: z.array(z.string()).optional(),
  preventiveMeasures: z.array(z.string()).optional(),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  estimatedDuration: z.number().min(0).optional(),
  actualDuration: z.number().min(0).optional(),
  evidenceRequired: z.array(z.string()).optional(),
  verificationMethod: z.string().min(1).optional(),
  effectivenessReviewDate: z.string().transform(str => new Date(str)).optional(),
  completedAt: z.string().transform(str => new Date(str)).optional(),
  verifiedAt: z.string().transform(str => new Date(str)).optional(),
  metadata: z.record(z.any()).optional(),
});

const correctiveActionFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(ActionStatus).optional(),
  priority: z.nativeEnum(ActionPriority).optional(),
  type: z.nativeEnum(ActionType).optional(),
  assignedToId: z.string().optional(),
  factoryId: z.string().optional(),
  auditId: z.string().optional(),
  grievanceId: z.string().optional(),
  trainingId: z.string().optional(),
  permitId: z.string().optional(),
  complianceStandardId: z.string().optional(),
  dueDateFrom: z.string().transform(str => new Date(str)).optional(),
  dueDateTo: z.string().transform(str => new Date(str)).optional(),
  overdue: z.boolean().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const createEffectivenessReviewSchema = z.object({
  actionId: z.string().min(1, 'Action ID is required'),
  reviewDate: z.string().transform(str => new Date(str)),
  isEffective: z.boolean(),
  effectivenessScore: z.number().min(0).max(100, 'Effectiveness score must be between 0 and 100'),
  reviewComments: z.string().min(1, 'Review comments are required'),
  reviewerId: z.string().min(1, 'Reviewer ID is required'),
  followUpActions: z.array(z.string()).optional(),
  nextReviewDate: z.string().transform(str => new Date(str)).optional(),
});

// GET /api/corrective-actions
router.get('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = correctiveActionFiltersSchema.parse(req.query);
  const result = await correctiveActionService.getCorrectiveActions(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/corrective-actions/stats
router.get('/stats', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const stats = await correctiveActionService.getCorrectiveActionStats(req.user!.id);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/corrective-actions/overdue
router.get('/overdue', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = { ...correctiveActionFiltersSchema.parse(req.query), overdue: true };
  const result = await correctiveActionService.getCorrectiveActions(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/corrective-actions/due-this-week
router.get('/due-this-week', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const filters = {
    ...correctiveActionFiltersSchema.parse(req.query),
    dueDateFrom: now,
    dueDateTo: nextWeek,
  };
  const result = await correctiveActionService.getCorrectiveActions(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/corrective-actions/due-this-month
router.get('/due-this-month', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const filters = {
    ...correctiveActionFiltersSchema.parse(req.query),
    dueDateFrom: now,
    dueDateTo: nextMonth,
  };
  const result = await correctiveActionService.getCorrectiveActions(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/corrective-actions/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const correctiveAction = await correctiveActionService.getCorrectiveActionById(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: correctiveAction,
  });
}));

// POST /api/corrective-actions
router.post('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const validatedData = createCorrectiveActionSchema.parse(req.body);
  const correctiveAction = await correctiveActionService.createCorrectiveAction(validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Corrective action created successfully',
    data: correctiveAction,
  });
}));

// PUT /api/corrective-actions/:id
router.put('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const validatedData = updateCorrectiveActionSchema.parse(req.body);
  const correctiveAction = await correctiveActionService.updateCorrectiveAction(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'Corrective action updated successfully',
    data: correctiveAction,
  });
}));

// POST /api/corrective-actions/:id/start
router.post('/:id/start', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const correctiveAction = await correctiveActionService.startCorrectiveAction(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Corrective action started successfully',
    data: correctiveAction,
  });
}));

// POST /api/corrective-actions/:id/complete
router.post('/:id/complete', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const correctiveAction = await correctiveActionService.completeCorrectiveAction(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Corrective action completed successfully',
    data: correctiveAction,
  });
}));

// POST /api/corrective-actions/:id/verify
router.post('/:id/verify', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const correctiveAction = await correctiveActionService.verifyCorrectiveAction(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Corrective action verified successfully',
    data: correctiveAction,
  });
}));

// POST /api/corrective-actions/effectiveness-reviews
router.post('/effectiveness-reviews', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const validatedData = createEffectivenessReviewSchema.parse(req.body);
  const review = await correctiveActionService.createEffectivenessReview(validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Effectiveness review created successfully',
    data: review,
  });
}));

export default router;
