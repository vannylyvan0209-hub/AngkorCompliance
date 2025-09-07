import { prisma } from '../index';
import { Permit, PermitStatus, PermitType } from '@prisma/client';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';

export interface CreatePermitData {
  type: PermitType;
  number: string;
  title: string;
  description?: string;
  factoryId: string;
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  renewalRequired: boolean;
  renewalPeriod?: number; // in days
  requirements?: string[];
  documents?: string[];
  contactInfo?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePermitData {
  type?: PermitType;
  number?: string;
  title?: string;
  description?: string;
  issuedBy?: string;
  issuedDate?: Date;
  expiryDate?: Date;
  renewalRequired?: boolean;
  renewalPeriod?: number;
  requirements?: string[];
  documents?: string[];
  contactInfo?: string;
  status?: PermitStatus;
  metadata?: Record<string, any>;
}

export interface PermitFilters {
  search?: string;
  type?: PermitType;
  status?: PermitStatus;
  factoryId?: string;
  issuedBy?: string;
  expiryDateFrom?: Date;
  expiryDateTo?: Date;
  isExpiring?: boolean;
  isExpired?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedPermitResponse {
  data: Permit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PermitStats {
  total: number;
  valid: number;
  expired: number;
  expiring: number;
  byType: Array<{ type: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  expiringSoon: Array<{ id: string; title: string; expiryDate: Date; daysUntilExpiry: number }>;
  expiredRecently: Array<{ id: string; title: string; expiryDate: Date; daysSinceExpiry: number }>;
}

class PermitService {
  // Create a new permit
  async createPermit(data: CreatePermitData, userId: string): Promise<Permit> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Only super admin, factory admin, or HR staff can create permits
    if (!['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF'].includes(user.role)) {
      throw createForbiddenError('You do not have permission to create permits');
    }

    // Validate factory access
    if (user.role !== 'SUPER_ADMIN') {
      if (user.role === 'FACTORY_ADMIN' && user.factoryId !== data.factoryId) {
        throw createForbiddenError('You can only create permits for your assigned factory');
      }
    }

    // Validate factory exists
    const factory = await prisma.factory.findUnique({
      where: { id: data.factoryId },
    });

    if (!factory) {
      throw createNotFoundError('Factory');
    }

    // Check if permit number already exists
    const existingPermit = await prisma.permit.findFirst({
      where: {
        number: data.number,
        factoryId: data.factoryId,
      },
    });

    if (existingPermit) {
      throw new CustomError('Permit with this number already exists for this factory', 409);
    }

    // Determine initial status based on expiry date
    const now = new Date();
    const status = data.expiryDate < now ? 'EXPIRED' : 'VALID';

    // Create permit
    const permit = await prisma.permit.create({
      data: {
        ...data,
        createdById: userId,
        tenantId: user.tenantId,
        status,
        requirements: data.requirements || [],
        documents: data.documents || [],
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
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            documents: true,
            renewals: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('permit:created', permit.id, userId, {
      permitTitle: permit.title,
      permitNumber: permit.number,
      permitType: permit.type,
      factoryName: factory.name,
    });

    return permit;
  }

  // Get all permits with filtering and pagination
  async getPermits(
    filters: PermitFilters,
    userId: string
  ): Promise<PaginatedPermitResponse> {
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
      factoryId,
      issuedBy,
      expiryDateFrom,
      expiryDateTo,
      isExpiring,
      isExpired,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
    };

    // Super admin can see all permits, others only see their tenant's permits
    if (user.role !== 'SUPER_ADMIN') {
      // Factory admin can only see permits from their factory
      if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
        where.factoryId = user.factoryId;
      }
    }

    if (factoryId) {
      where.factoryId = factoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { number: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { issuedBy: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (issuedBy) {
      where.issuedBy = { contains: issuedBy, mode: 'insensitive' };
    }

    if (expiryDateFrom || expiryDateTo) {
      where.expiryDate = {};
      if (expiryDateFrom) where.expiryDate.gte = expiryDateFrom;
      if (expiryDateTo) where.expiryDate.lte = expiryDateTo;
    }

    if (isExpiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.expiryDate = { lte: thirtyDaysFromNow };
      where.status = 'VALID';
    }

    if (isExpired) {
      where.expiryDate = { lt: new Date() };
      where.status = 'EXPIRED';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await prisma.permit.count({ where });

    // Get permits
    const permits = await prisma.permit.findMany({
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
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            documents: true,
            renewals: true,
          },
        },
      },
    });

    return {
      data: permits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get permit by ID
  async getPermitById(permitId: string, userId: string): Promise<Permit> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Build where clause based on user role
    const where: any = {
      id: permitId,
      tenantId: user.tenantId,
    };

    if (user.role !== 'SUPER_ADMIN') {
      if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
        where.factoryId = user.factoryId;
      }
    }

    const permit = await prisma.permit.findFirst({
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
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        documents: {
          include: {
            document: {
              select: {
                id: true,
                title: true,
                type: true,
                filePath: true,
              },
            },
          },
        },
        renewals: {
          orderBy: { renewalDate: 'desc' },
          include: {
            renewedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            documents: true,
            renewals: true,
          },
        },
      },
    });

    if (!permit) {
      throw createNotFoundError('Permit');
    }

    return permit;
  }

  // Update permit
  async updatePermit(
    permitId: string,
    data: UpdatePermitData,
    userId: string
  ): Promise<Permit> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check if user has permission to update this permit
    const existingPermit = await prisma.permit.findUnique({
      where: { id: permitId },
    });

    if (!existingPermit) {
      throw createNotFoundError('Permit');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== existingPermit.tenantId) {
        throw createForbiddenError('You can only update permits in your tenant');
      }
      if (user.role === 'FACTORY_ADMIN' && user.factoryId !== existingPermit.factoryId) {
        throw createForbiddenError('You can only update permits in your assigned factory');
      }
    }

    // Check if permit number already exists (if being updated)
    if (data.number && data.number !== existingPermit.number) {
      const existingPermitWithNumber = await prisma.permit.findFirst({
        where: {
          number: data.number,
          factoryId: existingPermit.factoryId,
          id: { not: permitId },
        },
      });

      if (existingPermitWithNumber) {
        throw new CustomError('Permit with this number already exists for this factory', 409);
      }
    }

    // Determine status based on expiry date
    let status = data.status || existingPermit.status;
    if (data.expiryDate) {
      const now = new Date();
      status = data.expiryDate < now ? 'EXPIRED' : 'VALID';
    }

    // Update permit
    const permit = await prisma.permit.update({
      where: { id: permitId },
      data: {
        ...data,
        status,
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
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            documents: true,
            renewals: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('permit:updated', permit.id, userId, {
      permitTitle: permit.title,
      permitNumber: permit.number,
      changes: data,
    });

    return permit;
  }

  // Renew permit
  async renewPermit(
    permitId: string,
    newExpiryDate: Date,
    renewalNotes?: string,
    userId: string
  ): Promise<Permit> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const permit = await prisma.permit.findUnique({
      where: { id: permitId },
    });

    if (!permit) {
      throw createNotFoundError('Permit');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== permit.tenantId) {
        throw createForbiddenError('You can only renew permits in your tenant');
      }
    }

    if (newExpiryDate <= permit.expiryDate) {
      throw new CustomError('New expiry date must be after current expiry date', 400);
    }

    // Update permit
    const updatedPermit = await prisma.permit.update({
      where: { id: permitId },
      data: {
        expiryDate: newExpiryDate,
        status: 'VALID',
        updatedAt: new Date(),
        renewals: {
          create: {
            renewalDate: new Date(),
            newExpiryDate,
            renewalNotes,
            renewedById: userId,
            tenantId: user.tenantId,
            factoryId: permit.factoryId,
          },
        },
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
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        renewals: {
          orderBy: { renewalDate: 'desc' },
          include: {
            renewedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Log activity
    await this.logActivity('permit:renewed', permit.id, userId, {
      permitTitle: permit.title,
      permitNumber: permit.number,
      newExpiryDate,
      renewalNotes,
    });

    return updatedPermit;
  }

  // Revoke permit
  async revokePermit(
    permitId: string,
    revocationReason: string,
    userId: string
  ): Promise<Permit> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const permit = await prisma.permit.findUnique({
      where: { id: permitId },
    });

    if (!permit) {
      throw createNotFoundError('Permit');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== permit.tenantId) {
        throw createForbiddenError('You can only revoke permits in your tenant');
      }
    }

    if (permit.status === 'REVOKED') {
      throw new CustomError('Permit is already revoked', 400);
    }

    // Update permit
    const updatedPermit = await prisma.permit.update({
      where: { id: permitId },
      data: {
        status: 'REVOKED',
        updatedAt: new Date(),
        metadata: {
          ...permit.metadata,
          revocationReason,
          revokedAt: new Date(),
          revokedBy: userId,
        },
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
    await this.logActivity('permit:revoked', permit.id, userId, {
      permitTitle: permit.title,
      permitNumber: permit.number,
      revocationReason,
    });

    return updatedPermit;
  }

  // Get permit statistics
  async getPermitStats(factoryId?: string, userId?: string): Promise<PermitStats> {
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
      valid,
      expired,
      expiring,
      byType,
      byStatus,
    ] = await Promise.all([
      prisma.permit.count({ where }),
      prisma.permit.count({ where: { ...where, status: 'VALID' } }),
      prisma.permit.count({ where: { ...where, status: 'EXPIRED' } }),
      prisma.permit.count({
        where: {
          ...where,
          status: 'VALID',
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
        },
      }),
      prisma.permit.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      prisma.permit.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
    ]);

    // Get expiring soon permits
    const expiringSoon = await prisma.permit.findMany({
      where: {
        ...where,
        status: 'VALID',
        expiryDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      },
      select: {
        id: true,
        title: true,
        expiryDate: true,
      },
      orderBy: { expiryDate: 'asc' },
      take: 10,
    });

    // Get recently expired permits
    const expiredRecently = await prisma.permit.findMany({
      where: {
        ...where,
        status: 'EXPIRED',
        expiryDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      },
      select: {
        id: true,
        title: true,
        expiryDate: true,
      },
      orderBy: { expiryDate: 'desc' },
      take: 10,
    });

    // Calculate days until/since expiry
    const now = new Date();
    const expiringSoonWithDays = expiringSoon.map(permit => ({
      ...permit,
      daysUntilExpiry: Math.ceil((permit.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    const expiredRecentlyWithDays = expiredRecently.map(permit => ({
      ...permit,
      daysSinceExpiry: Math.ceil((now.getTime() - permit.expiryDate.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return {
      total,
      valid,
      expired,
      expiring,
      byType: byType.map(item => ({
        type: item.type,
        count: item._count.type,
      })),
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      expiringSoon: expiringSoonWithDays,
      expiredRecently: expiredRecentlyWithDays,
    };
  }

  // Check for expiring permits and send notifications
  async checkExpiringPermits(): Promise<void> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringPermits = await prisma.permit.findMany({
      where: {
        status: 'VALID',
        expiryDate: {
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // This would integrate with your notification service
    for (const permit of expiringPermits) {
      console.log(`Permit ${permit.title} (${permit.number}) expires on ${permit.expiryDate.toISOString()}`);
      // Send notification to relevant stakeholders
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
          type: 'PERMIT',
          title: `Permit ${action}`,
          description: `Permit ${action} by user`,
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

export const permitService = new PermitService();
