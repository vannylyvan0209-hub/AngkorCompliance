import { prisma } from '../index';
import { Activity, ActivityType } from '@prisma/client';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';

export interface CreateActivityData {
  type: ActivityType;
  title: string;
  description: string;
  resource: string;
  resourceType?: string;
  metadata?: Record<string, any>;
  userId?: string;
  tenantId?: string;
  factoryId?: string;
}

export interface ActivityFilters {
  type?: ActivityType;
  userId?: string;
  tenantId?: string;
  factoryId?: string;
  resourceType?: string;
  resource?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedActivityResponse {
  data: Activity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ActivityStats {
  total: number;
  byType: Array<{ type: string; count: number }>;
  byUser: Array<{ userId: string; userName: string; count: number }>;
  byTenant: Array<{ tenantId: string; tenantName: string; count: number }>;
  byFactory: Array<{ factoryId: string; factoryName: string; count: number }>;
  byResourceType: Array<{ resourceType: string; count: number }>;
  recentActivities: Array<{ id: string; type: string; title: string; createdAt: Date }>;
  activitiesToday: number;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
  topUsers: Array<{ userId: string; userName: string; count: number }>;
  topResources: Array<{ resource: string; resourceType: string; count: number }>;
}

export interface ActivitySummary {
  totalActivities: number;
  activitiesToday: number;
  activitiesThisWeek: number;
  activitiesThisMonth: number;
  mostActiveUser: { userId: string; userName: string; count: number } | null;
  mostActiveResource: { resource: string; resourceType: string; count: number } | null;
  recentActivityTypes: Array<{ type: string; count: number }>;
  activityTrend: Array<{ date: string; count: number }>;
}

export interface ActivityExport {
  activities: Activity[];
  summary: ActivitySummary;
  filters: ActivityFilters;
  exportedAt: Date;
  exportedBy: string;
}

class ActivityLoggingService {
  // Create a new activity log entry
  async createActivity(data: CreateActivityData, createdById: string): Promise<Activity> {
    const creator = await prisma.user.findUnique({
      where: { id: createdById },
    });

    if (!creator) {
      throw createNotFoundError('Creator User');
    }

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        ...data,
        userId: data.userId || createdById,
        tenantId: data.tenantId || creator.tenantId,
        factoryId: data.factoryId || creator.factoryId,
        createdById: createdById,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return activity;
  }

  // Get all activities with filtering and pagination
  async getActivities(
    filters: ActivityFilters,
    userId: string
  ): Promise<PaginatedActivityResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const {
      type,
      userId: filterUserId,
      tenantId,
      factoryId,
      resourceType,
      resource,
      dateFrom,
      dateTo,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {};

    // Apply tenant isolation
    if (user.role !== 'SUPER_ADMIN') {
      where.tenantId = user.tenantId;
    }

    if (type) {
      where.type = type;
    }

    if (filterUserId) {
      where.userId = filterUserId;
    }

    if (tenantId) {
      where.tenantId = tenantId;
    }

    if (factoryId) {
      where.factoryId = factoryId;
    }

    if (resourceType) {
      where.resourceType = resourceType;
    }

    if (resource) {
      where.resource = resource;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { resource: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await prisma.activity.count({ where });

    // Get activities
    const activities = await prisma.activity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      data: activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get activity by ID
  async getActivityById(activityId: string, userId: string): Promise<Activity> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        ...(user.role !== 'SUPER_ADMIN' ? { tenantId: user.tenantId } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!activity) {
      throw createNotFoundError('Activity');
    }

    return activity;
  }

  // Get activities by user
  async getActivitiesByUser(
    targetUserId: string,
    filters: Omit<ActivityFilters, 'userId'>,
    requesterId: string
  ): Promise<PaginatedActivityResponse> {
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester) {
      throw createNotFoundError('Requester User');
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw createNotFoundError('Target User');
    }

    // Check access permissions
    if (requester.role !== 'SUPER_ADMIN') {
      if (requester.tenantId !== targetUser.tenantId) {
        throw createForbiddenError('You can only view activities for users in your tenant');
      }
    }

    return this.getActivities({ ...filters, userId: targetUserId }, requesterId);
  }

  // Get activities by resource
  async getActivitiesByResource(
    resource: string,
    resourceType: string,
    filters: Omit<ActivityFilters, 'resource' | 'resourceType'>,
    requesterId: string
  ): Promise<PaginatedActivityResponse> {
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester) {
      throw createNotFoundError('Requester User');
    }

    return this.getActivities({ ...filters, resource, resourceType }, requesterId);
  }

  // Get activity statistics
  async getActivityStats(userId?: string): Promise<ActivityStats> {
    const user = userId ? await prisma.user.findUnique({
      where: { id: userId },
    }) : null;

    if (userId && !user) {
      throw createNotFoundError('User');
    }

    // Build where clause
    const where: any = {};

    if (user && user.role !== 'SUPER_ADMIN') {
      where.tenantId = user.tenantId;
    }

    // Get statistics
    const [
      total,
      byType,
      byUser,
      byTenant,
      byFactory,
      byResourceType,
      recentActivities,
      activitiesToday,
      activitiesThisWeek,
      activitiesThisMonth,
    ] = await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      prisma.activity.groupBy({
        by: ['userId'],
        where,
        _count: { userId: true },
      }),
      prisma.activity.groupBy({
        by: ['tenantId'],
        where,
        _count: { tenantId: true },
      }),
      prisma.activity.groupBy({
        by: ['factoryId'],
        where: { ...where, factoryId: { not: null } },
        _count: { factoryId: true },
      }),
      prisma.activity.groupBy({
        by: ['resourceType'],
        where: { ...where, resourceType: { not: null } },
        _count: { resourceType: true },
      }),
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          type: true,
          title: true,
          createdAt: true,
        },
      }),
      prisma.activity.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.activity.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.activity.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    // Get user names for byUser stats
    const userIds = byUser.map(item => item.userId).filter(Boolean);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    const userMap = new Map(users.map(u => [u.id, `${u.firstName} ${u.lastName}`]));

