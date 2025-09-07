import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { grievanceService } from '../services/grievanceService';
import { GrievanceCategory, GrievanceSeverity, GrievanceStatus } from '@prisma/client';

const router = Router();

// Validation schemas
const createGrievanceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.nativeEnum(GrievanceCategory),
  severity: z.nativeEnum(GrievanceSeverity),
  factoryId: z.string().min(1, 'Factory ID is required'),
  department: z.string().optional(),
  line: z.string().optional(),
  shift: z.string().optional(),
  isAnonymous: z.boolean().default(false),
  workerId: z.string().optional(),
  contactInfo: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const updateGrievanceSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.nativeEnum(GrievanceCategory).optional(),
  severity: z.nativeEnum(GrievanceSeverity).optional(),
  status: z.nativeEnum(GrievanceStatus).optional(),
  assignedToId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  resolution: z.string().optional(),
  resolutionDate: z.string().transform(str => new Date(str)).optional(),
  metadata: z.record(z.any()).optional(),
});

const grievanceFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.nativeEnum(GrievanceCategory).optional(),
  severity: z.nativeEnum(GrievanceSeverity).optional(),
  status: z.nativeEnum(GrievanceStatus).optional(),
  factoryId: z.string().optional(),
  department: z.string().optional(),
  line: z.string().optional(),
  shift: z.string().optional(),
  assignedToId: z.string().optional(),
  isAnonymous: z.boolean().optional(),
  dateFrom: z.string().transform(str => new Date(str)).optional(),
  dateTo: z.string().transform(str => new Date(str)).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// GET /api/grievances (public endpoint for anonymous submissions)
router.get('/', asyncHandler(async (req, res) => {
  // Check if user is authenticated
  const userId = req.user?.id;
  
  if (!userId) {
    // Return basic public information
    return res.json({
      success: true,
      message: 'Grievance submission endpoint available',
      data: {
        categories: Object.values(GrievanceCategory),
        severities: Object.values(GrievanceSeverity),
      },
    });
  }

  // User is authenticated, return full data
  const filters = grievanceFiltersSchema.parse(req.query);
  const result = await grievanceService.getGrievances(filters, userId);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/grievances/stats
router.get('/stats', authenticateToken, requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'GRIEVANCE_COMMITTEE', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const factoryId = req.query.factoryId as string;
  const stats = await grievanceService.getGrievanceStats(factoryId, req.user!.id);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/grievances/:id
router.get('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'GRIEVANCE_COMMITTEE', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const grievance = await grievanceService.getGrievanceById(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: grievance,
  });
}));

// POST /api/grievances (public endpoint for anonymous submissions)
router.post('/', asyncHandler(async (req, res) => {
  const validatedData = createGrievanceSchema.parse(req.body);
  const userId = req.user?.id; // Will be undefined for anonymous submissions
  
  const grievance = await grievanceService.createGrievance(validatedData, userId);
  
  res.status(201).json({
    success: true,
    message: 'Grievance submitted successfully',
    data: {
      id: grievance.id,
      status: grievance.status,
      referenceNumber: grievance.id, // Use ID as reference number
    },
  });
}));

// PUT /api/grievances/:id
router.put('/:id', authenticateToken, requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'GRIEVANCE_COMMITTEE', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const validatedData = updateGrievanceSchema.parse(req.body);
  const grievance = await grievanceService.updateGrievance(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'Grievance updated successfully',
    data: grievance,
  });
}));

// POST /api/grievances/:id/assign
router.post('/:id/assign', authenticateToken, requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'GRIEVANCE_COMMITTEE']), asyncHandler(async (req, res) => {
  const { assignedToId } = req.body;
  
  if (!assignedToId) {
    return res.status(400).json({
      success: false,
      error: 'Assigned user ID is required',
    });
  }
  
  const grievance = await grievanceService.assignGrievance(req.params.id, assignedToId, req.user!.id);
  
  res.json({
    success: true,
    message: 'Grievance assigned successfully',
    data: grievance,
  });
}));

// POST /api/grievances/:id/resolve
router.post('/:id/resolve', authenticateToken, requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'GRIEVANCE_COMMITTEE', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const { resolution } = req.body;
  
  if (!resolution) {
    return res.status(400).json({
      success: false,
      error: 'Resolution is required',
    });
  }
  
  const grievance = await grievanceService.resolveGrievance(req.params.id, resolution, req.user!.id);
  
  res.json({
    success: true,
    message: 'Grievance resolved successfully',
    data: grievance,
  });
}));

// POST /api/grievances/:id/close
router.post('/:id/close', authenticateToken, requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'GRIEVANCE_COMMITTEE']), asyncHandler(async (req, res) => {
  const grievance = await grievanceService.closeGrievance(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Grievance closed successfully',
    data: grievance,
  });
}));

export default router;