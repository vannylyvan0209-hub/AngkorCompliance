import { prisma } from '../index';
import { ComplianceStandard, StandardType, StandardStatus, ComplianceRequirement, RequirementType, ComplianceControl, ControlType } from '@prisma/client';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';

export interface CreateComplianceStandardData {
  name: string;
  code: string;
  type: StandardType;
  version: string;
  description: string;
  scope: string;
  applicableIndustries: string[];
  applicableCountries: string[];
  effectiveDate: Date;
  expiryDate?: Date;
  isActive: boolean;
  requirements: CreateComplianceRequirementData[];
  metadata?: Record<string, any>;
}

export interface CreateComplianceRequirementData {
  code: string;
  title: string;
  description: string;
  type: RequirementType;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  subcategory?: string;
  isMandatory: boolean;
  weight: number; // 0-100 for scoring
  controls: CreateComplianceControlData[];
  metadata?: Record<string, any>;
}

export interface CreateComplianceControlData {
  code: string;
  title: string;
  description: string;
  type: ControlType;
  implementationGuidance: string;
  evidenceRequired: string[];
  testingMethod: string;
  frequency: 'CONTINUOUS' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  responsibleRole: string;
  weight: number; // 0-100 for scoring
  metadata?: Record<string, any>;
}

export interface UpdateComplianceStandardData {
  name?: string;
  code?: string;
  type?: StandardType;
  version?: string;
  description?: string;
  scope?: string;
  applicableIndustries?: string[];
  applicableCountries?: string[];
  effectiveDate?: Date;
  expiryDate?: Date;
  isActive?: boolean;
  status?: StandardStatus;
  metadata?: Record<string, any>;
}

