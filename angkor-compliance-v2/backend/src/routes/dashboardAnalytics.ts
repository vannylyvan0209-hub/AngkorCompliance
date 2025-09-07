import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { dashboardAnalyticsService } from '../services/dashboardAnalyticsService';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const dashboardFiltersSchema = z.object({
  tenantId: z.string().optional(),
  factoryId: z.string().optional(),
  dateFrom: z.string().transform(str => new Date(str)).optional(),
  dateTo: z.string().transform(str => new Date(str)).optional(),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
});

// GET /api/dashboard/summary
router.get('/summary', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const filters = dashboardFiltersSchema.parse(req.query);
  const summary = await dashboardAnalyticsService.getDashboardSummary(filters, req.user!.id);
  
  res.json({
    success: true,
    data: summary,
  });
}));

// GET /api/dashboard/kpis
router.get('/kpis', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = dashboardFiltersSchema.parse(req.query);
  const kpis = await dashboardAnalyticsService.getDashboardKPIs(filters, req.user!.id);
  
  res.json({
    success: true,
    data: kpis,
  });
}));

// GET /api/dashboard/compliance
router.get('/compliance', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'AUDITOR']), asyncHandler(async (req, res) => {
  const filters = dashboardFiltersSchema.parse(req.query);
  const compliance = await dashboardAnalyticsService.getComplianceOverview(filters, req.user!.id);
  
  res.json({
    success: true,
    data: compliance,
  });
}));

// GET /api/dashboard/audits
router.get('/audits', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'AUDITOR']), asyncHandler(async (req, res) => {
  const filters = dashboardFiltersSchema.parse(req.query);
  const audits = await dashboardAnalyticsService.getAuditOverview(filters, req.user!.id);
  
  res.json({
    success: true,
    data: audits,
  });
}));

// GET /api/dashboard/grievances
router.get('/grievances', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE']), asyncHandler(async (req, res) => {
  const filters = dashboardFiltersSchema.parse(req.query);
  const grievances = await dashboardAnalyticsService.getGrievanceOverview(filters, req.user!.id);
  
  res.json({
    success: true,
    data: grievances,
  });
}));

// GET /api/dashboard/training
router.get('/training', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = dashboardFiltersSchema.parse(req.query);
  const training = await dashboardAnalyticsService.getTrainingOverview(filters, req.user!.id);
  
  res.json({
    success: true,
    data: training,
  });
}));

// GET /api/dashboard/permits
router.get('/permits', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = dashboardFiltersSchema.parse(req.query);
  const permits = await dashboardAnalyticsService.getPermitOverview(filters, req.user!.id);
  
  res.json({
    success: true,
    data: permits,
  });
}));

// GET /api/dashboard/users
router.get('/users', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const filters = dashboardFiltersSchema.parse(req.query);
  const users = await dashboardAnalyticsService.getUserOverview(filters, req.user!.id);
  
  res.json({
    success: true,
    data: users,
  });
}));

export default router;
