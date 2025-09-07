import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { backupService } from '../services/backupService';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createBackupSchema = z.object({
  name: z.string().min(1, 'Backup name is required'),
  description: z.string().optional(),
  includeData: z.boolean().default(true),
  includeFiles: z.boolean().default(false),
  includeConfig: z.boolean().default(false),
  entities: z.array(z.string()).optional(),
  dateFrom: z.string().transform(str => new Date(str)).optional(),
  dateTo: z.string().transform(str => new Date(str)).optional(),
  compression: z.enum(['none', 'gzip', 'zip']).default('gzip'),
  encryption: z.boolean().default(false),
  password: z.string().optional(),
  retentionDays: z.number().min(1).max(365).default(30),
  schedule: z.object({
    enabled: z.boolean().default(false),
    frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
    time: z.string().default('02:00'),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
  }).optional(),
});

const restoreBackupSchema = z.object({
  backupId: z.string().uuid('Invalid backup ID'),
  entities: z.array(z.string()).optional(),
  dateFrom: z.string().transform(str => new Date(str)).optional(),
  dateTo: z.string().transform(str => new Date(str)).optional(),
  overwriteExisting: z.boolean().default(false),
  validateData: z.boolean().default(true),
  dryRun: z.boolean().default(false),
  password: z.string().optional(),
});

const backupFiltersSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  type: z.enum(['FULL', 'INCREMENTAL', 'DIFFERENTIAL']).optional(),
  dateFrom: z.string().transform(str => new Date(str)).optional(),
  dateTo: z.string().transform(str => new Date(str)).optional(),
  limit: z.string().transform(str => parseInt(str)).default('20'),
  offset: z.string().transform(str => parseInt(str)).default('0'),
});

// POST /api/backups
router.post('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const backupOptions = createBackupSchema.parse(req.body);
  
  const backupInfo = await backupService.createBackup(backupOptions, req.user!.id, req.user!.tenantId);

  res.status(201).json({
    success: true,
    message: 'Backup created successfully',
    data: backupInfo,
  });
}));

// GET /api/backups
router.get('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = backupFiltersSchema.parse(req.query);
  const result = await backupService.getBackups(req.user!.id, filters);
  
  res.json({
    success: true,
    data: result.backups,
    pagination: {
      total: result.total,
      limit: filters.limit,
      offset: filters.offset,
    },
  });
}));

// GET /api/backups/stats
router.get('/stats', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const dateFrom = req.query.dateFrom as string;
  const dateTo = req.query.dateTo as string;
  
  const dateRange = dateFrom && dateTo ? {
    from: new Date(dateFrom),
    to: new Date(dateTo),
  } : undefined;
  
  const stats = await backupService.getBackupStats(req.user!.id, dateRange);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/backups/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const backupInfo = await backupService.getBackupInfo(req.params.id, req.user!.id);
  
  if (!backupInfo) {
    return res.status(404).json({
      success: false,
      message: 'Backup not found',
    });
  }
  
  res.json({
    success: true,
    data: backupInfo,
  });
}));

// GET /api/backups/:id/download
router.get('/:id/download', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const backupData = await backupService.downloadBackup(req.params.id, req.user!.id);
  
  res.setHeader('Content-Type', backupData.mimetype);
  res.setHeader('Content-Disposition', `attachment; filename="${backupData.filename}"`);
  res.send(backupData.buffer);
}));

// POST /api/backups/:id/restore
router.post('/:id/restore', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  const restoreOptions = restoreBackupSchema.parse({
    ...req.body,
    backupId: req.params.id,
  });
  
  await backupService.restoreBackup(restoreOptions, req.user!.id);
  
  res.json({
    success: true,
    message: 'Backup restored successfully',
  });
}));

// DELETE /api/backups/:id
router.delete('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  await backupService.deleteBackup(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Backup deleted successfully',
  });
}));

// POST /api/backups/cleanup-expired
router.post('/cleanup-expired', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const deletedCount = await backupService.cleanupExpiredBackups();
  
  res.json({
    success: true,
    message: `Cleaned up ${deletedCount} expired backups`,
    data: { deletedCount },
  });
}));

