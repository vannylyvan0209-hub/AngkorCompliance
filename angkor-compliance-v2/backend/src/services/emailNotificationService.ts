import { prisma } from '../index';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  type: 'to' | 'cc' | 'bcc';
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
}

export interface EmailOptions {
  to: EmailRecipient[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: string;
  templateVariables?: Record<string, any>;
  attachments?: EmailAttachment[];
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: Date;
  replyTo?: string;
  from?: string;
  headers?: Record<string, string>;
}

export interface EmailQueueItem {
  id: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high';
  scheduledAt: Date;
  sentAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  templateId?: string;
  templateVariables?: Record<string, any>;
  attachments?: EmailAttachment[];
  replyTo?: string;
  from?: string;
  headers?: Record<string, string>;
  tenantId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailStats {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  totalProcessing: number;
  totalCancelled: number;
  successRate: number;
  averageDeliveryTime: number;
  emailsByStatus: Record<string, number>;
  emailsByPriority: Record<string, number>;
  emailsByTemplate: Record<string, number>;
  emailsByDay: Record<string, number>;
  emailsByHour: Record<string, number>;
  topRecipients: Array<{ email: string; count: number }>;
  topTemplates: Array<{ templateId: string; name: string; count: number }>;
  errorTypes: Record<string, number>;
  deliveryTrends: Array<{ date: string; sent: number; failed: number }>;
}

class EmailNotificationService {
  private transporter: nodemailer.Transporter;
  private templatesDir = path.join(process.cwd(), 'email-templates');
  private compiledTemplates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor() {
    // Initialize email transporter
    this.initializeTransporter();
    
    // Ensure templates directory exists
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
    
    // Load and compile templates
    this.loadTemplates();
  }

  // Initialize email transporter
  private initializeTransporter(): void {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    this.transporter = nodemailer.createTransporter(emailConfig);
  }

  // Load and compile email templates
  private async loadTemplates(): Promise<void> {
    try {
      const templates = await prisma.emailTemplate.findMany({
        where: { isActive: true },
      });

      for (const template of templates) {
        this.compileTemplate(template);
      }
    } catch (error) {
      console.error('Error loading email templates:', error);
    }
  }

  // Compile email template
  private compileTemplate(template: any): void {
    try {
      const htmlTemplate = handlebars.compile(template.htmlContent);
      const textTemplate = handlebars.compile(template.textContent);
      
      this.compiledTemplates.set(template.id, {
        html: htmlTemplate,
        text: textTemplate,
      });
    } catch (error) {
      console.error(`Error compiling template ${template.id}:`, error);
    }
  }

  // Send email
  async sendEmail(options: EmailOptions, userId: string, tenantId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Generate unique email ID
    const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Process template if templateId is provided
    let htmlContent = options.htmlContent;
    let textContent = options.textContent;

    if (options.templateId) {
      const template = await this.getTemplate(options.templateId);
      if (template) {
        const compiledTemplate = this.compiledTemplates.get(options.templateId);
        if (compiledTemplate) {
          htmlContent = compiledTemplate.html(options.templateVariables || {});
          textContent = compiledTemplate.text(options.templateVariables || {});
        }
      }
    }

    // Create email queue item
    const emailQueueItem = await prisma.emailQueue.create({
      data: {
        id: emailId,
        recipientEmail: options.to[0].email,
        recipientName: options.to[0].name,
        subject: options.subject,
        htmlContent: htmlContent || '',
        textContent: textContent || '',
        status: 'pending',
        priority: options.priority || 'normal',
        scheduledAt: options.scheduledAt || new Date(),
        templateId: options.templateId,
        templateVariables: options.templateVariables,
        attachments: options.attachments,
        replyTo: options.replyTo,
        from: options.from,
        headers: options.headers,
        tenantId,
        createdBy: userId,
      },
    });

    // Process email asynchronously
    this.processEmailQueue(emailId).catch(error => {
      console.error(`Email ${emailId} failed:`, error);
      this.updateEmailStatus(emailId, 'failed', error.message);
    });

    return emailId;
  }

  // Process email queue
  private async processEmailQueue(emailId: string): Promise<void> {
    try {
      // Update status to processing
      await this.updateEmailStatus(emailId, 'processing');

      const emailItem = await prisma.emailQueue.findUnique({
        where: { id: emailId },
      });

      if (!emailItem) {
        throw new Error('Email queue item not found');
      }

      // Prepare email options
      const mailOptions: nodemailer.SendMailOptions = {
        from: emailItem.from || process.env.SMTP_FROM || process.env.SMTP_USER,
        to: emailItem.recipientEmail,
        subject: emailItem.subject,
        html: emailItem.htmlContent,
        text: emailItem.textContent,
        replyTo: emailItem.replyTo,
        headers: emailItem.headers,
      };

      // Add attachments if any
      if (emailItem.attachments && emailItem.attachments.length > 0) {
        mailOptions.attachments = emailItem.attachments.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
          encoding: attachment.encoding,
        }));
      }

