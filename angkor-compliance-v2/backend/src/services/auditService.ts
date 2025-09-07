import { prisma } from '../index';
import { Audit, AuditStatus, AuditType, AuditFinding, CorrectiveAction, AuditQuestion, AuditResponse } from '@prisma/client';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';

export interface CreateAuditData {
  title: string;
  type: AuditType;
  standard: string;
  scope: string;
  objectives: string;
  methodology: string;
  factoryId: string;
  plannedStartDate: Date;
  plannedEndDate: Date;
  auditorIds: string[];
  witnessIds?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateAuditData {
  title?: string;
  type?: AuditType;
  standard?: string;
  scope?: string;
  objectives?: string;
  methodology?: string;
  status?: AuditStatus;
  actualStartDate?: Date;
  actualEndDate?: Date;
  score?: number;
  summary?: string;
  recommendations?: string;
  metadata?: Record<string, any>;
}

export interface AuditFilters {
  search?: string;
  type?: AuditType;
  status?: AuditStatus;
  standard?: string;
  factoryId?: string;
  auditorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedAuditResponse {
  data: Audit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAuditFindingData {
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  requirement: string;
  evidence: string;
  rootCause?: string;
  impact?: string;
  recommendation?: string;
}

export interface CreateCorrectiveActionData {
  title: string;
  description: string;
  actionType: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedToId: string;
  dueDate: Date;
  estimatedCost?: number;
  resources?: string;
  verificationMethod?: string;
}

class AuditService {
  // Create a new audit
  async createAudit(data: CreateAuditData, userId: string): Promise<Audit> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Only super admin, factory admin, or auditor can create audits
    if (!['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR'].includes(user.role)) {
      throw createForbiddenError('You do not have permission to create audits');
    }

    // Validate factory access
    if (user.role !== 'SUPER_ADMIN') {
      if (user.role === 'FACTORY_ADMIN' && user.factoryId !== data.factoryId) {
        throw createForbiddenError('You can only create audits for your assigned factory');
      }
    }

    // Validate factory exists
    const factory = await prisma.factory.findUnique({
      where: { id: data.factoryId },
    });

    if (!factory) {
      throw createNotFoundError('Factory');
    }

    // Validate auditors exist and have appropriate roles
    const auditors = await prisma.user.findMany({
      where: {
        id: { in: data.auditorIds },
        role: { in: ['AUDITOR', 'SUPER_ADMIN'] },
        isActive: true,
      },
    });

    if (auditors.length !== data.auditorIds.length) {
      throw new CustomError('One or more auditors are invalid or inactive', 400);
    }

    // Create audit
    const audit = await prisma.audit.create({
      data: {
        ...data,
        createdById: userId,
        tenantId: user.tenantId,
        status: 'PLANNED',
        auditors: {
          connect: data.auditorIds.map(id => ({ id })),
        },
        witnesses: data.witnessIds ? {
          connect: data.witnessIds.map(id => ({ id })),
        } : undefined,
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
        auditors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        witnesses: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            findings: true,
            questions: true,
            responses: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('audit:created', audit.id, userId, {
      auditTitle: audit.title,
      auditType: audit.type,
      factoryName: factory.name,
    });

    return audit;
  }

  // Get all audits with filtering and pagination
  async getAudits(
    filters: AuditFilters,
    userId: string
  ): Promise<PaginatedAuditResponse> {
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
      standard,
      factoryId,
      auditorId,
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

    // Super admin can see all audits, others only see their tenant's audits
    if (user.role !== 'SUPER_ADMIN') {
      // Factory admin can only see audits for their factory
      if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
        where.factoryId = user.factoryId;
      }
      // Auditor can only see audits they're assigned to
      if (user.role === 'AUDITOR') {
        where.OR = [
          { createdById: userId },
          { auditors: { some: { id: userId } } },
          { witnesses: { some: { id: userId } } },
        ];
      }
    }

    if (factoryId) {
      where.factoryId = factoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { standard: { contains: search, mode: 'insensitive' } },
        { scope: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (standard) {
      where.standard = standard;
    }

    if (auditorId) {
      where.auditors = { some: { id: auditorId } };
    }

    if (dateFrom || dateTo) {
      where.plannedStartDate = {};
      if (dateFrom) where.plannedStartDate.gte = dateFrom;
      if (dateTo) where.plannedStartDate.lte = dateTo;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await prisma.audit.count({ where });

    // Get audits
    const audits = await prisma.audit.findMany({
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
        auditors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            findings: true,
            questions: true,
            responses: true,
          },
        },
      },
    });

    return {
      data: audits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get audit by ID
  async getAuditById(auditId: string, userId: string): Promise<Audit> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Build where clause based on user role
    const where: any = {
      id: auditId,
      tenantId: user.tenantId,
    };

    if (user.role !== 'SUPER_ADMIN') {
      if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
        where.factoryId = user.factoryId;
      }
      if (user.role === 'AUDITOR') {
        where.OR = [
          { createdById: userId },
          { auditors: { some: { id: userId } } },
          { witnesses: { some: { id: userId } } },
        ];
      }
    }

    const audit = await prisma.audit.findFirst({
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
        auditors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        witnesses: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        findings: {
          include: {
            correctiveActions: {
              include: {
                assignedTo: {
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
        },
        questions: {
          include: {
            responses: {
              include: {
                answeredBy: {
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
        },
        _count: {
          select: {
            findings: true,
            questions: true,
            responses: true,
          },
        },
      },
    });

    if (!audit) {
      throw createNotFoundError('Audit');
    }

    return audit;
  }

  // Update audit
  async updateAudit(
    auditId: string,
    data: UpdateAuditData,
    userId: string
  ): Promise<Audit> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check if user has permission to update this audit
    const existingAudit = await prisma.audit.findUnique({
      where: { id: auditId },
    });

    if (!existingAudit) {
      throw createNotFoundError('Audit');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== existingAudit.tenantId) {
        throw createForbiddenError('You can only update audits in your tenant');
      }
      if (user.role === 'FACTORY_ADMIN' && user.factoryId !== existingAudit.factoryId) {
        throw createForbiddenError('You can only update audits in your assigned factory');
      }
      if (user.role === 'AUDITOR') {
        const isAssigned = existingAudit.auditorIds.includes(userId) || existingAudit.createdById === userId;
        if (!isAssigned) {
          throw createForbiddenError('You can only update audits you are assigned to');
        }
      }
    }

    // Update audit
    const audit = await prisma.audit.update({
      where: { id: auditId },
      data,
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
        auditors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            findings: true,
            questions: true,
            responses: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('audit:updated', audit.id, userId, {
      auditTitle: audit.title,
      changes: data,
    });

    return audit;
  }

  // Start audit
  async startAudit(auditId: string, userId: string): Promise<Audit> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
    });

    if (!audit) {
      throw createNotFoundError('Audit');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== audit.tenantId) {
        throw createForbiddenError('You can only start audits in your tenant');
      }
      if (user.role === 'AUDITOR') {
        const isAssigned = audit.auditorIds.includes(userId) || audit.createdById === userId;
        if (!isAssigned) {
          throw createForbiddenError('You can only start audits you are assigned to');
        }
      }
    }

    if (audit.status !== 'PLANNED') {
      throw new CustomError('Only planned audits can be started', 400);
    }

    // Update audit status
    const updatedAudit = await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'IN_PROGRESS',
        actualStartDate: new Date(),
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
        auditors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('audit:started', audit.id, userId, {
      auditTitle: audit.title,
      factoryName: audit.factoryId,
    });

    return updatedAudit;
  }

  // Complete audit
  async completeAudit(
    auditId: string,
    data: { score: number; summary: string; recommendations: string },
    userId: string
  ): Promise<Audit> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
    });

    if (!audit) {
      throw createNotFoundError('Audit');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== audit.tenantId) {
        throw createForbiddenError('You can only complete audits in your tenant');
      }
      if (user.role === 'AUDITOR') {
        const isAssigned = audit.auditorIds.includes(userId) || audit.createdById === userId;
        if (!isAssigned) {
          throw createForbiddenError('You can only complete audits you are assigned to');
        }
      }
    }

    if (audit.status !== 'IN_PROGRESS') {
      throw new CustomError('Only in-progress audits can be completed', 400);
    }

    // Update audit status
    const updatedAudit = await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETED',
        actualEndDate: new Date(),
        score: data.score,
        summary: data.summary,
        recommendations: data.recommendations,
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
        auditors: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('audit:completed', audit.id, userId, {
      auditTitle: audit.title,
      score: data.score,
      factoryName: audit.factoryId,
    });

    return updatedAudit;
  }

  // Create audit finding
  async createAuditFinding(
    auditId: string,
    data: CreateAuditFindingData,
    userId: string
  ): Promise<AuditFinding> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
    });

