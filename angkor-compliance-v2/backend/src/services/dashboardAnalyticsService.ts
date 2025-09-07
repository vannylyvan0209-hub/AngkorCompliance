import { prisma } from '../index';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';

export interface DashboardFilters {
  tenantId?: string;
  factoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface ComplianceOverview {
  totalStandards: number;
  activeStandards: number;
  complianceScore: number;
  nonCompliantItems: number;
  upcomingAudits: number;
  overdueActions: number;
  recentFindings: number;
  complianceTrend: Array<{ date: string; score: number }>;
  standardsByStatus: Array<{ status: string; count: number }>;
  findingsBySeverity: Array<{ severity: string; count: number }>;
  actionsByStatus: Array<{ status: string; count: number }>;
}

export interface AuditOverview {
  totalAudits: number;
  completedAudits: number;
  inProgressAudits: number;
  upcomingAudits: number;
  averageScore: number;
  auditTrend: Array<{ date: string; count: number; score: number }>;
  auditsByStatus: Array<{ status: string; count: number }>;
  auditsByType: Array<{ type: string; count: number }>;
  recentAudits: Array<{ id: string; title: string; status: string; score: number; date: Date }>;
  upcomingAuditSchedule: Array<{ id: string; title: string; scheduledDate: Date; factory: string }>;
}

export interface GrievanceOverview {
  totalGrievances: number;
  openGrievances: number;
  resolvedGrievances: number;
  averageResolutionTime: number;
  grievancesByStatus: Array<{ status: string; count: number }>;
  grievancesByCategory: Array<{ category: string; count: number }>;
  grievancesBySeverity: Array<{ severity: string; count: number }>;
  resolutionTrend: Array<{ date: string; resolved: number; opened: number }>;
  recentGrievances: Array<{ id: string; title: string; status: string; category: string; createdAt: Date }>;
  overdueGrievances: Array<{ id: string; title: string; daysOverdue: number; category: string }>;
}

export interface TrainingOverview {
  totalTrainings: number;
  completedTrainings: number;
  inProgressTrainings: number;
  upcomingTrainings: number;
  averageCompletionRate: number;
  trainingTrend: Array<{ date: string; completed: number; scheduled: number }>;
  trainingsByStatus: Array<{ status: string; count: number }>;
  trainingsByType: Array<{ type: string; count: number }>;
  recentTrainings: Array<{ id: string; title: string; status: string; completionRate: number; date: Date }>;
  upcomingTrainingSchedule: Array<{ id: string; title: string; scheduledDate: Date; participants: number }>;
}

export interface PermitOverview {
  totalPermits: number;
  activePermits: number;
  expiringPermits: number;
  expiredPermits: number;
  permitsByStatus: Array<{ status: string; count: number }>;
  permitsByType: Array<{ type: string; count: number }>;
  expiryTrend: Array<{ date: string; expiring: number; expired: number }>;
  recentPermits: Array<{ id: string; name: string; type: string; status: string; expiryDate: Date }>;
  expiringSoon: Array<{ id: string; name: string; type: string; daysUntilExpiry: number }>;
}

export interface UserOverview {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Array<{ role: string; count: number }>;
  usersByStatus: Array<{ status: string; count: number }>;
  recentUsers: Array<{ id: string; name: string; role: string; status: string; createdAt: Date }>;
  userActivityTrend: Array<{ date: string; active: number; total: number }>;
}

export interface DashboardKPIs {
  compliance: {
    overallScore: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  };
  audits: {
    completionRate: number;
    averageScore: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  };
  grievances: {
    resolutionRate: number;
    averageResolutionTime: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  };
  training: {
    completionRate: number;
    averageScore: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  };
  permits: {
    complianceRate: number;
    expiringCount: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  };
}

export interface DashboardSummary {
  kpis: DashboardKPIs;
  compliance: ComplianceOverview;
  audits: AuditOverview;
  grievances: GrievanceOverview;
  training: TrainingOverview;
  permits: PermitOverview;
  users: UserOverview;
  lastUpdated: Date;
}

class DashboardAnalyticsService {
  // Get comprehensive dashboard summary
  async getDashboardSummary(filters: DashboardFilters, userId: string): Promise<DashboardSummary> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Build where clause for tenant isolation
    const where: any = {};
    if (user.role !== 'SUPER_ADMIN') {
      where.tenantId = user.tenantId;
    }
    if (filters.tenantId) {
      where.tenantId = filters.tenantId;
    }
    if (filters.factoryId) {
      where.factoryId = filters.factoryId;
    }