      // Send email
      const result = await this.transporter.sendMail(mailOptions);

      // Update status to sent
      await prisma.emailQueue.update({
        where: { id: emailId },
        data: {
          status: 'sent',
          sentAt: new Date(),
          messageId: result.messageId,
        },
      });

      // Log email activity
      await this.logEmailActivity(emailId, 'sent', 'Email sent successfully');

    } catch (error) {
      await this.updateEmailStatus(emailId, 'failed', error.message);
      throw error;
    }
  }

  // Update email status
  private async updateEmailStatus(emailId: string, status: string, errorMessage?: string): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'sent') {
      updateData.sentAt = new Date();
    } else if (status === 'failed') {
      updateData.failedAt = new Date();
      updateData.errorMessage = errorMessage;
      updateData.retryCount = { increment: 1 };
    }

    await prisma.emailQueue.update({
      where: { id: emailId },
      data: updateData,
    });
  }

  // Log email activity
  private async logEmailActivity(emailId: string, action: string, details: string): Promise<void> {
    const emailItem = await prisma.emailQueue.findUnique({
      where: { id: emailId },
    });

    if (emailItem) {
      await prisma.activity.create({
        data: {
          type: 'EMAIL_ACTIVITY',
          title: `Email ${action}`,
          description: details,
          resource: emailId,
          resourceType: 'EMAIL',
          tenantId: emailItem.tenantId,
          createdBy: emailItem.createdBy,
        },
      });
    }
  }

  // Get email template
  async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return null;
    }

    return {
      id: template.id,
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      variables: template.variables,
      category: template.category,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  // Create email template
  async createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<EmailTemplate> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const newTemplate = await prisma.emailTemplate.create({
      data: {
        ...template,
        createdBy: userId,
      },
    });

    // Compile the new template
    this.compileTemplate(newTemplate);

    return {
      id: newTemplate.id,
      name: newTemplate.name,
      subject: newTemplate.subject,
      htmlContent: newTemplate.htmlContent,
      textContent: newTemplate.textContent,
      variables: newTemplate.variables,
      category: newTemplate.category,
      isActive: newTemplate.isActive,
      createdAt: newTemplate.createdAt,
      updatedAt: newTemplate.updatedAt,
    };
  }

  // Update email template
  async updateTemplate(templateId: string, updates: Partial<EmailTemplate>, userId: string): Promise<EmailTemplate> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id: templateId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    // Recompile the template
    this.compileTemplate(updatedTemplate);

    return {
      id: updatedTemplate.id,
      name: updatedTemplate.name,
      subject: updatedTemplate.subject,
      htmlContent: updatedTemplate.htmlContent,
      textContent: updatedTemplate.textContent,
      variables: updatedTemplate.variables,
      category: updatedTemplate.category,
      isActive: updatedTemplate.isActive,
      createdAt: updatedTemplate.createdAt,
      updatedAt: updatedTemplate.updatedAt,
    };
  }

  // Delete email template
  async deleteTemplate(templateId: string, userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    await prisma.emailTemplate.delete({
      where: { id: templateId },
    });

    // Remove from compiled templates
    this.compiledTemplates.delete(templateId);
  }

  // List email templates
  async listTemplates(category?: string): Promise<EmailTemplate[]> {
    const where = category ? { category } : {};
    
    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return templates.map(template => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      variables: template.variables,
      category: template.category,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));
  }

  // Get email queue status
  async getEmailQueueStatus(emailId: string, userId: string): Promise<EmailQueueItem | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const emailItem = await prisma.emailQueue.findFirst({
      where: {
        id: emailId,
        ...(user.role !== 'SUPER_ADMIN' ? { tenantId: user.tenantId } : {}),
      },
    });

    if (!emailItem) {
      return null;
    }

    return {
      id: emailItem.id,
      recipientEmail: emailItem.recipientEmail,
      recipientName: emailItem.recipientName,
      subject: emailItem.subject,
      htmlContent: emailItem.htmlContent,
      textContent: emailItem.textContent,
      status: emailItem.status as any,
      priority: emailItem.priority as any,
      scheduledAt: emailItem.scheduledAt,
      sentAt: emailItem.sentAt,
      failedAt: emailItem.failedAt,
      errorMessage: emailItem.errorMessage,
      retryCount: emailItem.retryCount,
      maxRetries: emailItem.maxRetries,
      templateId: emailItem.templateId,
      templateVariables: emailItem.templateVariables,
      attachments: emailItem.attachments,
      replyTo: emailItem.replyTo,
      from: emailItem.from,
      headers: emailItem.headers,
      tenantId: emailItem.tenantId,
      createdBy: emailItem.createdBy,
      createdAt: emailItem.createdAt,
      updatedAt: emailItem.updatedAt,
    };
  }

  // List email queue
  async listEmailQueue(userId: string, limit: number = 20, offset: number = 0, status?: string): Promise<EmailQueueItem[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const where: any = {};
    if (user.role !== 'SUPER_ADMIN') {
      where.tenantId = user.tenantId;
    }
    if (status) {
      where.status = status;
    }

    const emailItems = await prisma.emailQueue.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return emailItems.map(item => ({
      id: item.id,
      recipientEmail: item.recipientEmail,
      recipientName: item.recipientName,
      subject: item.subject,
      htmlContent: item.htmlContent,
      textContent: item.textContent,
      status: item.status as any,
      priority: item.priority as any,
      scheduledAt: item.scheduledAt,
      sentAt: item.sentAt,
      failedAt: item.failedAt,
      errorMessage: item.errorMessage,
      retryCount: item.retryCount,
      maxRetries: item.maxRetries,
      templateId: item.templateId,
      templateVariables: item.templateVariables,
      attachments: item.attachments,
      replyTo: item.replyTo,
      from: item.from,
      headers: item.headers,
      tenantId: item.tenantId,
      createdBy: item.createdBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  // Cancel email
  async cancelEmail(emailId: string, userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const emailItem = await prisma.emailQueue.findFirst({
      where: {
        id: emailId,
        ...(user.role !== 'SUPER_ADMIN' ? { tenantId: user.tenantId } : {}),
      },
    });

    if (!emailItem) {
      throw createNotFoundError('Email');
    }

    if (emailItem.status === 'sent') {
      throw new Error('Cannot cancel already sent email');
    }

    await prisma.emailQueue.update({
      where: { id: emailId },
      data: {
        status: 'cancelled',
        updatedAt: new Date(),
      },
    });

    await this.logEmailActivity(emailId, 'cancelled', 'Email cancelled by user');
  }

  // Retry failed email
  async retryEmail(emailId: string, userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const emailItem = await prisma.emailQueue.findFirst({
      where: {
        id: emailId,
        ...(user.role !== 'SUPER_ADMIN' ? { tenantId: user.tenantId } : {}),
      },
    });

    if (!emailItem) {
      throw createNotFoundError('Email');
    }

    if (emailItem.status !== 'failed') {
      throw new Error('Can only retry failed emails');
    }

    if (emailItem.retryCount >= emailItem.maxRetries) {
      throw new Error('Maximum retry attempts reached');
    }

    // Reset status to pending for retry
    await prisma.emailQueue.update({
      where: { id: emailId },
      data: {
        status: 'pending',
        updatedAt: new Date(),
      },
    });

    // Process email asynchronously
    this.processEmailQueue(emailId).catch(error => {
      console.error(`Email retry ${emailId} failed:`, error);
      this.updateEmailStatus(emailId, 'failed', error.message);
    });

    await this.logEmailActivity(emailId, 'retry', 'Email retry initiated');
  }

  // Get email statistics
  async getEmailStats(userId: string, dateRange?: { from: Date; to: Date }): Promise<EmailStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const where: any = {};
    if (user.role !== 'SUPER_ADMIN') {
      where.tenantId = user.tenantId;
    }
    if (dateRange) {
      where.createdAt = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    }

    // Get basic counts
    const totalSent = await prisma.emailQueue.count({
      where: { ...where, status: 'sent' },
    });

    const totalFailed = await prisma.emailQueue.count({
      where: { ...where, status: 'failed' },
    });

    const totalPending = await prisma.emailQueue.count({
      where: { ...where, status: 'pending' },
    });

    const totalProcessing = await prisma.emailQueue.count({
      where: { ...where, status: 'processing' },
    });

    const totalCancelled = await prisma.emailQueue.count({
      where: { ...where, status: 'cancelled' },
    });

    const total = totalSent + totalFailed + totalPending + totalProcessing + totalCancelled;
    const successRate = total > 0 ? (totalSent / total) * 100 : 0;

    // Get emails by status
    const emailsByStatus = {
      sent: totalSent,
      failed: totalFailed,
      pending: totalPending,
      processing: totalProcessing,
      cancelled: totalCancelled,
    };

    // Get emails by priority
    const priorityStats = await prisma.emailQueue.groupBy({
      by: ['priority'],
      where,
      _count: { priority: true },
    });

    const emailsByPriority = priorityStats.reduce((acc, stat) => {
      acc[stat.priority] = stat._count.priority;
      return acc;
    }, {} as Record<string, number>);

    // Get emails by template
    const templateStats = await prisma.emailQueue.groupBy({
      by: ['templateId'],
      where: { ...where, templateId: { not: null } },
      _count: { templateId: true },
    });

    const emailsByTemplate = templateStats.reduce((acc, stat) => {
      acc[stat.templateId || 'no-template'] = stat._count.templateId;
      return acc;
    }, {} as Record<string, number>);

    // Get average delivery time
    const sentEmails = await prisma.emailQueue.findMany({
      where: { ...where, status: 'sent', sentAt: { not: null } },
      select: { createdAt: true, sentAt: true },
    });

    const averageDeliveryTime = sentEmails.length > 0
      ? sentEmails.reduce((sum, email) => {
          const deliveryTime = email.sentAt!.getTime() - email.createdAt.getTime();
          return sum + deliveryTime;
        }, 0) / sentEmails.length
      : 0;

    // Get top recipients
    const recipientStats = await prisma.emailQueue.groupBy({
      by: ['recipientEmail'],
      where,
      _count: { recipientEmail: true },
      orderBy: { _count: { recipientEmail: 'desc' } },
      take: 10,
    });

    const topRecipients = recipientStats.map(stat => ({
      email: stat.recipientEmail,
      count: stat._count.recipientEmail,
    }));

    // Get top templates
    const topTemplateStats = await prisma.emailQueue.groupBy({
      by: ['templateId'],
      where: { ...where, templateId: { not: null } },
      _count: { templateId: true },
      orderBy: { _count: { templateId: 'desc' } },
      take: 10,
    });

    const topTemplates = await Promise.all(
      topTemplateStats.map(async (stat) => {
        const template = await prisma.emailTemplate.findUnique({
          where: { id: stat.templateId! },
          select: { name: true },
        });
        return {
          templateId: stat.templateId!,
          name: template?.name || 'Unknown Template',
          count: stat._count.templateId,
        };
      })
    );

    // Get error types
    const errorStats = await prisma.emailQueue.groupBy({
      by: ['errorMessage'],
      where: { ...where, status: 'failed', errorMessage: { not: null } },
      _count: { errorMessage: true },
    });

    const errorTypes = errorStats.reduce((acc, stat) => {
      const errorType = stat.errorMessage?.split(':')[0] || 'Unknown Error';
      acc[errorType] = (acc[errorType] || 0) + stat._count.errorMessage;
      return acc;
    }, {} as Record<string, number>);

    // Get delivery trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendStats = await prisma.emailQueue.groupBy({
      by: ['createdAt'],
      where: {
        ...where,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { createdAt: true },
    });

    const deliveryTrends = trendStats.map(stat => ({
      date: stat.createdAt.toISOString().split('T')[0],
      sent: stat._count.createdAt,
      failed: 0, // This would need a separate query for failed emails by date
    }));

    return {
      totalSent,
      totalFailed,
      totalPending,
      totalProcessing,
      totalCancelled,
      successRate,
      averageDeliveryTime,
      emailsByStatus,
      emailsByPriority,
      emailsByTemplate,
      emailsByDay: {}, // Would need additional query
      emailsByHour: {}, // Would need additional query
      topRecipients,
      topTemplates,
      errorTypes,
      deliveryTrends,
    };
  }

  // Cleanup old emails
  async cleanupOldEmails(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.emailQueue.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: ['sent', 'failed', 'cancelled'] },
      },
    });

    return result.count;
  }

  // Test email configuration
  async testEmailConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }

  // Send bulk emails
  async sendBulkEmails(
    recipients: EmailRecipient[],
    subject: string,
    htmlContent: string,
    textContent: string,
    userId: string,
    tenantId: string,
    options?: Partial<EmailOptions>
  ): Promise<string[]> {
    const emailIds: string[] = [];

    for (const recipient of recipients) {
      const emailId = await this.sendEmail({
        to: [recipient],
        subject,
        htmlContent,
        textContent,
        ...options,
      }, userId, tenantId);
      
      emailIds.push(emailId);
    }

    return emailIds;
  }

  // Send scheduled emails
  async sendScheduledEmails(): Promise<void> {
    const now = new Date();
    const scheduledEmails = await prisma.emailQueue.findMany({
      where: {
        status: 'pending',
        scheduledAt: { lte: now },
      },
      take: 100, // Process in batches
    });

    for (const email of scheduledEmails) {
      this.processEmailQueue(email.id).catch(error => {
        console.error(`Scheduled email ${email.id} failed:`, error);
        this.updateEmailStatus(email.id, 'failed', error.message);
      });
    }
  }
}

export const emailNotificationService = new EmailNotificationService();