    if (!audit) {
      throw createNotFoundError('Audit');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== audit.tenantId) {
        throw createForbiddenError('You can only create findings for audits in your tenant');
      }
      if (user.role === 'AUDITOR') {
        const isAssigned = audit.auditorIds.includes(userId) || audit.createdById === userId;
        if (!isAssigned) {
          throw createForbiddenError('You can only create findings for audits you are assigned to');
        }
      }
    }

    // Create finding
    const finding = await prisma.auditFinding.create({
      data: {
        ...data,
        auditId,
        createdById: userId,
        tenantId: user.tenantId,
        factoryId: audit.factoryId,
        status: 'OPEN',
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
        audit: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        correctiveActions: {
          include: {
            assignedTo: {
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
    await this.logActivity('finding:created', finding.id, userId, {
      findingTitle: finding.title,
      severity: finding.severity,
      auditTitle: audit.title,
    });

    return finding;
  }

  // Create corrective action
  async createCorrectiveAction(
    findingId: string,
    data: CreateCorrectiveActionData,
    userId: string
  ): Promise<CorrectiveAction> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const finding = await prisma.auditFinding.findUnique({
      where: { id: findingId },
      include: { audit: true },
    });

    if (!finding) {
      throw createNotFoundError('Audit Finding');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== finding.tenantId) {
        throw createForbiddenError('You can only create corrective actions for findings in your tenant');
      }
    }

    // Validate assigned user
    const assignedUser = await prisma.user.findUnique({
      where: { id: data.assignedToId },
    });

    if (!assignedUser || !assignedUser.isActive) {
      throw new CustomError('Assigned user is invalid or inactive', 400);
    }

    // Create corrective action
    const correctiveAction = await prisma.correctiveAction.create({
      data: {
        ...data,
        findingId,
        createdById: userId,
        tenantId: user.tenantId,
        factoryId: finding.factoryId,
        status: 'PENDING',
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
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        finding: {
          select: {
            id: true,
            title: true,
            severity: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('corrective_action:created', correctiveAction.id, userId, {
      actionTitle: correctiveAction.title,
      priority: correctiveAction.priority,
      findingTitle: finding.title,
    });

    return correctiveAction;
  }

  // Get audit statistics
  async getAuditStats(factoryId?: string, userId?: string): Promise<any> {
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
      totalAudits,
      completedAudits,
      inProgressAudits,
      plannedAudits,
      averageScore,
      auditsByType,
      auditsByStatus,
      recentAudits,
    ] = await Promise.all([
      prisma.audit.count({ where }),
      prisma.audit.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.audit.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.audit.count({ where: { ...where, status: 'PLANNED' } }),
      prisma.audit.aggregate({
        where: { ...where, status: 'COMPLETED' },
        _avg: { score: true },
      }),
      prisma.audit.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      prisma.audit.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      prisma.audit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
      }),
    ]);

    return {
      stats: {
        total: totalAudits,
        completed: completedAudits,
        inProgress: inProgressAudits,
        planned: plannedAudits,
        averageScore: averageScore._avg.score || 0,
      },
      byType: auditsByType.map(item => ({
        type: item.type,
        count: item._count.type,
      })),
      byStatus: auditsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      recent: recentAudits,
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
          type: 'AUDIT',
          title: `Audit ${action}`,
          description: `Audit ${action} by user`,
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

export const auditService = new AuditService();
