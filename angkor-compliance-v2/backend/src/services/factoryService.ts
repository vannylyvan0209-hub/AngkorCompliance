import { prisma } from '../index';
import { Factory, UserRole } from '@prisma/client';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';

export interface CreateFactoryData {
  name: string;
  code: string;
  address: string;
  country: string;
  industry: string;
  size: number;
  tenantId: string;
}

export interface UpdateFactoryData {
  name?: string;
  address?: string;
  country?: string;
  industry?: string;
  size?: number;
  isActive?: boolean;
}

export interface FactoryFilters {
  search?: string;
  country?: string;
  industry?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedFactoryResponse {
  data: Factory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class FactoryService {
  // Create a new factory
  async createFactory(data: CreateFactoryData, userId: string): Promise<Factory> {
    // Check if user has permission to create factories
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Only super admin can create factories
    if (user.role !== 'SUPER_ADMIN') {
      throw createForbiddenError('Only super admin can create factories');
    }

    // Check if factory code already exists
    const existingFactory = await prisma.factory.findUnique({
      where: { code: data.code },
    });

    if (existingFactory) {
      throw new CustomError('Factory with this code already exists', 409);
    }

    // Validate tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId },
    });

    if (!tenant) {
      throw createNotFoundError('Tenant');
    }

    // Create factory
    const factory = await prisma.factory.create({
      data: {
        ...data,
        isActive: true,
      },
      include: {
        tenant: true,
        _count: {
          select: {
            users: true,
            documents: true,
            audits: true,
            grievances: true,
            trainings: true,
            permits: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('factory:created', factory.id, userId, {
      factoryName: factory.name,
      factoryCode: factory.code,
    });

    return factory;
  }

  // Get all factories with filtering and pagination
  async getFactories(
    filters: FactoryFilters,
    userId: string
  ): Promise<PaginatedFactoryResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const {
      search,
      country,
      industry,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {};

    // Super admin can see all factories, others only see their tenant's factories
    if (user.role !== 'SUPER_ADMIN') {
      where.tenantId = user.tenantId;
    }

    // Factory admin can only see their factory
    if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
      where.id = user.factoryId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (country) {
      where.country = country;
    }

    if (industry) {
      where.industry = industry;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await prisma.factory.count({ where });

    // Get factories
    const factories = await prisma.factory.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
        _count: {
          select: {
            users: true,
            documents: true,
            audits: true,
            grievances: true,
            trainings: true,
            permits: true,
          },
        },
      },
    });

    return {
      data: factories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get factory by ID
  async getFactoryById(factoryId: string, userId: string): Promise<Factory> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Build where clause based on user role
    const where: any = { id: factoryId };

    if (user.role !== 'SUPER_ADMIN') {
      where.tenantId = user.tenantId;
    }

    if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
      where.id = user.factoryId;
    }

    const factory = await prisma.factory.findFirst({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
        _count: {
          select: {
            users: true,
            documents: true,
            audits: true,
            grievances: true,
            trainings: true,
            permits: true,
          },
        },
      },
    });

    if (!factory) {
      throw createNotFoundError('Factory');
    }

    return factory;
  }

  // Update factory
  async updateFactory(
    factoryId: string,
    data: UpdateFactoryData,
    userId: string
  ): Promise<Factory> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check if user has permission to update this factory
    const existingFactory = await prisma.factory.findUnique({
      where: { id: factoryId },
    });

    if (!existingFactory) {
      throw createNotFoundError('Factory');
    }

    // Super admin can update any factory, factory admin can only update their factory
    if (user.role !== 'SUPER_ADMIN') {
      if (user.role === 'FACTORY_ADMIN' && user.factoryId !== factoryId) {
        throw createForbiddenError('You can only update your assigned factory');
      }
      if (user.tenantId !== existingFactory.tenantId) {
        throw createForbiddenError('You can only update factories in your tenant');
      }
    }

    // Update factory
    const factory = await prisma.factory.update({
      where: { id: factoryId },
      data,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
        _count: {
          select: {
            users: true,
            documents: true,
            audits: true,
            grievances: true,
            trainings: true,
            permits: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('factory:updated', factory.id, userId, {
      changes: data,
      factoryName: factory.name,
    });

    return factory;
  }

  // Delete factory (soft delete by setting isActive to false)
  async deleteFactory(factoryId: string, userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Only super admin can delete factories
    if (user.role !== 'SUPER_ADMIN') {
      throw createForbiddenError('Only super admin can delete factories');
    }

    const factory = await prisma.factory.findUnique({
      where: { id: factoryId },
    });

    if (!factory) {
      throw createNotFoundError('Factory');
    }

    // Soft delete by setting isActive to false
    await prisma.factory.update({
      where: { id: factoryId },
      data: { isActive: false },
    });

    // Log activity
    await this.logActivity('factory:deleted', factory.id, userId, {
      factoryName: factory.name,
      factoryCode: factory.code,
    });
  }

  // Get factory statistics
  async getFactoryStats(factoryId: string, userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check if user has access to this factory
    if (user.role !== 'SUPER_ADMIN') {
      if (user.role === 'FACTORY_ADMIN' && user.factoryId !== factoryId) {
        throw createForbiddenError('You can only view stats for your assigned factory');
      }
    }

    const factory = await prisma.factory.findUnique({
      where: { id: factoryId },
    });

    if (!factory) {
      throw createNotFoundError('Factory');
    }

    // Get statistics
    const [
      totalUsers,
      activeUsers,
      totalDocuments,
      totalAudits,
      openGrievances,
      totalTrainings,
      expiringPermits,
      recentActivities,
    ] = await Promise.all([
      prisma.user.count({
        where: { factoryId, isActive: true },
      }),
      prisma.user.count({
        where: { factoryId, isActive: true, lastLoginAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.document.count({
        where: { factoryId, isActive: true },
      }),
      prisma.audit.count({
        where: { factoryId },
      }),
      prisma.grievance.count({
        where: { factoryId, status: { in: ['SUBMITTED', 'ASSIGNED', 'INVESTIGATING'] } },
      }),
      prisma.training.count({
        where: { factoryId },
      }),
      prisma.permit.count({
        where: {
          factoryId,
          expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
          status: 'VALID',
        },
      }),
      prisma.activity.findMany({
        where: { factoryId },
        orderBy: { timestamp: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    return {
      factory: {
        id: factory.id,
        name: factory.name,
        code: factory.code,
        industry: factory.industry,
        size: factory.size,
        isActive: factory.isActive,
      },
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        documents: totalDocuments,
        audits: totalAudits,
        grievances: {
          open: openGrievances,
        },
        trainings: totalTrainings,
        permits: {
          expiring: expiringPermits,
        },
      },
      recentActivities,
    };
  }

  // Get factory compliance overview
  async getFactoryComplianceOverview(factoryId: string, userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check if user has access to this factory
    if (user.role !== 'SUPER_ADMIN') {
      if (user.role === 'FACTORY_ADMIN' && user.factoryId !== factoryId) {
        throw createForbiddenError('You can only view compliance for your assigned factory');
      }
    }

    const factory = await prisma.factory.findUnique({
      where: { id: factoryId },
    });

    if (!factory) {
      throw createNotFoundError('Factory');
    }

    // Get compliance data
    const [
      totalStandards,
      activeAudits,
      openFindings,
      overdueActions,
      complianceScore,
    ] = await Promise.all([
      prisma.complianceStandard.count({
        where: { tenantId: factory.tenantId, isActive: true },
      }),
      prisma.audit.count({
        where: { factoryId, status: 'IN_PROGRESS' },
      }),
      prisma.auditFinding.count({
        where: {
          audit: { factoryId },
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),
      prisma.correctiveAction.count({
        where: {
          finding: {
            audit: { factoryId },
          },
          dueDate: { lt: new Date() },
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      }),
      // Calculate compliance score based on various factors
      this.calculateComplianceScore(factoryId),
    ]);

    return {
      factory: {
        id: factory.id,
        name: factory.name,
        code: factory.code,
      },
      compliance: {
        score: complianceScore,
        standards: totalStandards,
        activeAudits,
        openFindings,
        overdueActions,
        status: complianceScore >= 80 ? 'Good' : complianceScore >= 60 ? 'Fair' : 'Poor',
      },
    };
  }

  // Calculate compliance score
  private async calculateComplianceScore(factoryId: string): Promise<number> {
    // This is a simplified calculation - in reality, this would be more complex
    const [
      totalAudits,
      passedAudits,
      openFindings,
      overdueActions,
    ] = await Promise.all([
      prisma.audit.count({
        where: { factoryId, status: 'COMPLETED' },
      }),
      prisma.audit.count({
        where: { factoryId, status: 'COMPLETED', score: { gte: 80 } },
      }),
      prisma.auditFinding.count({
        where: {
          audit: { factoryId },
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),
      prisma.correctiveAction.count({
        where: {
          finding: {
            audit: { factoryId },
          },
          dueDate: { lt: new Date() },
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      }),
    ]);

    if (totalAudits === 0) return 0;

    const auditScore = (passedAudits / totalAudits) * 100;
    const findingsPenalty = Math.min(openFindings * 5, 20); // Max 20 point penalty
    const actionsPenalty = Math.min(overdueActions * 3, 15); // Max 15 point penalty

    return Math.max(0, auditScore - findingsPenalty - actionsPenalty);
  }

  // Log activity
  private async logActivity(
    action: string,
    resourceId: string,
    userId: string,
    metadata: any
  ): Promise<void> {
    try {
      await prisma.activity.create({
        data: {
          type: 'SYSTEM',
          title: `Factory ${action}`,
          description: `Factory ${action} by user`,
          resource: resourceId,
          metadata,
          userId,
          tenantId: (await prisma.user.findUnique({ where: { id: userId } }))?.tenantId || '',
          factoryId: resourceId,
        },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

export const factoryService = new FactoryService();
