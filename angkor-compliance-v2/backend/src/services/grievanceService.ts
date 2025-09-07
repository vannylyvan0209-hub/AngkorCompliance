import { prisma } from '../index';
import { Grievance, GrievanceStatus, GrievanceCategory, GrievanceSeverity } from '@prisma/client';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';

export interface CreateGrievanceData {
  title: string;
  description: string;
  category: GrievanceCategory;
  severity: GrievanceSeverity;
  factoryId: string;
  department?: string;
  line?: string;
  shift?: string;
  isAnonymous: boolean;
  workerId?: string;
  contactInfo?: string;
  metadata?: Record<string, any>;
}

export interface UpdateGrievanceData {
  title?: string;
  description?: string;
  category?: GrievanceCategory;
  severity?: GrievanceSeverity;
  status?: GrievanceStatus;
  assignedToId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resolution?: string;
  resolutionDate?: Date;
  metadata?: Record<string, any>;
}

export interface GrievanceFilters {
  search?: string;
  category?: GrievanceCategory;
  severity?: GrievanceSeverity;
  status?: GrievanceStatus;
  factoryId?: string;
  department?: string;
  line?: string;
  shift?: string;
  assignedToId?: string;
  isAnonymous?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedGrievanceResponse {
  data: Grievance[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GrievanceStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byCategory: Array<{ category: string; count: number }>;
  bySeverity: Array<{ severity: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  averageResolutionTime: number;
  slaCompliance: number;
}

class GrievanceService {
  // Create a new grievance
  async createGrievance(data: CreateGrievanceData, userId?: string): Promise<Grievance> {
    // Validate factory exists
    const factory = await prisma.factory.findUnique({
      where: { id: data.factoryId },
    });

    if (!factory) {
      throw createNotFoundError('Factory');
    }

    // If not anonymous, validate user exists
    if (!data.isAnonymous && userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw createNotFoundError('User');
      }
    }

    // Create grievance
    const grievance = await prisma.grievance.create({
      data: {
        ...data,
        submittedById: userId,
        tenantId: factory.tenantId,
        status: 'SUBMITTED',
        priority: this.calculatePriority(data.severity),
        submittedAt: new Date(),
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
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
        _count: {
          select: {
            actions: true,
            comments: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('grievance:created', grievance.id, userId || 'anonymous', {
      grievanceTitle: grievance.title,
      category: grievance.category,
      severity: grievance.severity,
      factoryName: factory.name,
    });

    // Send notifications to relevant stakeholders
    await this.sendGrievanceNotifications(grievance, 'created');

    return grievance;
  }

  // Get all grievances with filtering and pagination
  async getGrievances(
    filters: GrievanceFilters,
    userId: string
  ): Promise<PaginatedGrievanceResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const {
      search,
      category,
      severity,
      status,
      factoryId,
      department,
      line,
      shift,
      assignedToId,
      isAnonymous,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'submittedAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
    };

    // Super admin can see all grievances, others only see their tenant's grievances
    if (user.role !== 'SUPER_ADMIN') {
      // Factory admin can only see grievances from their factory
      if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
        where.factoryId = user.factoryId;
      }
      // Grievance committee can see all grievances in their tenant
      if (user.role === 'GRIEVANCE_COMMITTEE') {
        // Can see all grievances in tenant
      }
      // HR staff can see grievances in their factory
      if (user.role === 'HR_STAFF' && user.factoryId) {
        where.factoryId = user.factoryId;
      }
    }

    if (factoryId) {
      where.factoryId = factoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { resolution: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (severity) {
      where.severity = severity;
    }

    if (status) {
      where.status = status;
    }

    if (department) {
      where.department = department;
    }

    if (line) {
      where.line = line;
    }

    if (shift) {
      where.shift = shift;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (isAnonymous !== undefined) {
      where.isAnonymous = isAnonymous;
    }

    if (dateFrom || dateTo) {
      where.submittedAt = {};
      if (dateFrom) where.submittedAt.gte = dateFrom;
      if (dateTo) where.submittedAt.lte = dateTo;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await prisma.grievance.count({ where });

    // Get grievances
    const grievances = await prisma.grievance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
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
        _count: {
          select: {
            actions: true,
            comments: true,
          },
        },
      },
    });

    return {
      data: grievances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get grievance by ID
  async getGrievanceById(grievanceId: string, userId: string): Promise<Grievance> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Build where clause based on user role
    const where: any = {
      id: grievanceId,
      tenantId: user.tenantId,
    };

    if (user.role !== 'SUPER_ADMIN') {
      if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
        where.factoryId = user.factoryId;
      }
    }

    const grievance = await prisma.grievance.findFirst({
      where,
      include: {
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
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
        actions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            actions: true,
            comments: true,
          },
        },
      },
    });

    if (!grievance) {
      throw createNotFoundError('Grievance');
    }

    return grievance;
  }

  // Update grievance
  async updateGrievance(
    grievanceId: string,
    data: UpdateGrievanceData,
    userId: string
  ): Promise<Grievance> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check if user has permission to update this grievance
    const existingGrievance = await prisma.grievance.findUnique({
      where: { id: grievanceId },
    });

    if (!existingGrievance) {
      throw createNotFoundError('Grievance');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== existingGrievance.tenantId) {
        throw createForbiddenError('You can only update grievances in your tenant');
      }
      if (user.role === 'FACTORY_ADMIN' && user.factoryId !== existingGrievance.factoryId) {
        throw createForbiddenError('You can only update grievances in your assigned factory');
      }
    }

    // Update grievance
    const grievance = await prisma.grievance.update({
      where: { id: grievanceId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
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
        _count: {
          select: {
            actions: true,
            comments: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('grievance:updated', grievance.id, userId, {
      grievanceTitle: grievance.title,
      changes: data,
    });

    // Send notifications if status changed
    if (data.status && data.status !== existingGrievance.status) {
      await this.sendGrievanceNotifications(grievance, 'status_changed');
    }

    return grievance;
  }

  // Assign grievance
  async assignGrievance(
    grievanceId: string,
    assignedToId: string,
    userId: string
  ): Promise<Grievance> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const grievance = await prisma.grievance.findUnique({
      where: { id: grievanceId },
    });

    if (!grievance) {
      throw createNotFoundError('Grievance');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== grievance.tenantId) {
        throw createForbiddenError('You can only assign grievances in your tenant');
      }
    }

    // Validate assigned user
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedToId },
    });

    if (!assignedUser || !assignedUser.isActive) {
      throw new CustomError('Assigned user is invalid or inactive', 400);
    }

    // Update grievance
    const updatedGrievance = await prisma.grievance.update({
      where: { id: grievanceId },
      data: {
        assignedToId,
        status: 'ASSIGNED',
        assignedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
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
    await this.logActivity('grievance:assigned', grievance.id, userId, {
      grievanceTitle: grievance.title,
      assignedTo: assignedUser.firstName + ' ' + assignedUser.lastName,
    });

    // Send notifications
    await this.sendGrievanceNotifications(updatedGrievance, 'assigned');

    return updatedGrievance;
  }

  // Resolve grievance
  async resolveGrievance(
    grievanceId: string,
    resolution: string,
    userId: string
  ): Promise<Grievance> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const grievance = await prisma.grievance.findUnique({
      where: { id: grievanceId },
    });

    if (!grievance) {
      throw createNotFoundError('Grievance');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== grievance.tenantId) {
        throw createForbiddenError('You can only resolve grievances in your tenant');
      }
    }

    // Update grievance
    const updatedGrievance = await prisma.grievance.update({
      where: { id: grievanceId },
      data: {
        status: 'RESOLVED',
        resolution,
        resolutionDate: new Date(),
        updatedAt: new Date(),
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
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
    await this.logActivity('grievance:resolved', grievance.id, userId, {
      grievanceTitle: grievance.title,
      resolution,
    });

    // Send notifications
    await this.sendGrievanceNotifications(updatedGrievance, 'resolved');

    return updatedGrievance;
  }

  // Close grievance
  async closeGrievance(
    grievanceId: string,
    userId: string
  ): Promise<Grievance> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const grievance = await prisma.grievance.findUnique({
      where: { id: grievanceId },
    });

    if (!grievance) {
      throw createNotFoundError('Grievance');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== grievance.tenantId) {
        throw createForbiddenError('You can only close grievances in your tenant');
      }
    }

    if (grievance.status !== 'RESOLVED') {
      throw new CustomError('Only resolved grievances can be closed', 400);
    }

    // Update grievance
    const updatedGrievance = await prisma.grievance.update({
      where: { id: grievanceId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        assignedTo: {
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
    await this.logActivity('grievance:closed', grievance.id, userId, {
      grievanceTitle: grievance.title,
    });

    // Send notifications
    await this.sendGrievanceNotifications(updatedGrievance, 'closed');

    return updatedGrievance;
  }

  // Get grievance statistics
  async getGrievanceStats(factoryId?: string, userId?: string): Promise<GrievanceStats> {
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
          where.factoryId = user.factoryId;
        }
      }
    }

    if (factoryId) {
      where.factoryId = factoryId;
    }

    // Get statistics
    const [
      total,
      open,
      inProgress,
      resolved,
      closed,
      byCategory,
      bySeverity,
      byStatus,
      slaCompliance,
    ] = await Promise.all([
      prisma.grievance.count({ where }),
      prisma.grievance.count({ where: { ...where, status: 'SUBMITTED' } }),
      prisma.grievance.count({ where: { ...where, status: 'ASSIGNED' } }),
      prisma.grievance.count({ where: { ...where, status: 'RESOLVED' } }),
      prisma.grievance.count({ where: { ...where, status: 'CLOSED' } }),
      prisma.grievance.groupBy({
        by: ['category'],
        where,
        _count: { category: true },
      }),
      prisma.grievance.groupBy({
        by: ['severity'],
        where,
        _count: { severity: true },
      }),
      prisma.grievance.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      this.calculateSLACompliance(where),
    ]);

    // Calculate average resolution time
    const resolvedGrievances = await prisma.grievance.findMany({
      where: { ...where, status: 'CLOSED', resolutionDate: { not: null } },
      select: {
        submittedAt: true,
        resolutionDate: true,
      },
    });

    const averageResolutionTime = resolvedGrievances.length > 0
      ? resolvedGrievances.reduce((sum, g) => {
          const resolutionTime = g.resolutionDate!.getTime() - g.submittedAt.getTime();
          return sum + resolutionTime;
        }, 0) / resolvedGrievances.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      byCategory: byCategory.map(item => ({
        category: item.category,
        count: item._count.category,
      })),
      bySeverity: bySeverity.map(item => ({
        severity: item.severity,
        count: item._count.severity,
      })),
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      averageResolutionTime,
      slaCompliance,
    };
  }

  // Calculate priority based on severity
  private calculatePriority(severity: GrievanceSeverity): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    switch (severity) {
      case 'LOW':
        return 'LOW';
      case 'MEDIUM':
        return 'MEDIUM';
      case 'HIGH':
        return 'HIGH';
      case 'CRITICAL':
        return 'CRITICAL';
      default:
        return 'MEDIUM';
    }
  }

  // Calculate SLA compliance
  private async calculateSLACompliance(where: any): Promise<number> {
    const totalGrievances = await prisma.grievance.count({ where });
    
    if (totalGrievances === 0) return 100;

    const slaCompliantGrievances = await prisma.grievance.count({
      where: {
        ...where,
        status: { in: ['RESOLVED', 'CLOSED'] },
        resolutionDate: { not: null },
        submittedAt: {
          lte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        },
      },
    });

    return (slaCompliantGrievances / totalGrievances) * 100;
  }

  // Send grievance notifications
  private async sendGrievanceNotifications(grievance: Grievance, event: string): Promise<void> {
    // This would integrate with your notification service
    // For now, we'll just log the notification
    console.log(`Grievance notification: ${event} for grievance ${grievance.id}`);
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
          type: 'GRIEVANCE',
          title: `Grievance ${action}`,
          description: `Grievance ${action} by user`,
          resource: resourceId,
          metadata,
          userId: userId === 'anonymous' ? null : userId,
          tenantId: user?.tenantId || '',
          factoryId: user?.factoryId || '',
        },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

export const grievanceService = new GrievanceService();
