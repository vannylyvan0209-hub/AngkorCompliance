import { prisma } from '../index';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';
import * as XLSX from 'xlsx';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'pdf' | 'json';
  includeMetadata?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  filters?: Record<string, any>;
  columns?: string[];
  template?: string;
}

export interface ExportRequest {
  entityType: 'audits' | 'grievances' | 'trainings' | 'permits' | 'users' | 'factories' | 'documents' | 'notifications' | 'compliance-standards' | 'corrective-actions' | 'activities';
  options: ExportOptions;
  userId: string;
}

export interface ExportResult {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  format: string;
  recordCount: number;
  exportedAt: Date;
  exportedBy: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  entityType: string;
  columns: string[];
  filters: Record<string, any>;
  format: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
}

class ExportService {
  private exportDir = path.join(process.cwd(), 'exports');

  constructor() {
    // Ensure exports directory exists
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  // Create export request
  async createExportRequest(request: ExportRequest): Promise<ExportResult> {
    const user = await prisma.user.findUnique({
      where: { id: request.userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Generate unique export ID
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileName = `${request.entityType}_${exportId}.${request.options.format}`;
    const filePath = path.join(this.exportDir, fileName);

    // Create export record
    const exportRecord = await prisma.export.create({
      data: {
        id: exportId,
        entityType: request.entityType,
        format: request.options.format,
        fileName,
        filePath,
        status: 'pending',
        exportedBy: request.userId,
        options: request.options,
      },
    });

    // Process export asynchronously
    this.processExport(exportId, request).catch(error => {
      console.error(`Export ${exportId} failed:`, error);
      this.updateExportStatus(exportId, 'failed', error.message);
    });

    return {
      id: exportId,
      fileName,
      filePath,
      fileSize: 0,
      format: request.options.format,
      recordCount: 0,
      exportedAt: new Date(),
      exportedBy: `${user.firstName} ${user.lastName}`,
      status: 'pending',
    };
  }

  // Process export
  private async processExport(exportId: string, request: ExportRequest): Promise<void> {
    try {
      // Update status to processing
      await this.updateExportStatus(exportId, 'processing');

      // Get data based on entity type
      const data = await this.getEntityData(request.entityType, request.userId, request.options);

      // Generate file based on format
      const filePath = await this.generateFile(exportId, data, request.options);

      // Update export record with results
      const stats = fs.statSync(filePath);
      await prisma.export.update({
        where: { id: exportId },
        data: {
          status: 'completed',
          fileSize: stats.size,
          recordCount: Array.isArray(data) ? data.length : 1,
          completedAt: new Date(),
        },
      });

    } catch (error) {
      await this.updateExportStatus(exportId, 'failed', error.message);
      throw error;
    }
  }

  // Get entity data
  private async getEntityData(entityType: string, userId: string, options: ExportOptions): Promise<any[]> {
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

    // Apply date range filter
    if (options.dateRange) {
      where.createdAt = {
        gte: options.dateRange.from,
        lte: options.dateRange.to,
      };
    }

    // Apply additional filters
    if (options.filters) {
      Object.assign(where, options.filters);
    }

    switch (entityType) {
      case 'audits':
        return this.getAuditsData(where);
      case 'grievances':
        return this.getGrievancesData(where);
      case 'trainings':
        return this.getTrainingsData(where);
      case 'permits':
        return this.getPermitsData(where);
      case 'users':
        return this.getUsersData(where);
      case 'factories':
        return this.getFactoriesData(where);
      case 'documents':
        return this.getDocumentsData(where);
      case 'notifications':
        return this.getNotificationsData(where);
      case 'compliance-standards':
        return this.getComplianceStandardsData(where);
      case 'corrective-actions':
        return this.getCorrectiveActionsData(where);
      case 'activities':
        return this.getActivitiesData(where);
      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }
  }

  // Get audits data
  private async getAuditsData(where: any): Promise<any[]> {
    const audits = await prisma.audit.findMany({
      where,
      include: {
        factory: {
          select: { name: true, address: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
        findings: {
          include: {
            correctiveActions: true,
          },
        },
      },
    });

    return audits.map(audit => ({
      id: audit.id,
      title: audit.title,
      type: audit.type,
      status: audit.status,
      score: audit.score,
      factory: audit.factory?.name,
      factoryAddress: audit.factory?.address,
      auditor: `${audit.createdBy?.firstName} ${audit.createdBy?.lastName}`,
      auditorEmail: audit.createdBy?.email,
      scheduledDate: audit.scheduledDate,
      startDate: audit.startDate,
      endDate: audit.endDate,
      findingsCount: audit.findings?.length || 0,
      correctiveActionsCount: audit.findings?.reduce((sum, finding) => sum + finding.correctiveActions.length, 0) || 0,
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt,
    }));
  }

  // Get grievances data
  private async getGrievancesData(where: any): Promise<any[]> {
    const grievances = await prisma.grievance.findMany({
      where,
      include: {
        factory: {
          select: { name: true, address: true },
        },
        assignedTo: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return grievances.map(grievance => ({
      id: grievance.id,
      title: grievance.title,
      description: grievance.description,
      category: grievance.category,
      severity: grievance.severity,
      status: grievance.status,
      isAnonymous: grievance.isAnonymous,
      factory: grievance.factory?.name,
      factoryAddress: grievance.factory?.address,
      assignedTo: grievance.assignedTo ? `${grievance.assignedTo.firstName} ${grievance.assignedTo.lastName}` : null,
      assignedToEmail: grievance.assignedTo?.email,
      submittedAt: grievance.submittedAt,
      assignedAt: grievance.assignedAt,
      resolvedAt: grievance.resolvedAt,
      createdAt: grievance.createdAt,
      updatedAt: grievance.updatedAt,
    }));
  }

  // Get trainings data
  private async getTrainingsData(where: any): Promise<any[]> {
    const trainings = await prisma.training.findMany({
      where,
      include: {
        factory: {
          select: { name: true, address: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return trainings.map(training => ({
      id: training.id,
      title: training.title,
      description: training.description,
      type: training.type,
      status: training.status,
      duration: training.duration,
      maxParticipants: training.maxParticipants,
      factory: training.factory?.name,
      factoryAddress: training.factory?.address,
      instructor: `${training.createdBy?.firstName} ${training.createdBy?.lastName}`,
      instructorEmail: training.createdBy?.email,
      scheduledDate: training.scheduledDate,
      startDate: training.startDate,
      endDate: training.endDate,
      completionRate: training.completionRate,
      averageScore: training.averageScore,
      createdAt: training.createdAt,
      updatedAt: training.updatedAt,
    }));
  }

  // Get permits data
  private async getPermitsData(where: any): Promise<any[]> {
    const permits = await prisma.permit.findMany({
      where,
      include: {
        factory: {
          select: { name: true, address: true },
        },
      },
    });

    return permits.map(permit => ({
      id: permit.id,
      name: permit.name,
      type: permit.type,
      status: permit.status,
      permitNumber: permit.permitNumber,
      issuingAuthority: permit.issuingAuthority,
      factory: permit.factory?.name,
      factoryAddress: permit.factory?.address,
      issueDate: permit.issueDate,
      expiryDate: permit.expiryDate,
      renewalDate: permit.renewalDate,
      isExpired: permit.expiryDate < new Date(),
      daysUntilExpiry: permit.expiryDate ? Math.ceil((permit.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null,
      createdAt: permit.createdAt,
      updatedAt: permit.updatedAt,
    }));
  }

  // Get users data
  private async getUsersData(where: any): Promise<any[]> {
    const users = await prisma.user.findMany({
      where,
      include: {
        factory: {
          select: { name: true, address: true },
        },
        tenant: {
          select: { name: true },
        },
        roles: {
          include: {
            role: {
              select: { name: true },
            },
          },
        },
      },
    });

    return users.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      factory: user.factory?.name,
      factoryAddress: user.factory?.address,
      tenant: user.tenant?.name,
      department: user.department,
      position: user.position,
      employeeId: user.employeeId,
      hireDate: user.hireDate,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  // Get factories data
  private async getFactoriesData(where: any): Promise<any[]> {
    const factories = await prisma.factory.findMany({
      where,
      include: {
        tenant: {
          select: { name: true },
        },
        users: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });

    return factories.map(factory => ({
      id: factory.id,
      name: factory.name,
      address: factory.address,
      city: factory.city,
      country: factory.country,
      status: factory.status,
      tenant: factory.tenant?.name,
      userCount: factory.users?.length || 0,
      createdAt: factory.createdAt,
      updatedAt: factory.updatedAt,
    }));
  }

  // Get documents data
  private async getDocumentsData(where: any): Promise<any[]> {
    const documents = await prisma.document.findMany({
      where,
      include: {
        factory: {
          select: { name: true, address: true },
        },
        uploadedBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return documents.map(document => ({
      id: document.id,
      title: document.title,
      description: document.description,
      type: document.type,
      category: document.category,
      status: document.status,
      factory: document.factory?.name,
      factoryAddress: document.factory?.address,
      uploadedBy: `${document.uploadedBy?.firstName} ${document.uploadedBy?.lastName}`,
      uploadedByEmail: document.uploadedBy?.email,
      fileSize: document.fileSize,
      fileType: document.fileType,
      version: document.version,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    }));
  }

  // Get notifications data
  private async getNotificationsData(where: any): Promise<any[]> {
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      status: notification.status,
      channel: notification.channel,
      user: notification.user ? `${notification.user.firstName} ${notification.user.lastName}` : null,
      userEmail: notification.user?.email,
      scheduledAt: notification.scheduledAt,
      sentAt: notification.sentAt,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    }));
  }

  // Get compliance standards data
  private async getComplianceStandardsData(where: any): Promise<any[]> {
    const standards = await prisma.complianceStandard.findMany({
      where,
      include: {
        requirements: {
          include: {
            controls: true,
          },
        },
      },
    });

    return standards.map(standard => ({
      id: standard.id,
      name: standard.name,
      description: standard.description,
      version: standard.version,
      status: standard.status,
      isActive: standard.isActive,
      requirementsCount: standard.requirements?.length || 0,
      controlsCount: standard.requirements?.reduce((sum, req) => sum + req.controls.length, 0) || 0,
      createdAt: standard.createdAt,
      updatedAt: standard.updatedAt,
    }));
  }

  // Get corrective actions data
  private async getCorrectiveActionsData(where: any): Promise<any[]> {
    const actions = await prisma.correctiveAction.findMany({
      where,
      include: {
        assignedTo: {
          select: { firstName: true, lastName: true, email: true },
        },
        verifiedBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return actions.map(action => ({
      id: action.id,
      title: action.title,
      description: action.description,
      status: action.status,
      priority: action.priority,
      assignedTo: action.assignedTo ? `${action.assignedTo.firstName} ${action.assignedTo.lastName}` : null,
      assignedToEmail: action.assignedTo?.email,
      verifiedBy: action.verifiedBy ? `${action.verifiedBy.firstName} ${action.verifiedBy.lastName}` : null,
      verifiedByEmail: action.verifiedBy?.email,
      dueDate: action.dueDate,
      completedAt: action.completedAt,
      verifiedAt: action.verifiedAt,
      estimatedCost: action.estimatedCost,
      actualCost: action.actualCost,
      estimatedDuration: action.estimatedDuration,
      actualDuration: action.actualDuration,
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
    }));
  }

  // Get activities data
  private async getActivitiesData(where: any): Promise<any[]> {
    const activities = await prisma.activity.findMany({
      where,
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    return activities.map(activity => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      resource: activity.resource,
      resourceType: activity.resourceType,
      user: activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : null,
      userEmail: activity.user?.email,
      createdBy: `${activity.createdBy?.firstName} ${activity.createdBy?.lastName}`,
      createdByEmail: activity.createdBy?.email,
      createdAt: activity.createdAt,
    }));
  }

  // Generate file based on format
  private async generateFile(exportId: string, data: any[], options: ExportOptions): Promise<string> {
    const fileName = `${exportId}.${options.format}`;
    const filePath = path.join(this.exportDir, fileName);

    switch (options.format) {
      case 'xlsx':
        return this.generateExcelFile(filePath, data, options);
      case 'csv':
        return this.generateCsvFile(filePath, data, options);
      case 'pdf':
        return this.generatePdfFile(filePath, data, options);
      case 'json':
        return this.generateJsonFile(filePath, data, options);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  // Generate Excel file
  private async generateExcelFile(filePath: string, data: any[], options: ExportOptions): Promise<string> {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, filePath);
    
    return filePath;
  }

  // Generate CSV file
  private async generateCsvFile(filePath: string, data: any[], options: ExportOptions): Promise<string> {
    if (data.length === 0) {
      fs.writeFileSync(filePath, '');
      return filePath;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    fs.writeFileSync(filePath, csvContent);
    return filePath;
  }

  // Generate PDF file
  private async generatePdfFile(filePath: string, data: any[], options: ExportOptions): Promise<string> {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    // Add title
    doc.fontSize(20).text('Export Report', 50, 50);
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, 50, 80);
    doc.fontSize(12).text(`Total Records: ${data.length}`, 50, 100);
    doc.moveDown(2);

    // Add data table
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const colWidth = 100;
      const rowHeight = 20;
      let y = 150;

      // Add headers
      headers.forEach((header, index) => {
        doc.rect(50 + index * colWidth, y, colWidth, rowHeight).stroke();
        doc.text(header, 55 + index * colWidth, y + 5);
      });

      y += rowHeight;

      // Add data rows
      data.slice(0, 50).forEach((row, rowIndex) => { // Limit to 50 rows for PDF
        headers.forEach((header, colIndex) => {
          doc.rect(50 + colIndex * colWidth, y, colWidth, rowHeight).stroke();
          doc.text(String(row[header] || ''), 55 + colIndex * colWidth, y + 5);
        });
        y += rowHeight;
      });
    }

    doc.end();
    return filePath;
  }

  // Generate JSON file
  private async generateJsonFile(filePath: string, data: any[], options: ExportOptions): Promise<string> {
    const jsonData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        recordCount: data.length,
        format: options.format,
      },
      data,
    };

    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    return filePath;
  }

  // Update export status
  private async updateExportStatus(exportId: string, status: string, error?: string): Promise<void> {
    await prisma.export.update({
      where: { id: exportId },
      data: {
        status,
        error,
        ...(status === 'completed' && { completedAt: new Date() }),
      },
    });
  }

  // Get export status
  async getExportStatus(exportId: string, userId: string): Promise<ExportResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const exportRecord = await prisma.export.findFirst({
      where: {
        id: exportId,
        ...(user.role !== 'SUPER_ADMIN' ? { exportedBy: userId } : {}),
      },
    });

    if (!exportRecord) {
      throw createNotFoundError('Export');
    }

    return {
      id: exportRecord.id,
      fileName: exportRecord.fileName,
      filePath: exportRecord.filePath,
      fileSize: exportRecord.fileSize || 0,
      format: exportRecord.format,
      recordCount: exportRecord.recordCount || 0,
      exportedAt: exportRecord.createdAt,
      exportedBy: user.firstName + ' ' + user.lastName,
      status: exportRecord.status as any,
      error: exportRecord.error || undefined,
    };
  }

  // List exports
  async listExports(userId: string, limit: number = 20, offset: number = 0): Promise<ExportResult[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const exports = await prisma.export.findMany({
      where: user.role !== 'SUPER_ADMIN' ? { exportedBy: userId } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return exports.map(exportRecord => ({
      id: exportRecord.id,
      fileName: exportRecord.fileName,
      filePath: exportRecord.filePath,
      fileSize: exportRecord.fileSize || 0,
      format: exportRecord.format,
      recordCount: exportRecord.recordCount || 0,
      exportedAt: exportRecord.createdAt,
      exportedBy: user.firstName + ' ' + user.lastName,
      status: exportRecord.status as any,
      error: exportRecord.error || undefined,
    }));
  }

  // Download export file
  async downloadExport(exportId: string, userId: string): Promise<{ filePath: string; fileName: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const exportRecord = await prisma.export.findFirst({
      where: {
        id: exportId,
        ...(user.role !== 'SUPER_ADMIN' ? { exportedBy: userId } : {}),
      },
    });

    if (!exportRecord) {
      throw createNotFoundError('Export');
    }

    if (exportRecord.status !== 'completed') {
      throw new Error('Export is not ready for download');
    }

    if (!fs.existsSync(exportRecord.filePath)) {
      throw new Error('Export file not found');
    }

    return {
      filePath: exportRecord.filePath,
      fileName: exportRecord.fileName,
    };
  }

  // Delete export
  async deleteExport(exportId: string, userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const exportRecord = await prisma.export.findFirst({
      where: {
        id: exportId,
        ...(user.role !== 'SUPER_ADMIN' ? { exportedBy: userId } : {}),
      },
    });

    if (!exportRecord) {
      throw createNotFoundError('Export');
    }

    // Delete file if it exists
    if (fs.existsSync(exportRecord.filePath)) {
      fs.unlinkSync(exportRecord.filePath);
    }

    // Delete database record
    await prisma.export.delete({
      where: { id: exportId },
    });
  }

  // Get export templates
  async getExportTemplates(entityType?: string): Promise<ExportTemplate[]> {
    const where = entityType ? { entityType } : {};
    
    const templates = await prisma.exportTemplate.findMany({
      where,
      orderBy: { isDefault: 'desc' },
    });

    return templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      entityType: template.entityType,
      columns: template.columns,
      filters: template.filters,
      format: template.format,
      isDefault: template.isDefault,
      createdBy: template.createdBy,
      createdAt: template.createdAt,
    }));
  }

  // Create export template
  async createExportTemplate(template: Omit<ExportTemplate, 'id' | 'createdAt'>, userId: string): Promise<ExportTemplate> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const newTemplate = await prisma.exportTemplate.create({
      data: {
        ...template,
        createdBy: userId,
      },
    });

    return {
      id: newTemplate.id,
      name: newTemplate.name,
      description: newTemplate.description,
      entityType: newTemplate.entityType,
      columns: newTemplate.columns,
      filters: newTemplate.filters,
      format: newTemplate.format,
      isDefault: newTemplate.isDefault,
      createdBy: newTemplate.createdBy,
      createdAt: newTemplate.createdAt,
    };
  }
}

export const exportService = new ExportService();
