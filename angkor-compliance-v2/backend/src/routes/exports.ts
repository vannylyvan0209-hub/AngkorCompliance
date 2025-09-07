import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { exportService } from '../services/exportService';
import * as path from 'path';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const exportOptionsSchema = z.object({
  format: z.enum(['xlsx', 'csv', 'pdf', 'json']),
  includeMetadata: z.boolean().optional(),
  dateRange: z.object({
    from: z.string().transform(str => new Date(str)),
    to: z.string().transform(str => new Date(str)),
  }).optional(),
  filters: z.record(z.any()).optional(),
  columns: z.array(z.string()).optional(),
  template: z.string().optional(),
});

const exportRequestSchema = z.object({
  entityType: z.enum(['audits', 'grievances', 'trainings', 'permits', 'users', 'factories', 'documents', 'notifications', 'compliance-standards', 'corrective-actions', 'activities']),
  options: exportOptionsSchema,
});

const exportTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  entityType: z.string().min(1, 'Entity type is required'),
  columns: z.array(z.string()),
  filters: z.record(z.any()).optional(),
  format: z.enum(['xlsx', 'csv', 'pdf', 'json']),
  isDefault: z.boolean().optional(),
});

// GET /api/exports
router.get('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  
  const exports = await exportService.listExports(req.user!.id, limit, offset);
  
  res.json({
    success: true,
    data: exports,
    pagination: {
      limit,
      offset,
      total: exports.length,
    },
  });
}));

// GET /api/exports/templates
router.get('/templates', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const entityType = req.query.entityType as string;
  const templates = await exportService.getExportTemplates(entityType);
  
  res.json({
    success: true,
    data: templates,
  });
}));

// POST /api/exports/templates
router.post('/templates', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const templateData = exportTemplateSchema.parse(req.body);
  const template = await exportService.createExportTemplate(templateData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Export template created successfully',
    data: template,
  });
}));

// POST /api/exports
router.post('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const requestData = exportRequestSchema.parse(req.body);
  const exportResult = await exportService.createExportRequest({
    ...requestData,
    userId: req.user!.id,
  });
  
  res.status(201).json({
    success: true,
    message: 'Export request created successfully',
    data: exportResult,
  });
}));

// GET /api/exports/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const exportStatus = await exportService.getExportStatus(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: exportStatus,
  });
}));

// GET /api/exports/:id/download
router.get('/:id/download', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const { filePath, fileName } = await exportService.downloadExport(req.params.id, req.user!.id);
  
  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('Download error:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to download export file',
      });
    }
  });
}));

// DELETE /api/exports/:id
router.delete('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  await exportService.deleteExport(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Export deleted successfully',
  });
}));

// GET /api/exports/entities/types
router.get('/entities/types', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const entityTypes = [
    { value: 'audits', label: 'Audits', description: 'Export audit data and findings' },
    { value: 'grievances', label: 'Grievances', description: 'Export grievance cases and resolutions' },
    { value: 'trainings', label: 'Trainings', description: 'Export training sessions and attendance' },
    { value: 'permits', label: 'Permits', description: 'Export permits and renewals' },
    { value: 'users', label: 'Users', description: 'Export user data and activities' },
    { value: 'factories', label: 'Factories', description: 'Export factory information' },
    { value: 'documents', label: 'Documents', description: 'Export document metadata' },
    { value: 'notifications', label: 'Notifications', description: 'Export notification history' },
    { value: 'compliance-standards', label: 'Compliance Standards', description: 'Export compliance standards and requirements' },
    { value: 'corrective-actions', label: 'Corrective Actions', description: 'Export corrective action plans' },
    { value: 'activities', label: 'Activities', description: 'Export activity logs and audit trail' },
  ];
  
  res.json({
    success: true,
    data: entityTypes,
  });
}));

// GET /api/exports/formats/types
router.get('/formats/types', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const formats = [
    { value: 'xlsx', label: 'Excel (XLSX)', description: 'Microsoft Excel format with multiple sheets' },
    { value: 'csv', label: 'CSV', description: 'Comma-separated values for spreadsheet applications' },
    { value: 'pdf', label: 'PDF', description: 'Portable Document Format for reports' },
    { value: 'json', label: 'JSON', description: 'JavaScript Object Notation for data exchange' },
  ];
  
  res.json({
    success: true,
    data: formats,
  });
}));

export default router;
