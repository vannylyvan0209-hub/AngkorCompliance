import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { activityLoggingService } from '../services/activityLoggingService';
import { ActivityType } from '@prisma/client';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createActivitySchema = z.object({
  type: z.nativeEnum(ActivityType),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  resource: z.string().min(1, 'Resource is required'),
  resourceType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  userId: z.string().optional(),
  tenantId: z.string().optional(),
  factoryId: z.string().optional(),
});

const activityFiltersSchema = z.object({
  type: z.nativeEnum(ActivityType).optional(),
  userId: z.string().optional(),
  tenantId: z.string().optional(),
  factoryId: z.string().optional(),
  resourceType: z.string().optional(),
  resource: z.string().optional(),
  dateFrom: z.string().transform(str => new Date(str)).optional(),
  dateTo: z.string().transform(str => new Date(str)).optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// GET /api/activities
router.get('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const filters = activityFiltersSchema.parse(req.query);
  const result = await activityLoggingService.getActivities(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/activities/stats
router.get('/stats', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const stats = await activityLoggingService.getActivityStats(req.user!.id);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/activities/summary
router.get('/summary', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const summary = await activityLoggingService.getActivitySummary(req.user!.id);
  
  res.json({
    success: true,
    data: summary,
  });
}));

// GET /api/activities/types
router.get('/types', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const types = await activityLoggingService.getActivityTypes();
  
  res.json({
    success: true,
    data: types,
  });
}));

// GET /api/activities/recent
router.get('/recent', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const filters = { ...activityFiltersSchema.parse(req.query), sortBy: 'createdAt', sortOrder: 'desc' as const };
  const result = await activityLoggingService.getActivities(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/activities/today
router.get('/today', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const filters = {
    ...activityFiltersSchema.parse(req.query),
    dateFrom: today,
    dateTo: tomorrow,
  };
  const result = await activityLoggingService.getActivities(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/activities/this-week
router.get('/this-week', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const filters = {
    ...activityFiltersSchema.parse(req.query),
    dateFrom: weekAgo,
  };
  const result = await activityLoggingService.getActivities(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/activities/this-month
router.get('/this-month', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const monthAgo = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const filters = {
    ...activityFiltersSchema.parse(req.query),
    dateFrom: monthAgo,
  };
  const result = await activityLoggingService.getActivities(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/activities/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const activity = await activityLoggingService.getActivityById(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: activity,
  });
}));

// GET /api/activities/user/:userId
router.get('/user/:userId', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = activityFiltersSchema.parse(req.query);
  const result = await activityLoggingService.getActivitiesByUser(req.params.userId, filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/activities/resource/:resourceType/:resource
router.get('/resource/:resourceType/:resource', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const filters = activityFiltersSchema.parse(req.query);
  const result = await activityLoggingService.getActivitiesByResource(
    req.params.resource,
    req.params.resourceType,
    filters,
    req.user!.id
  );
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// POST /api/activities
router.post('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const validatedData = createActivitySchema.parse(req.body);
  const activity = await activityLoggingService.createActivity(validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Activity logged successfully',
    data: activity,
  });
}));

// POST /api/activities/export
router.post('/export', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = activityFiltersSchema.parse(req.body);
  const exportData = await activityLoggingService.exportActivities(filters, req.user!.id);
  
  res.json({
    success: true,
    message: 'Activities exported successfully',
    data: exportData,
  });
}));

// DELETE /api/activities/cleanup
router.delete('/cleanup', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const daysToKeep = parseInt(req.query.days as string) || 365;
  const deletedCount = await activityLoggingService.cleanupOldActivities(daysToKeep);
  
  res.json({
    success: true,
    message: `Cleaned up ${deletedCount} old activities`,
    data: { deletedCount, daysToKeep },
  });
}));

export default router;