    // Get tenant names for byTenant stats
    const tenantIds = byTenant.map(item => item.tenantId).filter(Boolean);
    const tenants = await prisma.tenant.findMany({
      where: { id: { in: tenantIds } },
      select: { id: true, name: true },
    });

    const tenantMap = new Map(tenants.map(t => [t.id, t.name]));

    // Get factory names for byFactory stats
    const factoryIds = byFactory.map(item => item.factoryId).filter(Boolean);
    const factories = await prisma.factory.findMany({
      where: { id: { in: factoryIds } },
      select: { id: true, name: true },
    });

    const factoryMap = new Map(factories.map(f => [f.id, f.name]));

    // Get top users
    const topUsers = byUser
      .sort((a, b) => b._count.userId - a._count.userId)
      .slice(0, 10)
      .map(item => ({
        userId: item.userId || '',
        userName: userMap.get(item.userId || '') || 'Unknown',
        count: item._count.userId,
      }));

    // Get top resources
    const topResources = await prisma.activity.groupBy({
      by: ['resource', 'resourceType'],
      where: { ...where, resource: { not: null } },
      _count: { resource: true },
      orderBy: { _count: { resource: 'desc' } },
      take: 10,
    });

    return {
      total,
      byType: byType.map(item => ({
        type: item.type,
        count: item._count.type,
      })),
      byUser: byUser.map(item => ({
        userId: item.userId || '',
        userName: userMap.get(item.userId || '') || 'Unknown',
        count: item._count.userId,
      })),
      byTenant: byTenant.map(item => ({
        tenantId: item.tenantId || '',
        tenantName: tenantMap.get(item.tenantId || '') || 'Unknown',
        count: item._count.tenantId,
      })),
      byFactory: byFactory.map(item => ({
        factoryId: item.factoryId || '',
        factoryName: factoryMap.get(item.factoryId || '') || 'Unknown',
        count: item._count.factoryId,
      })),
      byResourceType: byResourceType.map(item => ({
        resourceType: item.resourceType || 'Unknown',
        count: item._count.resourceType,
      })),
      recentActivities,
      activitiesToday,
      activitiesThisWeek,
      activitiesThisMonth,
      topUsers,
      topResources: topResources.map(item => ({
        resource: item.resource || '',
        resourceType: item.resourceType || 'Unknown',
        count: item._count.resource,
      })),
    };
  }

  // Get activity summary
  async getActivitySummary(userId?: string): Promise<ActivitySummary> {
    const user = userId ? await prisma.user.findUnique({
      where: { id: userId },
    }) : null;

    if (userId && !user) {
      throw createNotFoundError('User');
    }

    // Build where clause
    const where: any = {};

    if (user && user.role !== 'SUPER_ADMIN') {
      where.tenantId = user.tenantId;
    }

    // Get summary data
    const [
      totalActivities,
      activitiesToday,
      activitiesThisWeek,
      activitiesThisMonth,
      mostActiveUser,
      mostActiveResource,
      recentActivityTypes,
      activityTrend,
    ] = await Promise.all([
      prisma.activity.count({ where }),
      prisma.activity.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.activity.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.activity.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.activity.groupBy({
        by: ['userId'],
        where,
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 1,
      }),
      prisma.activity.groupBy({
        by: ['resource', 'resourceType'],
        where: { ...where, resource: { not: null } },
        _count: { resource: true },
        orderBy: { _count: { resource: 'desc' } },
        take: 1,
      }),
      prisma.activity.groupBy({
        by: ['type'],
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } },
        take: 5,
      }),
      // Get activity trend for last 30 days
      this.getActivityTrend(where, 30),
    ]);

    // Get user name for most active user
    let mostActiveUserData = null;
    if (mostActiveUser.length > 0) {
      const user = await prisma.user.findUnique({
        where: { id: mostActiveUser[0].userId || '' },
        select: { id: true, firstName: true, lastName: true },
      });

      if (user) {
        mostActiveUserData = {
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          count: mostActiveUser[0]._count.userId,
        };
      }
    }

    // Get most active resource
    let mostActiveResourceData = null;
    if (mostActiveResource.length > 0) {
      mostActiveResourceData = {
        resource: mostActiveResource[0].resource || '',
        resourceType: mostActiveResource[0].resourceType || 'Unknown',
        count: mostActiveResource[0]._count.resource,
      };
    }

    return {
      totalActivities,
      activitiesToday,
      activitiesThisWeek,
      activitiesThisMonth,
      mostActiveUser: mostActiveUserData,
      mostActiveResource: mostActiveResourceData,
      recentActivityTypes: recentActivityTypes.map(item => ({
        type: item.type,
        count: item._count.type,
      })),
      activityTrend,
    };
  }

  // Get activity trend
  private async getActivityTrend(where: any, days: number): Promise<Array<{ date: string; count: number }>> {
    const trend = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const count = await prisma.activity.count({
        where: {
          ...where,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      trend.push({
        date: startOfDay.toISOString().split('T')[0],
        count,
      });
    }

    return trend;
  }

  // Export activities
  async exportActivities(
    filters: ActivityFilters,
    userId: string
  ): Promise<ActivityExport> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Get activities
    const activities = await this.getActivities(filters, userId);

    // Get summary
    const summary = await this.getActivitySummary(userId);

    return {
      activities: activities.data,
      summary,
      filters,
      exportedAt: new Date(),
      exportedBy: `${user.firstName} ${user.lastName}`,
    };
  }

  // Clean up old activities (for maintenance)
  async cleanupOldActivities(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.activity.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  // Get activity types
  async getActivityTypes(): Promise<Array<{ type: string; description: string }>> {
    return [
      { type: 'USER_MANAGEMENT', description: 'User management activities' },
      { type: 'TENANT_MANAGEMENT', description: 'Tenant management activities' },
      { type: 'FACTORY_MANAGEMENT', description: 'Factory management activities' },
      { type: 'DOCUMENT_MANAGEMENT', description: 'Document management activities' },
      { type: 'AUDIT_MANAGEMENT', description: 'Audit management activities' },
      { type: 'GRIEVANCE_MANAGEMENT', description: 'Grievance management activities' },
      { type: 'TRAINING_MANAGEMENT', description: 'Training management activities' },
      { type: 'PERMIT_MANAGEMENT', description: 'Permit management activities' },
      { type: 'NOTIFICATION_MANAGEMENT', description: 'Notification management activities' },
      { type: 'COMPLIANCE_STANDARDS', description: 'Compliance standards activities' },
      { type: 'CORRECTIVE_ACTION', description: 'Corrective action activities' },
      { type: 'SYSTEM', description: 'System activities' },
      { type: 'SECURITY', description: 'Security activities' },
      { type: 'AUTHENTICATION', description: 'Authentication activities' },
      { type: 'AUTHORIZATION', description: 'Authorization activities' },
    ];
  }
}

export const activityLoggingService = new ActivityLoggingService();
