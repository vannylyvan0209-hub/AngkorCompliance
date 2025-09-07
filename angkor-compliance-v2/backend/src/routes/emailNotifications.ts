import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { emailNotificationService } from '../services/emailNotificationService';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const emailRecipientSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  type: z.enum(['to', 'cc', 'bcc']).default('to'),
});

const emailAttachmentSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  content: z.string().or(z.instanceof(Buffer)),
  contentType: z.string().optional(),
  encoding: z.string().optional(),
});

const emailOptionsSchema = z.object({
  to: z.array(emailRecipientSchema).min(1, 'At least one recipient is required'),
  subject: z.string().min(1, 'Subject is required'),
  htmlContent: z.string().optional(),
  textContent: z.string().optional(),
  templateId: z.string().optional(),
  templateVariables: z.record(z.any()).optional(),
  attachments: z.array(emailAttachmentSchema).optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  scheduledAt: z.string().transform(str => new Date(str)).optional(),
  replyTo: z.string().email().optional(),
  from: z.string().email().optional(),
  headers: z.record(z.string()).optional(),
});

const emailTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  htmlContent: z.string().min(1, 'HTML content is required'),
  textContent: z.string().min(1, 'Text content is required'),
  variables: z.array(z.string()).optional(),
  category: z.string().min(1, 'Category is required'),
  isActive: z.boolean().default(true),
});

const bulkEmailSchema = z.object({
  recipients: z.array(emailRecipientSchema).min(1, 'At least one recipient is required'),
  subject: z.string().min(1, 'Subject is required'),
  htmlContent: z.string().min(1, 'HTML content is required'),
  textContent: z.string().min(1, 'Text content is required'),
  templateId: z.string().optional(),
  templateVariables: z.record(z.any()).optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  scheduledAt: z.string().transform(str => new Date(str)).optional(),
});

const emailFiltersSchema = z.object({
  status: z.enum(['pending', 'processing', 'sent', 'failed', 'cancelled']).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
  templateId: z.string().optional(),
  recipientEmail: z.string().email().optional(),
  dateFrom: z.string().transform(str => new Date(str)).optional(),
  dateTo: z.string().transform(str => new Date(str)).optional(),
  limit: z.string().transform(str => parseInt(str)).default('20'),
  offset: z.string().transform(str => parseInt(str)).default('0'),
});

// GET /api/email-notifications/templates
router.get('/templates', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const category = req.query.category as string;
  const templates = await emailNotificationService.listTemplates(category);
  
  res.json({
    success: true,
    data: templates,
  });
}));

// GET /api/email-notifications/templates/:id
router.get('/templates/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const template = await emailNotificationService.getTemplate(req.params.id);
  
  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Email template not found',
    });
  }
  
  res.json({
    success: true,
    data: template,
  });
}));

// POST /api/email-notifications/templates
router.post('/templates', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const templateData = emailTemplateSchema.parse(req.body);
  const template = await emailNotificationService.createTemplate(templateData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Email template created successfully',
    data: template,
  });
}));

// PUT /api/email-notifications/templates/:id
router.put('/templates/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const updates = emailTemplateSchema.partial().parse(req.body);
  const template = await emailNotificationService.updateTemplate(req.params.id, updates, req.user!.id);
  
  res.json({
    success: true,
    message: 'Email template updated successfully',
    data: template,
  });
}));

// DELETE /api/email-notifications/templates/:id
router.delete('/templates/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  await emailNotificationService.deleteTemplate(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Email template deleted successfully',
  });
}));

// POST /api/email-notifications/send
router.post('/send', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE']), asyncHandler(async (req, res) => {
  const emailOptions = emailOptionsSchema.parse(req.body);
  const emailId = await emailNotificationService.sendEmail(emailOptions, req.user!.id, req.user!.tenantId);
  
  res.status(201).json({
    success: true,
    message: 'Email queued for sending',
    data: { emailId },
  });
}));

// POST /api/email-notifications/send-bulk
router.post('/send-bulk', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const bulkEmailData = bulkEmailSchema.parse(req.body);
  const emailIds = await emailNotificationService.sendBulkEmails(
    bulkEmailData.recipients,
    bulkEmailData.subject,
    bulkEmailData.htmlContent,
    bulkEmailData.textContent,
    req.user!.id,
    req.user!.tenantId,
    {
      templateId: bulkEmailData.templateId,
      templateVariables: bulkEmailData.templateVariables,
      priority: bulkEmailData.priority,
      scheduledAt: bulkEmailData.scheduledAt,
    }
  );
  
  res.status(201).json({
    success: true,
    message: 'Bulk emails queued for sending',
    data: { emailIds, count: emailIds.length },
  });
}));

