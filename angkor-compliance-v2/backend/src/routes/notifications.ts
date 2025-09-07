import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { notificationService } from '../services/notificationService';
import { NotificationType, NotificationStatus, NotificationChannel } from '@prisma/client';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createNotificationSchema = z.object({
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  channel: z.nativeEnum(NotificationChannel),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  targetUsers: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
  targetFactoryId: z.string().optional(),
  relatedResourceType: z.string().optional(),
  relatedResourceId: z.string().optional(),
  scheduledAt: z.string().transform(str => new Date(str)).optional(),
  expiresAt: z.string().transform(str => new Date(str)).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateNotificationSchema = z.object({
  title: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  status: z.nativeEnum(NotificationStatus).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  scheduledAt: z.string().transform(str => new Date(str)).optional(),
  expiresAt: z.string().transform(str => new Date(str)).optional(),
  metadata: z.record(z.any()).optional(),
});

const notificationFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(NotificationType).optional(),
  status: z.nativeEnum(NotificationStatus).optional(),
  channel: z.nativeEnum(NotificationChannel).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  targetUserId: z.string().optional(),
  targetRole: z.string().optional(),
  targetFactoryId: z.string().optional(),
  relatedResourceType: z.string().optional(),
  relatedResourceId: z.string().optional(),
  isRead: z.boolean().optional(),
  isScheduled: z.boolean().optional(),
  isExpired: z.boolean().optional(),
  dateFrom: z.string().transform(str => new Date(str)).optional(),
  dateTo: z.string().transform(str => new Date(str)).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// GET /api/notifications
router.get('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const filters = notificationFiltersSchema.parse(req.query);
  const result = await notificationService.getNotifications(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/notifications/stats
router.get('/stats', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const factoryId = req.query.factoryId as string;
  const stats = await notificationService.getNotificationStats(factoryId, req.user!.id);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/notifications/unread
router.get('/unread', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const filters = notificationFiltersSchema.parse({ ...req.query, isRead: false });
  const result = await notificationService.getNotifications(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/notifications/scheduled
router.get('/scheduled', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE']), asyncHandler(async (req, res) => {
  const filters = notificationFiltersSchema.parse({ ...req.query, isScheduled: true });
  const result = await notificationService.getNotifications(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/notifications/expired
router.get('/expired', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE']), asyncHandler(async (req, res) => {
  const filters = notificationFiltersSchema.parse({ ...req.query, isExpired: true });
  const result = await notificationService.getNotifications(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/notifications/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const notification = await notificationService.getNotificationById(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: notification,
  });
}));

// POST /api/notifications
router.post('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE']), asyncHandler(async (req, res) => {
  const validatedData = createNotificationSchema.parse(req.body);
  const notification = await notificationService.createNotification(validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: notification,
  });
}));

// PUT /api/notifications/:id
router.put('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE']), asyncHandler(async (req, res) => {
  const validatedData = updateNotificationSchema.parse(req.body);
  const notification = await notificationService.updateNotification(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'Notification updated successfully',
    data: notification,
  });
}));

// POST /api/notifications/:id/read
router.post('/:id/read', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
}));

// POST /api/notifications/:id/unread
router.post('/:id/unread', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsUnread(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Notification marked as unread',
    data: notification,
  });
}));

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user!.id);
  
  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: result,
  });
}));

// DELETE /api/notifications/:id
router.delete('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE']), asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Notification deleted successfully',
  });
}));

export default router;