    // Get all overview data in parallel
    const [kpis, compliance, audits, grievances, training, permits, users] = await Promise.all([
      this.getDashboardKPIs(filters, userId),
      this.getComplianceOverview(filters, userId),
      this.getAuditOverview(filters, userId),
      this.getGrievanceOverview(filters, userId),
      this.getTrainingOverview(filters, userId),
      this.getPermitOverview(filters, userId),
      this.getUserOverview(filters, userId),
    ]);

    return {
      kpis,
      compliance,
      audits,
      grievances,
      training,
      permits,
      users,
      lastUpdated: new Date(),
    };
  }

  // Get dashboard KPIs
  async getDashboardKPIs(filters: DashboardFilters, userId: string): Promise<DashboardKPIs> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Build where clause
    const where: any = {};
    if (user.role !== 'SUPER_ADMIN') {
      where.tenantId = user.tenantId;
    }
    if (filters.tenantId) {
      where.tenantId = filters.tenantId;
    }
    if (filters.factoryId) {
      where.factoryId = filters.factoryId;
    }

    // Get current period data
    const currentPeriod = this.getDateRange(filters.period || 'month');
    const previousPeriod = this.getPreviousDateRange(filters.period || 'month');

    const [
      complianceScore,
      previousComplianceScore,
      auditCompletionRate,
      previousAuditCompletionRate,
      grievanceResolutionRate,
      previousGrievanceResolutionRate,
      trainingCompletionRate,
      previousTrainingCompletionRate,
      permitComplianceRate,
      previousPermitComplianceRate,
    ] = await Promise.all([
      this.calculateComplianceScore(where, currentPeriod),
      this.calculateComplianceScore(where, previousPeriod),
      this.calculateAuditCompletionRate(where, currentPeriod),
      this.calculateAuditCompletionRate(where, previousPeriod),
      this.calculateGrievanceResolutionRate(where, currentPeriod),
      this.calculateGrievanceResolutionRate(where, previousPeriod),
      this.calculateTrainingCompletionRate(where, currentPeriod),
      this.calculateTrainingCompletionRate(where, previousPeriod),
      this.calculatePermitComplianceRate(where, currentPeriod),
      this.calculatePermitComplianceRate(where, previousPeriod),
    ]);