// GET /api/backups/entities/types
router.get('/entities/types', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const entityTypes = [
    { value: 'User', label: 'Users', description: 'User accounts and profiles' },
    { value: 'Tenant', label: 'Tenants', description: 'Tenant configurations' },
    { value: 'Role', label: 'Roles', description: 'User roles and permissions' },
    { value: 'Permission', label: 'Permissions', description: 'System permissions' },
    { value: 'Factory', label: 'Factories', description: 'Factory information' },
    { value: 'Audit', label: 'Audits', description: 'Audit records and findings' },
    { value: 'Grievance', label: 'Grievances', description: 'Grievance cases and resolutions' },
    { value: 'Training', label: 'Trainings', description: 'Training records and materials' },
    { value: 'Permit', label: 'Permits', description: 'Permit records and renewals' },
    { value: 'Notification', label: 'Notifications', description: 'Notification records' },
    { value: 'Document', label: 'Documents', description: 'Document records' },
    { value: 'ComplianceStandard', label: 'Compliance Standards', description: 'Compliance standards and requirements' },
    { value: 'CorrectiveAction', label: 'Corrective Actions', description: 'Corrective action plans' },
    { value: 'Activity', label: 'Activities', description: 'Activity logs' },
    { value: 'Log', label: 'Logs', description: 'System logs' },
  ];
  
  res.json({
    success: true,
    data: entityTypes,
  });
}));

// GET /api/backups/compression/types
router.get('/compression/types', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const compressionTypes = [
    { value: 'none', label: 'No Compression', description: 'Store backup without compression' },
    { value: 'gzip', label: 'GZIP Compression', description: 'Compress backup using GZIP (recommended)' },
    { value: 'zip', label: 'ZIP Compression', description: 'Compress backup using ZIP format' },
  ];
  
  res.json({
    success: true,
    data: compressionTypes,
  });
}));

// GET /api/backups/backup/types
router.get('/backup/types', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const backupTypes = [
    { value: 'FULL', label: 'Full Backup', description: 'Complete backup of all data' },
    { value: 'INCREMENTAL', label: 'Incremental Backup', description: 'Backup of changes since last backup' },
    { value: 'DIFFERENTIAL', label: 'Differential Backup', description: 'Backup of changes since last full backup' },
  ];
  
  res.json({
    success: true,
    data: backupTypes,
  });
}));

// GET /api/backups/status/types
router.get('/status/types', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const statusTypes = [
    { value: 'PENDING', label: 'Pending', description: 'Backup is queued for processing' },
    { value: 'IN_PROGRESS', label: 'In Progress', description: 'Backup is currently being processed' },
    { value: 'COMPLETED', label: 'Completed', description: 'Backup completed successfully' },
    { value: 'FAILED', label: 'Failed', description: 'Backup failed with errors' },
    { value: 'CANCELLED', label: 'Cancelled', description: 'Backup was cancelled' },
  ];
  
  res.json({
    success: true,
    data: statusTypes,
  });
}));

// GET /api/backups/schedule/frequencies
router.get('/schedule/frequencies', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const frequencies = [
    { value: 'daily', label: 'Daily', description: 'Run backup every day' },
    { value: 'weekly', label: 'Weekly', description: 'Run backup every week' },
    { value: 'monthly', label: 'Monthly', description: 'Run backup every month' },
  ];
  
  res.json({
    success: true,
    data: frequencies,
  });
}));

// GET /api/backups/retention/presets
router.get('/retention/presets', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const retentionPresets = [
    { value: 7, label: '1 Week', description: 'Keep backups for 1 week' },
    { value: 30, label: '1 Month', description: 'Keep backups for 1 month' },
    { value: 90, label: '3 Months', description: 'Keep backups for 3 months' },
    { value: 180, label: '6 Months', description: 'Keep backups for 6 months' },
    { value: 365, label: '1 Year', description: 'Keep backups for 1 year' },
  ];
  
  res.json({
    success: true,
    data: retentionPresets,
  });
}));

export default router;
