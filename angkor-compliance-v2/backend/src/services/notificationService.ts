import { prisma } from '../index';
import { Notification, NotificationType, NotificationStatus, NotificationChannel } from '@prisma/client';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  targetUsers?: string[];
  targetRoles?: string[];
  targetFactoryId?: string;
  relatedResourceType?: string;
  relatedResourceId?: string;
  scheduledAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationData {
  title?: string;
  message?: string;
  status?: NotificationStatus;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  scheduledAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationFilters {
  search?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  targetUserId?: string;
  targetRole?: string;
  targetFactoryId?: string;
  relatedResourceType?: string;
  relatedResourceId?: string;
  isRead?: boolean;
  isScheduled?: boolean;
  isExpired?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedNotificationResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  sent: number;
  failed: number;
  scheduled: number;
  expired: number;
  byType: Array<{ type: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  byChannel: Array<{ channel: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

class NotificationService {
  // Create a new notification
  async createNotification(data: CreateNotificationData, userId: string): Promise<Notification> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Only super admin, factory admin, or HR staff can create notifications
    if (!['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE'].includes(user.role)) {
      throw createForbiddenError('You do not have permission to create notifications');
    }

    // Validate target users if provided
    if (data.targetUsers && data.targetUsers.length > 0) {
      const targetUsers = await prisma.user.findMany({
        where: {
          id: { in: data.targetUsers },
          isActive: true,
        },
      });

      if (targetUsers.length !== data.targetUsers.length) {
        throw new CustomError('One or more target users are invalid or inactive', 400);
      }
    }

    // Validate target factory if provided
    if (data.targetFactoryId) {
      const factory = await prisma.factory.findUnique({
        where: { id: data.targetFactoryId },
      });

      if (!factory) {
        throw createNotFoundError('Factory');
      }
    }

    // Determine initial status
    const status = data.scheduledAt && data.scheduledAt > new Date() 
      ? 'SCHEDULED' 
      : 'PENDING';

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        ...data,
        createdById: userId,
        tenantId: user.tenantId,
        status,
        isRead: false,
        sentAt: status === 'PENDING' ? new Date() : null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        targetUsers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('notification:created', notification.id, userId, {
      notificationTitle: notification.title,
      notificationType: notification.type,
      channel: notification.channel,
    });

    // Send notification if not scheduled
    if (status === 'PENDING') {
      await this.sendNotification(notification);
    }

    return notification;
  }

  // Get all notifications with filtering and pagination
  async getNotifications(
    filters: NotificationFilters,
    userId: string
  ): Promise<PaginatedNotificationResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const {
      search,
      type,
      status,
      channel,
      priority,
      targetUserId,
      targetRole,
      targetFactoryId,
      relatedResourceType,
      relatedResourceId,
      isRead,
      isScheduled,
      isExpired,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
    };

    // Super admin can see all notifications, others only see their tenant's notifications
    if (user.role !== 'SUPER_ADMIN') {
      // Factory admin can only see notifications for their factory
      if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
        where.OR = [
          { targetFactoryId: user.factoryId },
          { targetUsers: { some: { id: userId } } },
          { targetRoles: { has: user.role } },
        ];
      } else {
        // Other users can only see notifications targeted to them
        where.OR = [
          { targetUsers: { some: { id: userId } } },
          { targetRoles: { has: user.role } },
        ];
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (channel) {
      where.channel = channel;
    }

    if (priority) {
      where.priority = priority;
    }

    if (targetUserId) {
      where.targetUsers = { some: { id: targetUserId } };
    }

    if (targetRole) {
      where.targetRoles = { has: targetRole };
    }

    if (targetFactoryId) {
      where.targetFactoryId = targetFactoryId;
    }

    if (relatedResourceType) {
      where.relatedResourceType = relatedResourceType;
    }

    if (relatedResourceId) {
      where.relatedResourceId = relatedResourceId;
    }

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (isScheduled) {
      where.scheduledAt = { not: null };
      where.status = 'SCHEDULED';
    }

    if (isExpired) {
      where.expiresAt = { lt: new Date() };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await prisma.notification.count({ where });

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        targetUsers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get notification by ID
  async getNotificationById(notificationId: string, userId: string): Promise<Notification> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Build where clause based on user role
    const where: any = {
      id: notificationId,
      tenantId: user.tenantId,
    };

    if (user.role !== 'SUPER_ADMIN') {
      if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
        where.OR = [
          { targetFactoryId: user.factoryId },
          { targetUsers: { some: { id: userId } } },
          { targetRoles: { has: user.role } },
        ];
      } else {
        where.OR = [
          { targetUsers: { some: { id: userId } } },
          { targetRoles: { has: user.role } },
        ];
      }
    }

    const notification = await prisma.notification.findFirst({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        targetUsers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!notification) {
      throw createNotFoundError('Notification');
    }

    return notification;
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        tenantId: user.tenantId,
        targetUsers: { some: { id: userId } },
      },
    });

    if (!notification) {
      throw createNotFoundError('Notification');
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        targetUsers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('notification:read', notification.id, userId, {
      notificationTitle: notification.title,
    });

    return updatedNotification;
  }

  // Mark notification as unread
  async markAsUnread(notificationId: string, userId: string): Promise<Notification> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        tenantId: user.tenantId,
        targetUsers: { some: { id: userId } },
      },
    });

    if (!notification) {
      throw createNotFoundError('Notification');
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: false,
        readAt: null,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        targetUsers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('notification:unread', notification.id, userId, {
      notificationTitle: notification.title,
    });

    return updatedNotification;
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Update all unread notifications for the user
    const result = await prisma.notification.updateMany({
      where: {
        tenantId: user.tenantId,
        targetUsers: { some: { id: userId } },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Log activity
    await this.logActivity('notifications:mark_all_read', 'bulk', userId, {
      count: result.count,
    });

    return { count: result.count };
  }

  // Update notification
  async updateNotification(
    notificationId: string,
    data: UpdateNotificationData,
    userId: string
  ): Promise<Notification> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check if user has permission to update this notification
    const existingNotification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!existingNotification) {
      throw createNotFoundError('Notification');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== existingNotification.tenantId) {
        throw createForbiddenError('You can only update notifications in your tenant');
      }
    }

    // Update notification
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        targetUsers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('notification:updated', notification.id, userId, {
      notificationTitle: notification.title,
      changes: data,
    });

    return notification;
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw createNotFoundError('Notification');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== notification.tenantId) {
        throw createForbiddenError('You can only delete notifications in your tenant');
      }
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    // Log activity
    await this.logActivity('notification:deleted', notification.id, userId, {
      notificationTitle: notification.title,
    });
  }

  // Get notification statistics
  async getNotificationStats(factoryId?: string, userId?: string): Promise<NotificationStats> {
    const user = userId ? await prisma.user.findUnique({
      where: { id: userId },
    }) : null;

    if (userId && !user) {
      throw createNotFoundError('User');
    }

    // Build where clause
    const where: any = {};

    if (user) {
      where.tenantId = user.tenantId;
      
      if (user.role !== 'SUPER_ADMIN') {
        if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
          where.targetFactoryId = user.factoryId;
        }
      }
    }

    if (factoryId) {
      where.targetFactoryId = factoryId;
    }

    // Get statistics
    const [
      total,
      unread,
      read,
      sent,
      failed,
      scheduled,
      expired,
      byType,
      byStatus,
      byChannel,
      byPriority,
    ] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, isRead: false } }),
      prisma.notification.count({ where: { ...where, isRead: true } }),
      prisma.notification.count({ where: { ...where, status: 'SENT' } }),
      prisma.notification.count({ where: { ...where, status: 'FAILED' } }),
      prisma.notification.count({ where: { ...where, status: 'SCHEDULED' } }),
      prisma.notification.count({
        where: {
          ...where,
          expiresAt: { lt: new Date() },
        },
      }),
      prisma.notification.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      prisma.notification.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      prisma.notification.groupBy({
        by: ['channel'],
        where,
        _count: { channel: true },
      }),
      prisma.notification.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true },
      }),
    ]);

    return {
      total,
      unread,
      read,
      sent,
      failed,
      scheduled,
      expired,
      byType: byType.map(item => ({
        type: item.type,
        count: item._count.type,
      })),
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      byChannel: byChannel.map(item => ({
        channel: item.channel,
        count: item._count.channel,
      })),
      byPriority: byPriority.map(item => ({
        priority: item.priority,
        count: item._count.priority,
      })),
    };
  }

  // Process scheduled notifications
  async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    
    const scheduledNotifications = await prisma.notification.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: now },
      },
      include: {
        targetUsers: true,
        factory: true,
      },
    });

    for (const notification of scheduledNotifications) {
      try {
        // Update status to pending
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'PENDING',
            sentAt: new Date(),
          },
        });

        // Send notification
        await this.sendNotification(notification);
      } catch (error) {
        console.error(`Failed to process scheduled notification ${notification.id}:`, error);
        
        // Update status to failed
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: 'FAILED',
            updatedAt: new Date(),
          },
        });
      }
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications(): Promise<void> {
    const now = new Date();
    
    const expiredNotifications = await prisma.notification.findMany({
      where: {
        expiresAt: { lt: now },
        status: { not: 'EXPIRED' },
      },
    });

    for (const notification of expiredNotifications) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'EXPIRED',
          updatedAt: new Date(),
        },
      });
    }
  }

  // Send notification
  private async sendNotification(notification: Notification): Promise<void> {
    try {
      // This would integrate with your actual notification channels
      // For now, we'll just log the notification
      console.log(`Sending notification: ${notification.title}`);
      console.log(`Channel: ${notification.channel}`);
      console.log(`Target users: ${notification.targetUsers?.length || 0}`);
      
      // Update status to sent
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`Failed to send notification ${notification.id}:`, error);
      
      // Update status to failed
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'FAILED',
          updatedAt: new Date(),
        },
      });
    }
  }

  // Log activity
  private async logActivity(
    action: string,
    resourceId: string,
    userId: string,
    metadata: any
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, factoryId: true },
      });

      await prisma.activity.create({
        data: {
          type: 'NOTIFICATION',
          title: `Notification ${action}`,
          description: `Notification ${action} by user`,
          resource: resourceId,
          metadata,
          userId,
          tenantId: user?.tenantId || '',
          factoryId: user?.factoryId || '',
        },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

export const notificationService = new NotificationService();
