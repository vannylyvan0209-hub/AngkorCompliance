import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { complianceStandardsService } from '../services/complianceStandardsService';
import { StandardType, StandardStatus, RequirementType, ControlType } from '@prisma/client';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createComplianceControlSchema = z.object({
  code: z.string().min(1, 'Control code is required'),
  title: z.string().min(1, 'Control title is required'),
  description: z.string().min(1, 'Control description is required'),
  type: z.nativeEnum(ControlType),
  implementationGuidance: z.string().min(1, 'Implementation guidance is required'),
  evidenceRequired: z.array(z.string()).min(1, 'Evidence required is required'),
  testingMethod: z.string().min(1, 'Testing method is required'),
  frequency: z.enum(['CONTINUOUS', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']),
  responsibleRole: z.string().min(1, 'Responsible role is required'),
  weight: z.number().min(0).max(100, 'Weight must be between 0 and 100'),
  metadata: z.record(z.any()).optional(),
});

const createComplianceRequirementSchema = z.object({
  code: z.string().min(1, 'Requirement code is required'),
  title: z.string().min(1, 'Requirement title is required'),
  description: z.string().min(1, 'Requirement description is required'),
  type: z.nativeEnum(RequirementType),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  isMandatory: z.boolean().default(true),
  weight: z.number().min(0).max(100, 'Weight must be between 0 and 100'),
  controls: z.array(createComplianceControlSchema).min(1, 'At least one control is required'),
  metadata: z.record(z.any()).optional(),
});

const createComplianceStandardSchema = z.object({
  name: z.string().min(1, 'Standard name is required'),
  code: z.string().min(1, 'Standard code is required'),
  type: z.nativeEnum(StandardType),
  version: z.string().min(1, 'Version is required'),
  description: z.string().min(1, 'Description is required'),
  scope: z.string().min(1, 'Scope is required'),
  applicableIndustries: z.array(z.string()).min(1, 'Applicable industries are required'),
  applicableCountries: z.array(z.string()).min(1, 'Applicable countries are required'),
  effectiveDate: z.string().transform(str => new Date(str)),
  expiryDate: z.string().transform(str => new Date(str)).optional(),
  isActive: z.boolean().default(true),
  requirements: z.array(createComplianceRequirementSchema).min(1, 'At least one requirement is required'),
  metadata: z.record(z.any()).optional(),
});

const updateComplianceStandardSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  type: z.nativeEnum(StandardType).optional(),
  version: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  scope: z.string().min(1).optional(),
  applicableIndustries: z.array(z.string()).optional(),
  applicableCountries: z.array(z.string()).optional(),
  effectiveDate: z.string().transform(str => new Date(str)).optional(),
  expiryDate: z.string().transform(str => new Date(str)).optional(),
  isActive: z.boolean().optional(),
  status: z.nativeEnum(StandardStatus).optional(),
  metadata: z.record(z.any()).optional(),
});

const complianceStandardFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(StandardType).optional(),
  status: z.nativeEnum(StandardStatus).optional(),
  isActive: z.boolean().optional(),
  applicableIndustry: z.string().optional(),
  applicableCountry: z.string().optional(),
  effectiveDateFrom: z.string().transform(str => new Date(str)).optional(),
  effectiveDateTo: z.string().transform(str => new Date(str)).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const createComplianceAssessmentSchema = z.object({
  standardId: z.string().min(1, 'Standard ID is required'),
  factoryId: z.string().min(1, 'Factory ID is required'),
  assessmentDate: z.string().transform(str => new Date(str)),
  overallScore: z.number().min(0).max(100, 'Overall score must be between 0 and 100'),
  requirementScores: z.array(z.object({
    requirementId: z.string().min(1, 'Requirement ID is required'),
    score: z.number().min(0).max(100, 'Score must be between 0 and 100'),
    status: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT']),
  })).min(1, 'At least one requirement score is required'),
  findings: z.array(z.object({
    requirementId: z.string().min(1, 'Requirement ID is required'),
    controlId: z.string().min(1, 'Control ID is required'),
    finding: z.string().min(1, 'Finding is required'),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  })).optional(),
  recommendations: z.array(z.string()).optional(),
});

// GET /api/compliance-standards
router.get('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const filters = complianceStandardFiltersSchema.parse(req.query);
  const result = await complianceStandardsService.getComplianceStandards(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/compliance-standards/stats
router.get('/stats', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const stats = await complianceStandardsService.getComplianceStandardStats(req.user!.id);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/compliance-standards/applicable/:factoryId
router.get('/applicable/:factoryId', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const standards = await complianceStandardsService.getApplicableStandards(req.params.factoryId, req.user!.id);
  
  res.json({
    success: true,
    data: standards,
  });
}));

// GET /api/compliance-standards/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const standard = await complianceStandardsService.getComplianceStandardById(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: standard,
  });
}));

// POST /api/compliance-standards
router.post('/', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const validatedData = createComplianceStandardSchema.parse(req.body);
  const standard = await complianceStandardsService.createComplianceStandard(validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Compliance standard created successfully',
    data: standard,
  });
}));

// PUT /api/compliance-standards/:id
router.put('/:id', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const validatedData = updateComplianceStandardSchema.parse(req.body);
  const standard = await complianceStandardsService.updateComplianceStandard(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'Compliance standard updated successfully',
    data: standard,
  });
}));

// POST /api/compliance-standards/:id/activate
router.post('/:id/activate', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const standard = await complianceStandardsService.activateComplianceStandard(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Compliance standard activated successfully',
    data: standard,
  });
}));

// POST /api/compliance-standards/:id/deactivate
router.post('/:id/deactivate', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const standard = await complianceStandardsService.deactivateComplianceStandard(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Compliance standard deactivated successfully',
    data: standard,
  });
}));

// POST /api/compliance-standards/assessments
router.post('/assessments', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR']), asyncHandler(async (req, res) => {
  const validatedData = createComplianceAssessmentSchema.parse(req.body);
  const assessment = await complianceStandardsService.createComplianceAssessment(validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Compliance assessment created successfully',
    data: assessment,
  });
}));

export default router;