export interface ComplianceStandardFilters {
  search?: string;
  type?: StandardType;
  status?: StandardStatus;
  isActive?: boolean;
  applicableIndustry?: string;
  applicableCountry?: string;
  effectiveDateFrom?: Date;
  effectiveDateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedComplianceStandardResponse {
  data: ComplianceStandard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ComplianceStandardStats {
  total: number;
  active: number;
  inactive: number;
  byType: Array<{ type: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  byIndustry: Array<{ industry: string; count: number }>;
  byCountry: Array<{ country: string; count: number }>;
  recentStandards: Array<{ id: string; name: string; version: string; effectiveDate: Date }>;
}

export interface ComplianceAssessment {
  standardId: string;
  factoryId: string;
  assessmentDate: Date;
  overallScore: number;
  requirementScores: Array<{
    requirementId: string;
    score: number;
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT';
  }>;
  findings: Array<{
    requirementId: string;
    controlId: string;
    finding: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  recommendations: string[];
}

class ComplianceStandardsService {
  // Create a new compliance standard
  async createComplianceStandard(data: CreateComplianceStandardData, userId: string): Promise<ComplianceStandard> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Only super admin can create compliance standards
    if (user.role !== 'SUPER_ADMIN') {
      throw createForbiddenError('You do not have permission to create compliance standards');
    }

    // Check if standard code already exists
    const existingStandard = await prisma.complianceStandard.findFirst({
      where: {
        code: data.code,
        version: data.version,
      },
    });

    if (existingStandard) {
      throw new CustomError('Compliance standard with this code and version already exists', 409);
    }

    // Create compliance standard with requirements and controls
    const standard = await prisma.complianceStandard.create({
      data: {
        ...data,
        createdById: userId,
        tenantId: user.tenantId,
        status: 'DRAFT',
        requirements: {
          create: data.requirements.map(req => ({
            ...req,
            createdById: userId,
            tenantId: user.tenantId,
            controls: {
              create: req.controls.map(ctrl => ({
                ...ctrl,
                createdById: userId,
                tenantId: user.tenantId,
              })),
            },
          })),
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
        requirements: {
          include: {
            controls: true,
          },
        },
        _count: {
          select: {
            requirements: true,
            assessments: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('compliance_standard:created', standard.id, userId, {
      standardName: standard.name,
      standardCode: standard.code,
      standardType: standard.type,
    });

    return standard;
  }

  // Get all compliance standards with filtering and pagination
  async getComplianceStandards(
    filters: ComplianceStandardFilters,
    userId: string
  ): Promise<PaginatedComplianceStandardResponse> {
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
      isActive,
      applicableIndustry,
      applicableCountry,
      effectiveDateFrom,
      effectiveDateTo,
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
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { scope: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (applicableIndustry) {
      where.applicableIndustries = { has: applicableIndustry };
    }

    if (applicableCountry) {
      where.applicableCountries = { has: applicableCountry };
    }

    if (effectiveDateFrom || effectiveDateTo) {
      where.effectiveDate = {};
      if (effectiveDateFrom) where.effectiveDate.gte = effectiveDateFrom;
      if (effectiveDateTo) where.effectiveDate.lte = effectiveDateTo;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await prisma.complianceStandard.count({ where });

    // Get compliance standards
    const standards = await prisma.complianceStandard.findMany({
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
        requirements: {
          include: {
            controls: true,
          },
        },
        _count: {
          select: {
            requirements: true,
            assessments: true,
          },
        },
      },
    });

    return {
      data: standards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get compliance standard by ID
  async getComplianceStandardById(standardId: string, userId: string): Promise<ComplianceStandard> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const standard = await prisma.complianceStandard.findFirst({
      where: {
        id: standardId,
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
        requirements: {
          include: {
            controls: true,
          },
          orderBy: { code: 'asc' },
        },
        assessments: {
          include: {
            factory: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
          orderBy: { assessmentDate: 'desc' },
        },
        _count: {
          select: {
            requirements: true,
            assessments: true,
          },
        },
      },
    });

    if (!standard) {
      throw createNotFoundError('Compliance Standard');
    }

    return standard;
  }

  // Update compliance standard
  async updateComplianceStandard(
    standardId: string,
    data: UpdateComplianceStandardData,
    userId: string
  ): Promise<ComplianceStandard> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check if user has permission to update this standard
    const existingStandard = await prisma.complianceStandard.findUnique({
      where: { id: standardId },
    });

    if (!existingStandard) {
      throw createNotFoundError('Compliance Standard');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== existingStandard.tenantId) {
        throw createForbiddenError('You can only update compliance standards in your tenant');
      }
    }

    // Check if standard code already exists (if being updated)
    if (data.code && data.code !== existingStandard.code) {
      const existingStandardWithCode = await prisma.complianceStandard.findFirst({
        where: {
          code: data.code,
          version: data.version || existingStandard.version,
          id: { not: standardId },
        },
      });

      if (existingStandardWithCode) {
        throw new CustomError('Compliance standard with this code and version already exists', 409);
      }
    }

    // Update compliance standard
    const standard = await prisma.complianceStandard.update({
      where: { id: standardId },
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
        requirements: {
          include: {
            controls: true,
          },
        },
        _count: {
          select: {
            requirements: true,
            assessments: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('compliance_standard:updated', standard.id, userId, {
      standardName: standard.name,
      standardCode: standard.code,
      changes: data,
    });

    return standard;
  }

  // Activate compliance standard
  async activateComplianceStandard(standardId: string, userId: string): Promise<ComplianceStandard> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const standard = await prisma.complianceStandard.findUnique({
      where: { id: standardId },
    });

    if (!standard) {
      throw createNotFoundError('Compliance Standard');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== standard.tenantId) {
        throw createForbiddenError('You can only activate compliance standards in your tenant');
      }
    }

    if (standard.status !== 'DRAFT') {
      throw new CustomError('Only draft standards can be activated', 400);
    }

    // Update standard
    const updatedStandard = await prisma.complianceStandard.update({
      where: { id: standardId },
      data: {
        status: 'ACTIVE',
        isActive: true,
        activatedAt: new Date(),
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
        requirements: {
          include: {
            controls: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('compliance_standard:activated', standard.id, userId, {
      standardName: standard.name,
      standardCode: standard.code,
    });

    return updatedStandard;
  }

  // Deactivate compliance standard
  async deactivateComplianceStandard(standardId: string, userId: string): Promise<ComplianceStandard> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const standard = await prisma.complianceStandard.findUnique({
      where: { id: standardId },
    });

    if (!standard) {
      throw createNotFoundError('Compliance Standard');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== standard.tenantId) {
        throw createForbiddenError('You can only deactivate compliance standards in your tenant');
      }
    }

    if (standard.status !== 'ACTIVE') {
      throw new CustomError('Only active standards can be deactivated', 400);
    }

    // Update standard
    const updatedStandard = await prisma.complianceStandard.update({
      where: { id: standardId },
      data: {
        status: 'INACTIVE',
        isActive: false,
        deactivatedAt: new Date(),
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
        requirements: {
          include: {
            controls: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('compliance_standard:deactivated', standard.id, userId, {
      standardName: standard.name,
      standardCode: standard.code,
    });

    return updatedStandard;
  }

  // Get compliance standard statistics
  async getComplianceStandardStats(userId?: string): Promise<ComplianceStandardStats> {
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
      active,
      inactive,
      byType,
      byStatus,
      byIndustry,
      byCountry,
      recentStandards,
    ] = await Promise.all([
      prisma.complianceStandard.count({ where }),
      prisma.complianceStandard.count({ where: { ...where, isActive: true } }),
      prisma.complianceStandard.count({ where: { ...where, isActive: false } }),
      prisma.complianceStandard.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      prisma.complianceStandard.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      prisma.complianceStandard.findMany({
        where,
        select: { applicableIndustries: true },
      }),
      prisma.complianceStandard.findMany({
        where,
        select: { applicableCountries: true },
      }),
      prisma.complianceStandard.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          version: true,
          effectiveDate: true,
        },
      }),
    ]);

    // Process industry and country statistics
    const industryStats = new Map<string, number>();
    const countryStats = new Map<string, number>();

    byIndustry.forEach(standard => {
      standard.applicableIndustries.forEach(industry => {
        industryStats.set(industry, (industryStats.get(industry) || 0) + 1);
      });
    });

    byCountry.forEach(standard => {
      standard.applicableCountries.forEach(country => {
        countryStats.set(country, (countryStats.get(country) || 0) + 1);
      });
    });

    return {
      total,
      active,
      inactive,
      byType: byType.map(item => ({
        type: item.type,
        count: item._count.type,
      })),
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      byIndustry: Array.from(industryStats.entries()).map(([industry, count]) => ({
        industry,
        count,
      })),
      byCountry: Array.from(countryStats.entries()).map(([country, count]) => ({
        country,
        count,
      })),
      recentStandards,
    };
  }

  // Get applicable standards for a factory
  async getApplicableStandards(factoryId: string, userId: string): Promise<ComplianceStandard[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Get factory details
    const factory = await prisma.factory.findUnique({
      where: { id: factoryId },
    });

    if (!factory) {
      throw createNotFoundError('Factory');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== factory.tenantId) {
        throw createForbiddenError('You can only view standards for factories in your tenant');
      }
    }

    // Get applicable standards based on factory industry and country
    const standards = await prisma.complianceStandard.findMany({
      where: {
        tenantId: user.tenantId,
        isActive: true,
        status: 'ACTIVE',
        OR: [
          { applicableIndustries: { has: factory.industry } },
          { applicableIndustries: { has: 'ALL' } },
        ],
        AND: [
          {
            OR: [
              { applicableCountries: { has: factory.country } },
              { applicableCountries: { has: 'ALL' } },
            ],
          },
        ],
      },
      include: {
        requirements: {
          include: {
            controls: true,
          },
        },
        _count: {
          select: {
            requirements: true,
            assessments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return standards;
  }

  // Create compliance assessment
  async createComplianceAssessment(
    assessmentData: ComplianceAssessment,
    userId: string
  ): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Only super admin, factory admin, or auditor can create assessments
    if (!['SUPER_ADMIN', 'FACTORY_ADMIN', 'AUDITOR'].includes(user.role)) {
      throw createForbiddenError('You do not have permission to create compliance assessments');
    }

    // Validate standard and factory
    const [standard, factory] = await Promise.all([
      prisma.complianceStandard.findUnique({
        where: { id: assessmentData.standardId },
      }),
      prisma.factory.findUnique({
        where: { id: assessmentData.factoryId },
      }),
    ]);

    if (!standard) {
      throw createNotFoundError('Compliance Standard');
    }

    if (!factory) {
      throw createNotFoundError('Factory');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== standard.tenantId || user.tenantId !== factory.tenantId) {
        throw createForbiddenError('You can only create assessments for standards and factories in your tenant');
      }
    }

    // Create assessment
    const assessment = await prisma.complianceAssessment.create({
      data: {
        standardId: assessmentData.standardId,
        factoryId: assessmentData.factoryId,
        assessmentDate: assessmentData.assessmentDate,
        overallScore: assessmentData.overallScore,
        assessedById: userId,
        tenantId: user.tenantId,
        requirementScores: {
          create: assessmentData.requirementScores.map(score => ({
            requirementId: score.requirementId,
            score: score.score,
            status: score.status,
            assessedById: userId,
            tenantId: user.tenantId,
            factoryId: assessmentData.factoryId,
          })),
        },
        findings: {
          create: assessmentData.findings.map(finding => ({
            requirementId: finding.requirementId,
            controlId: finding.controlId,
            finding: finding.finding,
            severity: finding.severity,
            assessedById: userId,
            tenantId: user.tenantId,
            factoryId: assessmentData.factoryId,
          })),
        },
        recommendations: assessmentData.recommendations,
      },
      include: {
        standard: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        assessedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        requirementScores: true,
        findings: true,
      },
    });

    // Log activity
    await this.logActivity('compliance_assessment:created', assessment.id, userId, {
      standardName: standard.name,
      factoryName: factory.name,
      overallScore: assessmentData.overallScore,
    });

    return assessment;
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
          type: 'COMPLIANCE_STANDARD',
          title: `Compliance Standard ${action}`,
          description: `Compliance Standard ${action} by user`,
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

export const complianceStandardsService = new ComplianceStandardsService();
