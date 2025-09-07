import { prisma } from '../index';
import { CorrectiveAction, ActionStatus, ActionPriority, ActionType } from '@prisma/client';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';

export interface CreateCorrectiveActionData {
  title: string;
  description: string;
  type: ActionType;
  priority: ActionPriority;
  status: ActionStatus;
  dueDate: Date;
  assignedToId: string;
  factoryId: string;
  auditId?: string;
  grievanceId?: string;
  trainingId?: string;
  permitId?: string;
  complianceStandardId?: string;
  requirementId?: string;
  controlId?: string;
  rootCause: string;
  correctiveMeasures: string[];
  preventiveMeasures: string[];
  estimatedCost?: number;
  actualCost?: number;
  estimatedDuration?: number; // in days
  actualDuration?: number; // in days
  evidenceRequired: string[];
  verificationMethod: string;
  effectivenessReviewDate?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateCorrectiveActionData {
  title?: string;
  description?: string;
  type?: ActionType;
  priority?: ActionPriority;
  status?: ActionStatus;
  dueDate?: Date;
  assignedToId?: string;
  rootCause?: string;
  correctiveMeasures?: string[];
  preventiveMeasures?: string[];
  estimatedCost?: number;
  actualCost?: number;
  estimatedDuration?: number;
  actualDuration?: number;
  evidenceRequired?: string[];
  verificationMethod?: string;
  effectivenessReviewDate?: Date;
  completedAt?: Date;
  verifiedAt?: Date;
  metadata?: Record<string, any>;
}

export interface CorrectiveActionFilters {
  search?: string;
  status?: ActionStatus;
  priority?: ActionPriority;
  type?: ActionType;
  assignedToId?: string;
  factoryId?: string;
  auditId?: string;
  grievanceId?: string;
  trainingId?: string;
  permitId?: string;
  complianceStandardId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  overdue?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedCorrectiveActionResponse {
  data: CorrectiveAction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CorrectiveActionStats {
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
  overdue: number;
  dueThisWeek: number;
  dueThisMonth: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  averageCompletionTime: number; // in days
  costSummary: {
    totalEstimated: number;
    totalActual: number;
    averageCost: number;
  };
  effectiveness: {
    totalReviewed: number;
    effective: number;
    ineffective: number;
    effectivenessRate: number; // percentage
  };
}

export interface CorrectiveActionEffectivenessReview {
  actionId: string;
  reviewDate: Date;
  isEffective: boolean;
  effectivenessScore: number; // 0-100
  reviewComments: string;
  reviewerId: string;
  followUpActions?: string[];
  nextReviewDate?: Date;
}

class CorrectiveActionService {
  // Create a new corrective action
  async createCorrectiveAction(data: CreateCorrectiveActionData, userId: string): Promise<CorrectiveAction> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Validate assigned user
    const assignedUser = await prisma.user.findUnique({
      where: { id: data.assignedToId },
    });

    if (!assignedUser) {
      throw createNotFoundError('Assigned User');
    }

    // Validate factory
    const factory = await prisma.factory.findUnique({
      where: { id: data.factoryId },
    });

    if (!factory) {
      throw createNotFoundError('Factory');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== factory.tenantId || user.tenantId !== assignedUser.tenantId) {
        throw createForbiddenError('You can only create corrective actions for users and factories in your tenant');
      }
    }

    // Validate related entities if provided
    if (data.auditId) {
      const audit = await prisma.audit.findUnique({
        where: { id: data.auditId },
      });
      if (!audit) {
        throw createNotFoundError('Audit');
      }
    }

    if (data.grievanceId) {
      const grievance = await prisma.grievance.findUnique({
        where: { id: data.grievanceId },
      });
      if (!grievance) {
        throw createNotFoundError('Grievance');
      }
    }

    if (data.trainingId) {
      const training = await prisma.training.findUnique({
        where: { id: data.trainingId },
      });
      if (!training) {
        throw createNotFoundError('Training');
      }
    }

    if (data.permitId) {
      const permit = await prisma.permit.findUnique({
        where: { id: data.permitId },
      });
      if (!permit) {
        throw createNotFoundError('Permit');
      }
    }

    // Create corrective action
    const correctiveAction = await prisma.correctiveAction.create({
      data: {
        ...data,
        createdById: userId,
        tenantId: user.tenantId,
        status: data.status || 'PENDING',
        priority: data.priority || 'MEDIUM',
        type: data.type || 'CORRECTIVE',
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
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        audit: {
          select: {
            id: true,
            title: true,
            auditDate: true,
          },
        },
        grievance: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        training: {
          select: {
            id: true,
            title: true,
            scheduledDate: true,
          },
        },
        permit: {
          select: {
            id: true,
            name: true,
            expiryDate: true,
          },
        },
        complianceStandard: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            evidence: true,
            reviews: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('corrective_action:created', correctiveAction.id, userId, {
      actionTitle: correctiveAction.title,
      actionType: correctiveAction.type,
      priority: correctiveAction.priority,
      assignedTo: assignedUser.email,
    });

    return correctiveAction;
  }

  // Get all corrective actions with filtering and pagination
  async getCorrectiveActions(
    filters: CorrectiveActionFilters,
    userId: string
  ): Promise<PaginatedCorrectiveActionResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const {
      search,
      status,
      priority,
      type,
      assignedToId,
      factoryId,
      auditId,
      grievanceId,
      trainingId,
      permitId,
      complianceStandardId,
      dueDateFrom,
      dueDateTo,
      overdue,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { rootCause: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (type) {
      where.type = type;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (factoryId) {
      where.factoryId = factoryId;
    }

    if (auditId) {
      where.auditId = auditId;
    }

    if (grievanceId) {
      where.grievanceId = grievanceId;
    }

    if (trainingId) {
      where.trainingId = trainingId;
    }

    if (permitId) {
      where.permitId = permitId;
    }

    if (complianceStandardId) {
      where.complianceStandardId = complianceStandardId;
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = dueDateFrom;
      if (dueDateTo) where.dueDate.lte = dueDateTo;
    }

    if (overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'COMPLETED' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await prisma.correctiveAction.count({ where });

    // Get corrective actions
    const correctiveActions = await prisma.correctiveAction.findMany({
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
        audit: {
          select: {
            id: true,
            title: true,
            auditDate: true,
          },
        },
        grievance: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        training: {
          select: {
            id: true,
            title: true,
            scheduledDate: true,
          },
        },
        permit: {
          select: {
            id: true,
            name: true,
            expiryDate: true,
          },
        },
        complianceStandard: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            evidence: true,
            reviews: true,
          },
        },
      },
    });

    return {
      data: correctiveActions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get corrective action by ID
  async getCorrectiveActionById(actionId: string, userId: string): Promise<CorrectiveAction> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const correctiveAction = await prisma.correctiveAction.findFirst({
      where: {
        id: actionId,
        tenantId: user.tenantId,
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
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        audit: {
          select: {
            id: true,
            title: true,
            auditDate: true,
          },
        },
        grievance: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        training: {
          select: {
            id: true,
            title: true,
            scheduledDate: true,
          },
        },
        permit: {
          select: {
            id: true,
            name: true,
            expiryDate: true,
          },
        },
        complianceStandard: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        evidence: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { uploadedAt: 'desc' },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { reviewDate: 'desc' },
        },
        _count: {
          select: {
            evidence: true,
            reviews: true,
          },
        },
      },
    });

    if (!correctiveAction) {
      throw createNotFoundError('Corrective Action');
    }

    return correctiveAction;
  }

  // Update corrective action
  async updateCorrectiveAction(
    actionId: string,
    data: UpdateCorrectiveActionData,
    userId: string
  ): Promise<CorrectiveAction> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check if corrective action exists
    const existingAction = await prisma.correctiveAction.findUnique({
      where: { id: actionId },
    });

    if (!existingAction) {
      throw createNotFoundError('Corrective Action');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== existingAction.tenantId) {
        throw createForbiddenError('You can only update corrective actions in your tenant');
      }
    }

    // Validate assigned user if being updated
    if (data.assignedToId && data.assignedToId !== existingAction.assignedToId) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: data.assignedToId },
      });

