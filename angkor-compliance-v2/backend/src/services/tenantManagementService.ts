import { prisma } from '../index';
import { Tenant, TenantStatus, TenantPlan } from '@prisma/client';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';

export interface CreateTenantData {
  name: string;
  code: string;
  description?: string;
  status: TenantStatus;
  plan: TenantPlan;
  maxUsers: number;
  maxFactories: number;
  maxStorageGB: number;
  features: string[];
  settings: Record<string, any>;
  billingEmail: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  country: string;
  timezone: string;
  language: string;
  currency: string;
  metadata?: Record<string, any>;
}

export interface UpdateTenantData {
  name?: string;
  code?: string;
  description?: string;
  status?: TenantStatus;
  plan?: TenantPlan;
  maxUsers?: number;
  maxFactories?: number;
  maxStorageGB?: number;
  features?: string[];
  settings?: Record<string, any>;
  billingEmail?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  country?: string;
  timezone?: string;
  language?: string;
  currency?: string;
  metadata?: Record<string, any>;
}

export interface TenantFilters {
  search?: string;
  status?: TenantStatus;
  plan?: TenantPlan;
  country?: string;
  createdDateFrom?: Date;
  createdDateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTenantResponse {
  data: Tenant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TenantStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  byPlan: Array<{ plan: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  byCountry: Array<{ country: string; count: number }>;
  recentTenants: Array<{ id: string; name: string; code: string; createdAt: Date }>;
  newTenantsThisMonth: number;
  newTenantsThisWeek: number;
  totalUsers: number;
  totalFactories: number;
  totalStorageUsed: number;
  averageUsersPerTenant: number;
  averageFactoriesPerTenant: number;
}

export interface TenantUsage {
  tenantId: string;
  usersCount: number;
  factoriesCount: number;
  storageUsedGB: number;
  storageLimitGB: number;
  featuresUsed: string[];
  featuresAvailable: string[];
  lastActivity: Date;
  complianceScore: number;
  auditCount: number;
  grievanceCount: number;
  trainingCount: number;
  permitCount: number;
  documentCount: number;
}

export interface TenantConfiguration {
  tenantId: string;
  settings: Record<string, any>;
  features: string[];
  limits: {
    maxUsers: number;
    maxFactories: number;
    maxStorageGB: number;
  };
  billing: {
    plan: string;
    billingEmail: string;
    nextBillingDate?: Date;
  };
  compliance: {
    standards: string[];
    auditFrequency: string;
    reportingFrequency: string;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    inAppEnabled: boolean;
  };
}

class TenantManagementService {
  // Create a new tenant
  async createTenant(data: CreateTenantData, createdById: string): Promise<Tenant> {
    const creator = await prisma.user.findUnique({
      where: { id: createdById },
    });

    if (!creator) {
      throw createNotFoundError('Creator User');
    }

    // Only super admin can create tenants
    if (creator.role !== 'SUPER_ADMIN') {
      throw createForbiddenError('You do not have permission to create tenants');
    }

    // Check if tenant code already exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { code: data.code },
    });

    if (existingTenant) {
      throw new CustomError('Tenant with this code already exists', 409);
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        ...data,
        createdById: createdById,
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
        _count: {
          select: {
            users: true,
            factories: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('tenant:created', tenant.id, createdById, {
      tenantName: tenant.name,
      tenantCode: tenant.code,
      plan: tenant.plan,
    });

    return tenant;
  }

  // Get all tenants with filtering and pagination
  async getTenants(
    filters: TenantFilters,
    userId: string
  ): Promise<PaginatedTenantResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Only super admin can view all tenants
    if (user.role !== 'SUPER_ADMIN') {
      throw createForbiddenError('You do not have permission to view all tenants');
    }

    const {
      search,
      status,
      plan,
      country,
      createdDateFrom,
      createdDateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { billingEmail: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (plan) {
      where.plan = plan;
    }

    if (country) {
      where.country = country;
    }

    if (createdDateFrom || createdDateTo) {
      where.createdAt = {};
      if (createdDateFrom) where.createdAt.gte = createdDateFrom;
      if (createdDateTo) where.createdAt.lte = createdDateTo;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await prisma.tenant.count({ where });

    // Get tenants
    const tenants = await prisma.tenant.findMany({
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
        _count: {
          select: {
            users: true,
            factories: true,
          },
        },
      },
    });

    return {
      data: tenants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get tenant by ID
  async getTenantById(tenantId: string, userId: string): Promise<Tenant> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== tenantId) {
        throw createForbiddenError('You can only view your own tenant');
      }
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        factories: {
          select: {
            id: true,
            name: true,
            code: true,
            industry: true,
            country: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            users: true,
            factories: true,
          },
        },
      },
    });

    if (!tenant) {
      throw createNotFoundError('Tenant');
    }

    return tenant;
  }

  // Update tenant
  async updateTenant(
    tenantId: string,
    data: UpdateTenantData,
    updaterId: string
  ): Promise<Tenant> {
    const updater = await prisma.user.findUnique({
      where: { id: updaterId },
    });

    if (!updater) {
      throw createNotFoundError('Updater User');
    }

    // Check if tenant exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!existingTenant) {
      throw createNotFoundError('Tenant');
    }

    // Check access permissions
    if (updater.role !== 'SUPER_ADMIN') {
      if (updater.tenantId !== tenantId) {
        throw createForbiddenError('You can only update your own tenant');
      }
    }

    // Check if tenant code already exists (if being updated)
    if (data.code && data.code !== existingTenant.code) {
      const existingTenantWithCode = await prisma.tenant.findUnique({
        where: { code: data.code },
      });

      if (existingTenantWithCode) {
        throw new CustomError('Tenant with this code already exists', 409);
      }
    }

    // Update tenant
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
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
        _count: {
          select: {
            users: true,
            factories: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('tenant:updated', tenant.id, updaterId, {
      tenantName: tenant.name,
      tenantCode: tenant.code,
      changes: data,
    });

    return tenant;
  }

  // Activate tenant
  async activateTenant(tenantId: string, activatorId: string): Promise<Tenant> {
    const activator = await prisma.user.findUnique({
      where: { id: activatorId },
    });

    if (!activator) {
      throw createNotFoundError('Activator User');
    }

    // Only super admin can activate tenants
    if (activator.role !== 'SUPER_ADMIN') {
      throw createForbiddenError('You do not have permission to activate tenants');
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw createNotFoundError('Tenant');
    }

    if (tenant.status === 'ACTIVE') {
      throw new CustomError('Tenant is already active', 400);
    }

    // Update tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: 'ACTIVE',
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
        _count: {
          select: {
            users: true,
            factories: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('tenant:activated', tenant.id, activatorId, {
      tenantName: tenant.name,
      tenantCode: tenant.code,
    });

    return updatedTenant;
  }

  // Suspend tenant
  async suspendTenant(tenantId: string, suspenderId: string): Promise<Tenant> {
    const suspender = await prisma.user.findUnique({
      where: { id: suspenderId },
    });

    if (!suspender) {
      throw createNotFoundError('Suspender User');
    }

    // Only super admin can suspend tenants
    if (suspender.role !== 'SUPER_ADMIN') {
      throw createForbiddenError('You do not have permission to suspend tenants');
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw createNotFoundError('Tenant');
    }

    if (tenant.status === 'SUSPENDED') {
      throw new CustomError('Tenant is already suspended', 400);
    }

    // Update tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: 'SUSPENDED',
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
        _count: {
          select: {
            users: true,
            factories: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('tenant:suspended', tenant.id, suspenderId, {
      tenantName: tenant.name,
      tenantCode: tenant.code,
    });

    return updatedTenant;
  }

  // Get tenant usage statistics
  async getTenantUsage(tenantId: string, userId: string): Promise<TenantUsage> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== tenantId) {
        throw createForbiddenError('You can only view usage for your own tenant');
      }
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw createNotFoundError('Tenant');
    }

    // Get usage statistics
    const [
      usersCount,
      factoriesCount,
      storageUsed,
      lastActivity,
      complianceScore,
      auditCount,
      grievanceCount,
      trainingCount,
      permitCount,
      documentCount,
    ] = await Promise.all([
      prisma.user.count({ where: { tenantId } }),
      prisma.factory.count({ where: { tenantId } }),
      prisma.document.aggregate({
        where: { tenantId },
        _sum: { fileSize: true },
      }),
      prisma.activity.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.complianceAssessment.aggregate({
        where: { tenantId },
        _avg: { overallScore: true },
      }),
      prisma.audit.count({ where: { tenantId } }),
      prisma.grievance.count({ where: { tenantId } }),
      prisma.training.count({ where: { tenantId } }),
      prisma.permit.count({ where: { tenantId } }),
      prisma.document.count({ where: { tenantId } }),
    ]);

    const storageUsedGB = Math.round((storageUsed._sum.fileSize || 0) / (1024 * 1024 * 1024) * 100) / 100;

    return {
      tenantId,
      usersCount,
      factoriesCount,
      storageUsedGB,
      storageLimitGB: tenant.maxStorageGB,
      featuresUsed: tenant.features,
      featuresAvailable: tenant.features,
      lastActivity: lastActivity?.createdAt || tenant.createdAt,
      complianceScore: Math.round(complianceScore._avg.overallScore || 0),
      auditCount,
      grievanceCount,
      trainingCount,
      permitCount,
      documentCount,
    };
  }

  // Get tenant configuration
  async getTenantConfiguration(tenantId: string, userId: string): Promise<TenantConfiguration> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== tenantId) {
        throw createForbiddenError('You can only view configuration for your own tenant');
      }
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw createNotFoundError('Tenant');
    }

    return {
      tenantId,
      settings: tenant.settings,
      features: tenant.features,
      limits: {
        maxUsers: tenant.maxUsers,
        maxFactories: tenant.maxFactories,
        maxStorageGB: tenant.maxStorageGB,
      },
      billing: {
        plan: tenant.plan,
        billingEmail: tenant.billingEmail,
        nextBillingDate: tenant.nextBillingDate,
      },
      compliance: {
        standards: tenant.features.filter(f => f.startsWith('STANDARD_')),
        auditFrequency: tenant.settings.auditFrequency || 'ANNUAL',
        reportingFrequency: tenant.settings.reportingFrequency || 'MONTHLY',
      },
      notifications: {
        emailEnabled: tenant.settings.emailNotifications !== false,
        smsEnabled: tenant.settings.smsNotifications === true,
        inAppEnabled: tenant.settings.inAppNotifications !== false,
      },
    };
  }

