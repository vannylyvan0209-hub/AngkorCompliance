import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { trainingService } from '../services/trainingService';
import { TrainingType, TrainingStatus } from '@prisma/client';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createTrainingSchema = z.object({
  title: z.string().min(1, 'Training title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.nativeEnum(TrainingType),
  category: z.string().min(1, 'Category is required'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  factoryId: z.string().min(1, 'Factory ID is required'),
  department: z.string().optional(),
  targetAudience: z.array(z.string()).min(1, 'Target audience is required'),
  objectives: z.array(z.string()).min(1, 'Objectives are required'),
  prerequisites: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  assessmentRequired: z.boolean().default(false),
  passingScore: z.number().min(0).max(100).optional(),
  validityPeriod: z.number().min(1).optional(),
  instructorId: z.string().optional(),
  scheduledDate: z.string().transform(str => new Date(str)).optional(),
  location: z.string().optional(),
  maxParticipants: z.number().min(1).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateTrainingSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  type: z.nativeEnum(TrainingType).optional(),
  category: z.string().min(1).optional(),
  duration: z.number().min(1).optional(),
  department: z.string().optional(),
  targetAudience: z.array(z.string()).optional(),
  objectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  assessmentRequired: z.boolean().optional(),
  passingScore: z.number().min(0).max(100).optional(),
  validityPeriod: z.number().min(1).optional(),
  instructorId: z.string().optional(),
  scheduledDate: z.string().transform(str => new Date(str)).optional(),
  location: z.string().optional(),
  maxParticipants: z.number().min(1).optional(),
  status: z.nativeEnum(TrainingStatus).optional(),
  metadata: z.record(z.any()).optional(),
});

const trainingFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(TrainingType).optional(),
  category: z.string().optional(),
  status: z.nativeEnum(TrainingStatus).optional(),
  factoryId: z.string().optional(),
  department: z.string().optional(),
  instructorId: z.string().optional(),
  dateFrom: z.string().transform(str => new Date(str)).optional(),
  dateTo: z.string().transform(str => new Date(str)).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const createTrainingMaterialSchema = z.object({
  title: z.string().min(1, 'Material title is required'),
  type: z.enum(['DOCUMENT', 'VIDEO', 'PRESENTATION', 'QUIZ', 'OTHER']),
  content: z.string().optional(),
  filePath: z.string().optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  order: z.number().min(1, 'Order must be at least 1'),
  isRequired: z.boolean().default(false),
  estimatedTime: z.number().min(1).optional(),
});

const createTrainingAssessmentSchema = z.object({
  title: z.string().min(1, 'Assessment title is required'),
  description: z.string().min(1, 'Description is required'),
  questions: z.array(z.object({
    question: z.string().min(1, 'Question is required'),
    type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY']),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    points: z.number().min(1, 'Points must be at least 1'),
  })).min(1, 'At least one question is required'),
  passingScore: z.number().min(0).max(100, 'Passing score must be between 0 and 100'),
  timeLimit: z.number().min(1).optional(),
  attemptsAllowed: z.number().min(1, 'At least 1 attempt must be allowed'),
});

const scheduleTrainingSchema = z.object({
  scheduledDate: z.string().transform(str => new Date(str)),
  location: z.string().min(1, 'Location is required'),
});

const recordAttendanceSchema = z.object({
  attendedBy: z.string().min(1, 'Attended by user ID is required'),
});

// GET /api/trainings
router.get('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = trainingFiltersSchema.parse(req.query);
  const result = await trainingService.getTrainings(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/trainings/stats
router.get('/stats', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const factoryId = req.query.factoryId as string;
  const stats = await trainingService.getTrainingStats(factoryId, req.user!.id);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/trainings/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const training = await trainingService.getTrainingById(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: training,
  });
}));

// POST /api/trainings
router.post('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const validatedData = createTrainingSchema.parse(req.body);
  const training = await trainingService.createTraining(validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Training created successfully',
    data: training,
  });
}));

// PUT /api/trainings/:id
router.put('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const validatedData = updateTrainingSchema.parse(req.body);
  const training = await trainingService.updateTraining(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'Training updated successfully',
    data: training,
  });
}));

// POST /api/trainings/:id/schedule
router.post('/:id/schedule', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const validatedData = scheduleTrainingSchema.parse(req.body);
  const training = await trainingService.scheduleTraining(
    req.params.id,
    validatedData.scheduledDate,
    validatedData.location,
    req.user!.id
  );
  
  res.json({
    success: true,
    message: 'Training scheduled successfully',
    data: training,
  });
}));

// POST /api/trainings/:id/start
router.post('/:id/start', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const training = await trainingService.startTraining(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Training started successfully',
    data: training,
  });
}));

// POST /api/trainings/:id/complete
router.post('/:id/complete', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const training = await trainingService.completeTraining(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Training completed successfully',
    data: training,
  });
}));

// POST /api/trainings/:id/materials
router.post('/:id/materials', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const validatedData = createTrainingMaterialSchema.parse(req.body);
  const material = await trainingService.addTrainingMaterial(req.params.id, validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Training material added successfully',
    data: material,
  });
}));

// POST /api/trainings/:id/assessments
router.post('/:id/assessments', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const validatedData = createTrainingAssessmentSchema.parse(req.body);
  const assessment = await trainingService.addTrainingAssessment(req.params.id, validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Training assessment added successfully',
    data: assessment,
  });
}));

// POST /api/trainings/:id/attendance
router.post('/:id/attendance', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const validatedData = recordAttendanceSchema.parse(req.body);
  const attendance = await trainingService.recordAttendance(
    req.params.id,
    req.user!.id,
    validatedData.attendedBy
  );
  
  res.status(201).json({
    success: true,
    message: 'Attendance recorded successfully',
    data: attendance,
  });
}));

export default router;