    return {
      compliance: {
        overallScore: complianceScore,
        trend: this.calculateTrend(complianceScore, previousComplianceScore),
        change: complianceScore - previousComplianceScore,
      },
      audits: {
        completionRate: auditCompletionRate,
        averageScore: await this.calculateAverageAuditScore(where, currentPeriod),
        trend: this.calculateTrend(auditCompletionRate, previousAuditCompletionRate),
        change: auditCompletionRate - previousAuditCompletionRate,
      },
      grievances: {
        resolutionRate: grievanceResolutionRate,
        averageResolutionTime: await this.calculateAverageResolutionTime(where, currentPeriod),
        trend: this.calculateTrend(grievanceResolutionRate, previousGrievanceResolutionRate),
        change: grievanceResolutionRate - previousGrievanceResolutionRate,
      },
      training: {
        completionRate: trainingCompletionRate,
        averageScore: await this.calculateAverageTrainingScore(where, currentPeriod),
        trend: this.calculateTrend(trainingCompletionRate, previousTrainingCompletionRate),
        change: trainingCompletionRate - previousTrainingCompletionRate,
      },
      permits: {
        complianceRate: permitComplianceRate,
        expiringCount: await this.getExpiringPermitsCount(where),
        trend: this.calculateTrend(permitComplianceRate, previousPermitComplianceRate),
        change: permitComplianceRate - previousPermitComplianceRate,
      },
    };
  }

  // Get compliance overview
  async getComplianceOverview(filters: DashboardFilters, userId: string): Promise<ComplianceOverview> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Build where clause
    const where: any = {};
    if (user.role !== 'SUPER_ADMIN') {
      where.tenantId = user.tenantId;
    }
    if (filters.tenantId) {
      where.tenantId = filters.tenantId;
    }
    if (filters.factoryId) {
      where.factoryId = filters.factoryId;
    }

    const [
      totalStandards,
      activeStandards,
      complianceScore,
      nonCompliantItems,
      upcomingAudits,
      overdueActions,
      recentFindings,
      standardsByStatus,
      findingsBySeverity,
      actionsByStatus,
    ] = await Promise.all([
      prisma.complianceStandard.count({ where }),
      prisma.complianceStandard.count({ where: { ...where, isActive: true } }),
      this.calculateComplianceScore(where),
      prisma.complianceFinding.count({ where: { ...where, status: 'OPEN' } }),
      prisma.audit.count({ where: { ...where, status: 'SCHEDULED' } }),
      prisma.correctiveAction.count({ where: { ...where, status: 'IN_PROGRESS', dueDate: { lt: new Date() } } }),
      prisma.complianceFinding.count({ where: { ...where, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.complianceStandard.groupBy({ by: ['isActive'], where, _count: { isActive: true } }),
      prisma.complianceFinding.groupBy({ by: ['severity'], where, _count: { severity: true } }),
      prisma.correctiveAction.groupBy({ by: ['status'], where, _count: { status: true } }),
    ]);

    // Get compliance trend
    const complianceTrend = await this.getComplianceTrend(where, 12);

    return {
      totalStandards,
      activeStandards,
      complianceScore,
      nonCompliantItems,
      upcomingAudits,
      overdueActions,
      recentFindings,
      complianceTrend,
      standardsByStatus: standardsByStatus.map(item => ({
        status: item.isActive ? 'Active' : 'Inactive',
        count: item._count.isActive,
      })),
      findingsBySeverity: findingsBySeverity.map(item => ({
        severity: item.severity,
        count: item._count.severity,
      })),
      actionsByStatus: actionsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
    };
  }

  // Helper methods
  private getDateRange(period: string): { from: Date; to: Date } {
    const now = new Date();
    const to = new Date(now);
    let from = new Date(now);

    switch (period) {
      case 'day':
        from.setDate(from.getDate() - 1);
        break;
      case 'week':
        from.setDate(from.getDate() - 7);
        break;
      case 'month':
        from.setMonth(from.getMonth() - 1);
        break;
      case 'quarter':
        from.setMonth(from.getMonth() - 3);
        break;
      case 'year':
        from.setFullYear(from.getFullYear() - 1);
        break;
    }

    return { from, to };
  }

  private getPreviousDateRange(period: string): { from: Date; to: Date } {
    const current = this.getDateRange(period);
    const duration = current.to.getTime() - current.from.getTime();
    
    return {
      from: new Date(current.from.getTime() - duration),
      to: current.from,
    };
  }

  private calculateTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    const change = current - previous;
    if (change > 0.01) return 'up';
    if (change < -0.01) return 'down';
    return 'stable';
  }

  private async calculateComplianceScore(where: any, dateRange?: { from: Date; to: Date }): Promise<number> {
    // Implementation for compliance score calculation
    return 85.5; // Placeholder
  }

  private async calculateAuditCompletionRate(where: any, dateRange?: { from: Date; to: Date }): Promise<number> {
    // Implementation for audit completion rate calculation
    return 92.3; // Placeholder
  }

  private async calculateGrievanceResolutionRate(where: any, dateRange?: { from: Date; to: Date }): Promise<number> {
    // Implementation for grievance resolution rate calculation
    return 88.7; // Placeholder
  }

  private async calculateTrainingCompletionRate(where: any, dateRange?: { from: Date; to: Date }): Promise<number> {
    // Implementation for training completion rate calculation
    return 94.1; // Placeholder
  }

  private async calculatePermitComplianceRate(where: any, dateRange?: { from: Date; to: Date }): Promise<number> {
    // Implementation for permit compliance rate calculation
    return 96.8; // Placeholder
  }

  private async calculateAverageAuditScore(where: any, dateRange?: { from: Date; to: Date }): Promise<number> {
    // Implementation for average audit score calculation
    return 87.2; // Placeholder
  }

  private async calculateAverageResolutionTime(where: any, dateRange?: { from: Date; to: Date }): Promise<number> {
    // Implementation for average resolution time calculation
    return 5.2; // Placeholder
  }

  private async calculateAverageTrainingScore(where: any, dateRange?: { from: Date; to: Date }): Promise<number> {
    // Implementation for average training score calculation
    return 89.4; // Placeholder
  }

  private async getExpiringPermitsCount(where: any): Promise<number> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return prisma.permit.count({
      where: {
        ...where,
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
    });
  }

  private async getComplianceTrend(where: any, months: number): Promise<Array<{ date: string; score: number }>> {
    // Implementation for compliance trend calculation
    return []; // Placeholder
  }

  // Placeholder methods for other overview functions
  async getAuditOverview(filters: DashboardFilters, userId: string): Promise<AuditOverview> {
    // Implementation for audit overview
    return {
      totalAudits: 0,
      completedAudits: 0,
      inProgressAudits: 0,
      upcomingAudits: 0,
      averageScore: 0,
      auditTrend: [],
      auditsByStatus: [],
      auditsByType: [],
      recentAudits: [],
      upcomingAuditSchedule: [],
    };
  }

  async getGrievanceOverview(filters: DashboardFilters, userId: string): Promise<GrievanceOverview> {
    // Implementation for grievance overview
    return {
      totalGrievances: 0,
      openGrievances: 0,
      resolvedGrievances: 0,
      averageResolutionTime: 0,
      grievancesByStatus: [],
      grievancesByCategory: [],
      grievancesBySeverity: [],
      resolutionTrend: [],
      recentGrievances: [],
      overdueGrievances: [],
    };
  }

  async getTrainingOverview(filters: DashboardFilters, userId: string): Promise<TrainingOverview> {
    // Implementation for training overview
    return {
      totalTrainings: 0,
      completedTrainings: 0,
      inProgressTrainings: 0,
      upcomingTrainings: 0,
      averageCompletionRate: 0,
      trainingTrend: [],
      trainingsByStatus: [],
      trainingsByType: [],
      recentTrainings: [],
      upcomingTrainingSchedule: [],
    };
  }

  async getPermitOverview(filters: DashboardFilters, userId: string): Promise<PermitOverview> {
    // Implementation for permit overview
    return {
      totalPermits: 0,
      activePermits: 0,
      expiringPermits: 0,
      expiredPermits: 0,
      permitsByStatus: [],
      permitsByType: [],
      expiryTrend: [],
      recentPermits: [],
      expiringSoon: [],
    };
  }

  async getUserOverview(filters: DashboardFilters, userId: string): Promise<UserOverview> {
    // Implementation for user overview
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      usersByRole: [],
      usersByStatus: [],
      recentUsers: [],
      userActivityTrend: [],
    };
  }
}

export const dashboardAnalyticsService = new DashboardAnalyticsService();