  // Update tenant configuration
  async updateTenantConfiguration(
    tenantId: string,
    configuration: Partial<TenantConfiguration>,
    updaterId: string
  ): Promise<TenantConfiguration> {
    const updater = await prisma.user.findUnique({
      where: { id: updaterId },
    });

    if (!updater) {
      throw createNotFoundError('Updater User');
    }

    // Check access permissions
    if (updater.role !== 'SUPER_ADMIN') {
      if (updater.tenantId !== tenantId) {
        throw createForbiddenError('You can only update configuration for your own tenant');
      }
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw createNotFoundError('Tenant');
    }

    // Update tenant configuration
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: configuration.settings || tenant.settings,
        features: configuration.features || tenant.features,
        maxUsers: configuration.limits?.maxUsers || tenant.maxUsers,
        maxFactories: configuration.limits?.maxFactories || tenant.maxFactories,
        maxStorageGB: configuration.limits?.maxStorageGB || tenant.maxStorageGB,
        plan: configuration.billing?.plan || tenant.plan,
        billingEmail: configuration.billing?.billingEmail || tenant.billingEmail,
        updatedAt: new Date(),
      },
    });

    // Log activity
    await this.logActivity('tenant:configuration_updated', tenant.id, updaterId, {
      tenantName: tenant.name,
      tenantCode: tenant.code,
      configuration,
    });

    return this.getTenantConfiguration(tenantId, updaterId);
  }

  // Get tenant statistics
  async getTenantStats(userId?: string): Promise<TenantStats> {
    const user = userId ? await prisma.user.findUnique({
      where: { id: userId },
    }) : null;

    if (userId && !user) {
      throw createNotFoundError('User');
    }

    // Only super admin can view tenant statistics
    if (user && user.role !== 'SUPER_ADMIN') {
      throw createForbiddenError('You do not have permission to view tenant statistics');
    }

    // Get statistics
    const [
      total,
      active,
      inactive,
      suspended,
      byPlan,
      byStatus,
      byCountry,
      recentTenants,
      newTenantsThisMonth,
      newTenantsThisWeek,
      totalUsers,
      totalFactories,
      totalStorageUsed,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.tenant.count({ where: { status: 'INACTIVE' } }),
      prisma.tenant.count({ where: { status: 'SUSPENDED' } }),
      prisma.tenant.groupBy({
        by: ['plan'],
        _count: { plan: true },
      }),
      prisma.tenant.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.tenant.groupBy({
        by: ['country'],
        _count: { country: true },
      }),
      prisma.tenant.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          code: true,
          createdAt: true,
        },
      }),
      prisma.tenant.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.tenant.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.user.count(),
      prisma.factory.count(),
      prisma.document.aggregate({
        _sum: { fileSize: true },
      }),
    ]);

    const storageUsedGB = Math.round((totalStorageUsed._sum.fileSize || 0) / (1024 * 1024 * 1024) * 100) / 100;

    return {
      total,
      active,
      inactive,
      suspended,
      byPlan: byPlan.map(item => ({
        plan: item.plan,
        count: item._count.plan,
      })),
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      byCountry: byCountry.map(item => ({
        country: item.country,
        count: item._count.country,
      })),
      recentTenants,
      newTenantsThisMonth,
      newTenantsThisWeek,
      totalUsers,
      totalFactories,
      totalStorageUsed: storageUsedGB,
      averageUsersPerTenant: total > 0 ? Math.round((totalUsers / total) * 100) / 100 : 0,
      averageFactoriesPerTenant: total > 0 ? Math.round((totalFactories / total) * 100) / 100 : 0,
    };
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
          type: 'TENANT_MANAGEMENT',
          title: `Tenant Management ${action}`,
          description: `Tenant Management ${action} by user`,
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

export const tenantManagementService = new TenantManagementService();