      if (!assignedUser) {
        throw createNotFoundError('Assigned User');
      }
    }

    // Update corrective action
    const correctiveAction = await prisma.correctiveAction.update({
      where: { id: actionId },
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
        audit: {
          select: {
            id: true,
            title: true,
            auditDate: true,
          },
        },
        grievance: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
        training: {
          select: {
            id: true,
            title: true,
            scheduledDate: true,
          },
        },
        permit: {
          select: {
            id: true,
            name: true,
            expiryDate: true,
          },
        },
        complianceStandard: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            evidence: true,
            reviews: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('corrective_action:updated', correctiveAction.id, userId, {
      actionTitle: correctiveAction.title,
      changes: data,
    });

    return correctiveAction;
  }

  // Start corrective action
  async startCorrectiveAction(actionId: string, userId: string): Promise<CorrectiveAction> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const correctiveAction = await prisma.correctiveAction.findUnique({
      where: { id: actionId },
    });

    if (!correctiveAction) {
      throw createNotFoundError('Corrective Action');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== correctiveAction.tenantId) {
        throw createForbiddenError('You can only start corrective actions in your tenant');
      }
    }

    if (correctiveAction.status !== 'PENDING') {
      throw new CustomError('Only pending corrective actions can be started', 400);
    }

    // Update corrective action
    const updatedAction = await prisma.correctiveAction.update({
      where: { id: actionId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
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
    await this.logActivity('corrective_action:started', correctiveAction.id, userId, {
      actionTitle: correctiveAction.title,
    });

    return updatedAction;
  }

  // Complete corrective action
  async completeCorrectiveAction(actionId: string, userId: string): Promise<CorrectiveAction> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const correctiveAction = await prisma.correctiveAction.findUnique({
      where: { id: actionId },
    });

    if (!correctiveAction) {
      throw createNotFoundError('Corrective Action');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== correctiveAction.tenantId) {
        throw createForbiddenError('You can only complete corrective actions in your tenant');
      }
    }

    if (correctiveAction.status !== 'IN_PROGRESS') {
      throw new CustomError('Only in-progress corrective actions can be completed', 400);
    }

    // Update corrective action
    const updatedAction = await prisma.correctiveAction.update({
      where: { id: actionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
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
    await this.logActivity('corrective_action:completed', correctiveAction.id, userId, {
      actionTitle: correctiveAction.title,
    });

    return updatedAction;
  }

  // Verify corrective action
  async verifyCorrectiveAction(actionId: string, userId: string): Promise<CorrectiveAction> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const correctiveAction = await prisma.correctiveAction.findUnique({
      where: { id: actionId },
    });

    if (!correctiveAction) {
      throw createNotFoundError('Corrective Action');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== correctiveAction.tenantId) {
        throw createForbiddenError('You can only verify corrective actions in your tenant');
      }
    }

    if (correctiveAction.status !== 'COMPLETED') {
      throw new CustomError('Only completed corrective actions can be verified', 400);
    }

    // Update corrective action
    const updatedAction = await prisma.correctiveAction.update({
      where: { id: actionId },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
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
    await this.logActivity('corrective_action:verified', correctiveAction.id, userId, {
      actionTitle: correctiveAction.title,
    });

    return updatedAction;
  }

  // Get corrective action statistics
  async getCorrectiveActionStats(userId?: string): Promise<CorrectiveActionStats> {
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
    }

    // Get statistics
    const [
      total,
      byStatus,
      byPriority,
      byType,
      overdue,
      dueThisWeek,
      dueThisMonth,
      completed,
      inProgress,
      notStarted,
      costSummary,
      effectiveness,
    ] = await Promise.all([
      prisma.correctiveAction.count({ where }),
      prisma.correctiveAction.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      prisma.correctiveAction.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true },
      }),
      prisma.correctiveAction.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      prisma.correctiveAction.count({
        where: {
          ...where,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' },
        },
      }),
      prisma.correctiveAction.count({
        where: {
          ...where,
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
          status: { not: 'COMPLETED' },
        },
      }),
      prisma.correctiveAction.count({
        where: {
          ...where,
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          status: { not: 'COMPLETED' },
        },
      }),
      prisma.correctiveAction.count({
        where: { ...where, status: 'COMPLETED' },
      }),
      prisma.correctiveAction.count({
        where: { ...where, status: 'IN_PROGRESS' },
      }),
      prisma.correctiveAction.count({
        where: { ...where, status: 'PENDING' },
      }),
      prisma.correctiveAction.aggregate({
        where,
        _sum: {
          estimatedCost: true,
          actualCost: true,
        },
        _avg: {
          estimatedCost: true,
          actualCost: true,
        },
      }),
      prisma.correctiveActionReview.aggregate({
        where: {
          correctiveAction: where,
        },
        _count: {
          id: true,
        },
        _avg: {
          effectivenessScore: true,
        },
      }),
    ]);

    // Calculate effectiveness
    const totalReviewed = effectiveness._count.id;
    const effectiveCount = await prisma.correctiveActionReview.count({
      where: {
        correctiveAction: where,
        isEffective: true,
      },
    });

    return {
      total,
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      byPriority: byPriority.map(item => ({
        priority: item.priority,
        count: item._count.priority,
      })),
      byType: byType.map(item => ({
        type: item.type,
        count: item._count.type,
      })),
      overdue,
      dueThisWeek,
      dueThisMonth,
      completed,
      inProgress,
      notStarted,
      averageCompletionTime: 0, // TODO: Calculate based on completed actions
      costSummary: {
        totalEstimated: costSummary._sum.estimatedCost || 0,
        totalActual: costSummary._sum.actualCost || 0,
        averageCost: costSummary._avg.actualCost || 0,
      },
      effectiveness: {
        totalReviewed,
        effective: effectiveCount,
        ineffective: totalReviewed - effectiveCount,
        effectivenessRate: totalReviewed > 0 ? (effectiveCount / totalReviewed) * 100 : 0,
      },
    };
  }

  // Create effectiveness review
  async createEffectivenessReview(
    reviewData: CorrectiveActionEffectivenessReview,
    userId: string
  ): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Only super admin, factory admin, or auditor can create reviews
    if (!['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR'].includes(user.role)) {
      throw createForbiddenError('You do not have permission to create effectiveness reviews');
    }

    // Validate corrective action
    const correctiveAction = await prisma.correctiveAction.findUnique({
      where: { id: reviewData.actionId },
    });

    if (!correctiveAction) {
      throw createNotFoundError('Corrective Action');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== correctiveAction.tenantId) {
        throw createForbiddenError('You can only create reviews for corrective actions in your tenant');
      }
    }

    // Create effectiveness review
    const review = await prisma.correctiveActionReview.create({
      data: {
        correctiveActionId: reviewData.actionId,
        reviewDate: reviewData.reviewDate,
        isEffective: reviewData.isEffective,
        effectivenessScore: reviewData.effectivenessScore,
        reviewComments: reviewData.reviewComments,
        reviewerId: reviewData.reviewerId,
        followUpActions: reviewData.followUpActions,
        nextReviewDate: reviewData.nextReviewDate,
        tenantId: user.tenantId,
      },
      include: {
        correctiveAction: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        reviewer: {
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
    await this.logActivity('corrective_action:reviewed', correctiveAction.id, userId, {
      actionTitle: correctiveAction.title,
      effectivenessScore: reviewData.effectivenessScore,
      isEffective: reviewData.isEffective,
    });

    return review;
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
          type: 'CORRECTIVE_ACTION',
          title: `Corrective Action ${action}`,
          description: `Corrective Action ${action} by user`,
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

export const correctiveActionService = new CorrectiveActionService();