// GET /api/email-notifications/queue
router.get('/queue', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const filters = emailFiltersSchema.parse(req.query);
  const emailQueue = await emailNotificationService.listEmailQueue(
    req.user!.id,
    filters.limit,
    filters.offset,
    filters.status
  );
  
  res.json({
    success: true,
    data: emailQueue,
    pagination: {
      limit: filters.limit,
      offset: filters.offset,
      total: emailQueue.length,
    },
  });
}));

// GET /api/email-notifications/queue/:id
router.get('/queue/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const emailItem = await emailNotificationService.getEmailQueueStatus(req.params.id, req.user!.id);
  
  if (!emailItem) {
    return res.status(404).json({
      success: false,
      message: 'Email not found',
    });
  }
  
  res.json({
    success: true,
    data: emailItem,
  });
}));

// POST /api/email-notifications/queue/:id/cancel
router.post('/queue/:id/cancel', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  await emailNotificationService.cancelEmail(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Email cancelled successfully',
  });
}));

// POST /api/email-notifications/queue/:id/retry
router.post('/queue/:id/retry', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  await emailNotificationService.retryEmail(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Email retry initiated',
  });
}));

// GET /api/email-notifications/stats
router.get('/stats', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const dateFrom = req.query.dateFrom as string;
  const dateTo = req.query.dateTo as string;
  
  const dateRange = dateFrom && dateTo ? {
    from: new Date(dateFrom),
    to: new Date(dateTo),
  } : undefined;
  
  const stats = await emailNotificationService.getEmailStats(req.user!.id, dateRange);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// POST /api/email-notifications/test-config
router.post('/test-config', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const isWorking = await emailNotificationService.testEmailConfiguration();
  
  res.json({
    success: true,
    data: { isWorking },
    message: isWorking ? 'Email configuration is working' : 'Email configuration test failed',
  });
}));

// POST /api/email-notifications/cleanup
router.post('/cleanup', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const daysOld = parseInt(req.body.daysOld) || 30;
  const deletedCount = await emailNotificationService.cleanupOldEmails(daysOld);
  
  res.json({
    success: true,
    message: `Cleaned up ${deletedCount} old emails`,
    data: { deletedCount },
  });
}));

// POST /api/email-notifications/process-scheduled
router.post('/process-scheduled', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  await emailNotificationService.sendScheduledEmails();
  
  res.json({
    success: true,
    message: 'Scheduled emails processing initiated',
  });
}));

// GET /api/email-notifications/categories
router.get('/categories', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const categories = [
    { value: 'system', label: 'System Notifications', description: 'System-generated notifications' },
    { value: 'audit', label: 'Audit Notifications', description: 'Audit-related email notifications' },
    { value: 'grievance', label: 'Grievance Notifications', description: 'Grievance-related email notifications' },
    { value: 'training', label: 'Training Notifications', description: 'Training-related email notifications' },
    { value: 'permit', label: 'Permit Notifications', description: 'Permit-related email notifications' },
    { value: 'compliance', label: 'Compliance Notifications', description: 'Compliance-related email notifications' },
    { value: 'user', label: 'User Notifications', description: 'User-related email notifications' },
    { value: 'tenant', label: 'Tenant Notifications', description: 'Tenant-related email notifications' },
    { value: 'export', label: 'Export Notifications', description: 'Export-related email notifications' },
    { value: 'custom', label: 'Custom Notifications', description: 'Custom email notifications' },
  ];
  
  res.json({
    success: true,
    data: categories,
  });
}));

// GET /api/email-notifications/priorities
router.get('/priorities', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const priorities = [
    { value: 'low', label: 'Low Priority', description: 'Low priority emails' },
    { value: 'normal', label: 'Normal Priority', description: 'Normal priority emails' },
    { value: 'high', label: 'High Priority', description: 'High priority emails' },
  ];
  
  res.json({
    success: true,
    data: priorities,
  });
}));

// GET /api/email-notifications/statuses
router.get('/statuses', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const statuses = [
    { value: 'pending', label: 'Pending', description: 'Email is pending to be sent' },
    { value: 'processing', label: 'Processing', description: 'Email is being processed' },
    { value: 'sent', label: 'Sent', description: 'Email has been sent successfully' },
    { value: 'failed', label: 'Failed', description: 'Email failed to send' },
    { value: 'cancelled', label: 'Cancelled', description: 'Email was cancelled' },
  ];
  
  res.json({
    success: true,
    data: statuses,
  });
}));

export default router;
