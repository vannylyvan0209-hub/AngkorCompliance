import { prisma } from '../index';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as AWS from 'aws-sdk';
import * as archiver from 'archiver';
import * as tar from 'tar';

export interface BackupOptions {
  name: string;
  description?: string;
  includeData: boolean;
  includeFiles: boolean;
  includeConfig: boolean;
  entities?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  compression: 'none' | 'gzip' | 'zip';
  encryption?: boolean;
  password?: string;
  retentionDays?: number;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
}

export interface BackupInfo {
  id: string;
  name: string;
  description?: string;
  type: 'FULL' | 'INCREMENTAL' | 'DIFFERENTIAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  size: number;
  filePath: string;
  checksum: string;
  compression: string;
  encryption: boolean;
  entities: string[];
  dateFrom?: Date;
  dateTo?: Date;
  retentionDays: number;
  expiresAt: Date;
  createdBy: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
  metadata: Record<string, any>;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  backupsByType: Record<string, number>;
  backupsByStatus: Record<string, number>;
  backupsByUser: Array<{ userId: string; userName: string; count: number; size: number }>;
  backupsByTenant: Array<{ tenantId: string; tenantName: string; count: number; size: number }>;
  recentBackups: BackupInfo[];
  largestBackups: BackupInfo[];
  storageUsage: {
    used: number;
    limit: number;
    percentage: number;
  };
  backupTypes: Array<{ type: string; count: number; size: number }>;
  backupStatuses: Array<{ status: string; count: number; size: number }>;
  backupTrends: Array<{ date: string; count: number; size: number }>;
  retentionStats: {
    totalRetained: number;
    totalExpired: number;
    nextCleanup: Date;
  };
}

export interface RestoreOptions {
  backupId: string;
  entities?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  overwriteExisting: boolean;
  validateData: boolean;
  dryRun: boolean;
}

class BackupService {
  private s3: AWS.S3;
  private bucketName: string;
  private localBackupPath: string;
  private maxBackupSize: number;
  private encryptionKey: string;

  constructor() {
    // Initialize AWS S3
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });

    this.bucketName = process.env.AWS_S3_BUCKET || 'angkor-compliance-backups';
    this.localBackupPath = path.join(process.cwd(), 'backups');
    this.maxBackupSize = parseInt(process.env.MAX_BACKUP_SIZE || '1073741824'); // 1GB
    this.encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || 'default-encryption-key';

    // Ensure local backup directory exists
    if (!fs.existsSync(this.localBackupPath)) {
      fs.mkdirSync(this.localBackupPath, { recursive: true });
    }
  }

  // Create backup
  async createBackup(options: BackupOptions, userId: string, tenantId: string): Promise<BackupInfo> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Validate backup options
    this.validateBackupOptions(options);

    // Generate unique backup ID
    const backupId = crypto.randomUUID();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${backupId}_${timestamp}.backup`;
    const filePath = path.join(this.localBackupPath, fileName);

    try {
      // Create backup record
      const backupRecord = await prisma.backup.create({
        data: {
          id: backupId,
          name: options.name,
          description: options.description,
          type: 'FULL',
          status: 'PENDING',
          size: 0,
          filePath,
          checksum: '',
          compression: options.compression,
          encryption: options.encryption || false,
          entities: options.entities || [],
          dateFrom: options.dateFrom,
          dateTo: options.dateTo,
          retentionDays: options.retentionDays || 30,
          expiresAt: new Date(Date.now() + (options.retentionDays || 30) * 24 * 60 * 60 * 1000),
          createdBy: userId,
          tenantId,
          metadata: {
            schedule: options.schedule,
            password: options.password ? '***' : undefined,
          },
        },
      });

      // Start backup process asynchronously
      this.processBackup(backupId, options, userId, tenantId).catch(error => {
        console.error(`Backup ${backupId} failed:`, error);
        this.updateBackupStatus(backupId, 'FAILED', error.message);
      });

      return {
        id: backupRecord.id,
        name: backupRecord.name,
        description: backupRecord.description,
        type: backupRecord.type,
        status: backupRecord.status,
        size: backupRecord.size,
        filePath: backupRecord.filePath,
        checksum: backupRecord.checksum,
        compression: backupRecord.compression,
        encryption: backupRecord.encryption,
        entities: backupRecord.entities,
        dateFrom: backupRecord.dateFrom,
        dateTo: backupRecord.dateTo,
        retentionDays: backupRecord.retentionDays,
        expiresAt: backupRecord.expiresAt,
        createdBy: backupRecord.createdBy,
        tenantId: backupRecord.tenantId,
        createdAt: backupRecord.createdAt,
        updatedAt: backupRecord.updatedAt,
        metadata: backupRecord.metadata,
      };

    } catch (error) {
      console.error('Backup creation error:', error);
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }

  // Process backup
  private async processBackup(backupId: string, options: BackupOptions, userId: string, tenantId: string): Promise<void> {
    try {
      // Update status to in progress
      await this.updateBackupStatus(backupId, 'IN_PROGRESS');

      const backupRecord = await prisma.backup.findUnique({
        where: { id: backupId },
      });

      if (!backupRecord) {
        throw new Error('Backup record not found');
      }

      // Create backup data
      const backupData = await this.generateBackupData(options, tenantId);

      // Compress backup data
      const compressedData = await this.compressBackupData(backupData, options.compression);

      // Encrypt backup data if requested
      const finalData = options.encryption 
        ? await this.encryptBackupData(compressedData, options.password)
        : compressedData;

      // Calculate checksum
      const checksum = crypto.createHash('sha256').update(finalData).digest('hex');

      // Save backup file
      const filePath = backupRecord.filePath;
      fs.writeFileSync(filePath, finalData);

      // Upload to S3 if configured
      if (process.env.NODE_ENV === 'production' && process.env.AWS_ACCESS_KEY_ID) {
        await this.uploadBackupToS3(finalData, backupId);
      }

      // Update backup record
      await prisma.backup.update({
        where: { id: backupId },
        data: {
          status: 'COMPLETED',
          size: finalData.length,
          checksum,
          completedAt: new Date(),
        },
      });

      // Log backup completion
      await this.logBackupActivity(backupId, 'create', 'Backup completed successfully', userId, tenantId);

    } catch (error) {
      console.error(`Backup processing error for ${backupId}:`, error);
      await this.updateBackupStatus(backupId, 'FAILED', error.message);
      throw error;
    }
  }

  // Generate backup data
  private async generateBackupData(options: BackupOptions, tenantId: string): Promise<any> {
    const backupData: any = {
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        tenantId,
        options,
      },
      data: {},
      files: {},
      config: {},
    };

    // Include data if requested
    if (options.includeData) {
      backupData.data = await this.exportDatabaseData(options, tenantId);
    }

    // Include files if requested
    if (options.includeFiles) {
      backupData.files = await this.exportFileData(options, tenantId);
    }

    // Include config if requested
    if (options.includeConfig) {
      backupData.config = await this.exportConfigData(tenantId);
    }

    return backupData;
  }

  // Export database data
  private async exportDatabaseData(options: BackupOptions, tenantId: string): Promise<any> {
    const data: any = {};

    // Define entities to export
    const entities = options.entities || [
      'User', 'Tenant', 'Role', 'Permission', 'Factory', 'Audit', 'Grievance',
      'Training', 'Permit', 'Notification', 'Document', 'ComplianceStandard',
      'CorrectiveAction', 'Activity', 'Log'
    ];

    // Export each entity
    for (const entity of entities) {
      try {
        const where: any = { tenantId };
        
        // Add date filters if specified
        if (options.dateFrom || options.dateTo) {
          where.createdAt = {};
          if (options.dateFrom) where.createdAt.gte = options.dateFrom;
          if (options.dateTo) where.createdAt.lte = options.dateTo;
        }

        // Get data from database
        const entityData = await (prisma as any)[entity.toLowerCase()].findMany({
          where,
        });

        data[entity] = entityData;
      } catch (error) {
        console.error(`Failed to export ${entity}:`, error);
        data[entity] = [];
      }
    }

    return data;
  }

  // Export file data
  private async exportFileData(options: BackupOptions, tenantId: string): Promise<any> {
    const files = await prisma.fileStorage.findMany({
      where: {
        tenantId,
        ...(options.dateFrom || options.dateTo ? {
          createdAt: {
            ...(options.dateFrom && { gte: options.dateFrom }),
            ...(options.dateTo && { lte: options.dateTo }),
          },
        } : {}),
      },
    });

    return files.map(file => ({
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimetype: file.mimetype,
      size: file.size,
      url: file.url,
      folder: file.folder,
      metadata: file.metadata,
      tags: file.tags,
      createdAt: file.createdAt,
    }));
  }

  // Export config data
  private async exportConfigData(tenantId: string): Promise<any> {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
        factories: {
          select: {
            id: true,
            name: true,
            address: true,
            isActive: true,
          },
        },
      },
    });

    return {
      tenant: {
        id: tenant?.id,
        name: tenant?.name,
        settings: tenant?.settings,
        plan: tenant?.plan,
        features: tenant?.features,
        users: tenant?.users,
        factories: tenant?.factories,
      },
    };
  }

  // Compress backup data
  private async compressBackupData(data: any, compression: string): Promise<Buffer> {
    const jsonData = JSON.stringify(data, null, 2);

    switch (compression) {
      case 'gzip':
        return await this.compressGzip(Buffer.from(jsonData));
      case 'zip':
        return await this.compressZip(Buffer.from(jsonData));
      default:
        return Buffer.from(jsonData);
    }
  }

  // Compress with gzip
  private async compressGzip(data: Buffer): Promise<Buffer> {
    const zlib = require('zlib');
    return new Promise((resolve, reject) => {
      zlib.gzip(data, (error: Error | null, result: Buffer) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }

  // Compress with zip
  private async compressZip(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      archive.append(data, { name: 'backup.json' });
      archive.finalize();
    });
  }

  // Encrypt backup data
  private async encryptBackupData(data: Buffer, password?: string): Promise<Buffer> {
    const key = password || this.encryptionKey;
    const cipher = crypto.createCipher('aes-256-cbc', key);
    
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return encrypted;
  }

  // Upload backup to S3
  private async uploadBackupToS3(data: Buffer, backupId: string): Promise<void> {
    const key = `backups/${backupId}.backup`;
    
    await this.s3.upload({
      Bucket: this.bucketName,
      Key: key,
      Body: data,
      ContentType: 'application/octet-stream',
      ACL: 'private',
    }).promise();
  }

  // Update backup status
  private async updateBackupStatus(backupId: string, status: string, errorMessage?: string): Promise<void> {
    await prisma.backup.update({
      where: { id: backupId },
      data: {
        status,
        errorMessage,
        updatedAt: new Date(),
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
    });
  }

  // Validate backup options
  private validateBackupOptions(options: BackupOptions): void {
    if (!options.name || options.name.trim() === '') {
      throw new Error('Backup name is required');
    }

    if (!options.includeData && !options.includeFiles && !options.includeConfig) {
      throw new Error('At least one backup type must be selected');
    }

    if (options.dateFrom && options.dateTo && options.dateFrom > options.dateTo) {
      throw new Error('Start date cannot be after end date');
    }

    if (options.retentionDays && options.retentionDays < 1) {
      throw new Error('Retention days must be at least 1');
    }
  }

  // Get backup info
  async getBackupInfo(backupId: string, userId: string): Promise<BackupInfo | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const backupRecord = await prisma.backup.findFirst({
      where: {
        id: backupId,
        ...(user.role !== 'SUPER_ADMIN' ? { tenantId: user.tenantId } : {}),
      },
    });

    if (!backupRecord) {
      return null;
    }

    return {
      id: backupRecord.id,
      name: backupRecord.name,
      description: backupRecord.description,
      type: backupRecord.type,
      status: backupRecord.status,
      size: backupRecord.size,
      filePath: backupRecord.filePath,
      checksum: backupRecord.checksum,
      compression: backupRecord.compression,
      encryption: backupRecord.encryption,
      entities: backupRecord.entities,
      dateFrom: backupRecord.dateFrom,
      dateTo: backupRecord.dateTo,
      retentionDays: backupRecord.retentionDays,
      expiresAt: backupRecord.expiresAt,
      createdBy: backupRecord.createdBy,
      tenantId: backupRecord.tenantId,
      createdAt: backupRecord.createdAt,
      updatedAt: backupRecord.updatedAt,
      completedAt: backupRecord.completedAt,
      errorMessage: backupRecord.errorMessage,
      metadata: backupRecord.metadata,
    };
  }

  // Download backup
  async downloadBackup(backupId: string, userId: string): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const backupRecord = await prisma.backup.findFirst({
      where: {
        id: backupId,
        ...(user.role !== 'SUPER_ADMIN' ? { tenantId: user.tenantId } : {}),
      },
    });

    if (!backupRecord) {
      throw createNotFoundError('Backup');
    }

    if (backupRecord.status !== 'COMPLETED') {
      throw new Error('Backup is not ready for download');
    }

    try {
      let buffer: Buffer;

      if (process.env.NODE_ENV === 'production' && process.env.AWS_ACCESS_KEY_ID) {
        // Download from S3
        const key = `backups/${backupId}.backup`;
        const result = await this.s3.getObject({
          Bucket: this.bucketName,
          Key: key,
        }).promise();
        buffer = result.Body as Buffer;
      } else {
        // Download from local storage
        buffer = fs.readFileSync(backupRecord.filePath);
      }

      // Log backup download activity
      await this.logBackupActivity(backupId, 'download', 'Backup downloaded', userId, user.tenantId);

      return {
        buffer,
        filename: `${backupRecord.name}.backup`,
        mimetype: 'application/octet-stream',
      };

    } catch (error) {
      console.error('Backup download error:', error);
      throw new Error(`Failed to download backup: ${error.message}`);
    }
  }

  // Restore backup
  async restoreBackup(options: RestoreOptions, userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const backupRecord = await prisma.backup.findFirst({
      where: {
        id: options.backupId,
        ...(user.role !== 'SUPER_ADMIN' ? { tenantId: user.tenantId } : {}),
      },
    });

    if (!backupRecord) {
      throw createNotFoundError('Backup');
    }

    if (backupRecord.status !== 'COMPLETED') {
      throw new Error('Backup is not ready for restoration');
    }

    try {
      // Download backup data
      const backupData = await this.downloadBackup(options.backupId, userId);
      
      // Decrypt backup data if encrypted
      let decryptedData = backupData.buffer;
      if (backupRecord.encryption) {
        decryptedData = await this.decryptBackupData(backupData.buffer, options.password);
      }

      // Decompress backup data
      const decompressedData = await this.decompressBackupData(decryptedData, backupRecord.compression);
      
      // Parse backup data
      const backupContent = JSON.parse(decompressedData.toString());

      // Validate backup data
      if (options.validateData) {
        await this.validateBackupData(backupContent);
      }

      // Restore data if not dry run
      if (!options.dryRun) {
        await this.restoreBackupData(backupContent, options, user.tenantId);
      }

      // Log backup restoration activity
      await this.logBackupActivity(options.backupId, 'restore', 'Backup restored successfully', userId, user.tenantId);

    } catch (error) {
      console.error('Backup restoration error:', error);
      throw new Error(`Failed to restore backup: ${error.message}`);
    }
  }

  // Decrypt backup data
  private async decryptBackupData(data: Buffer, password?: string): Promise<Buffer> {
    const key = password || this.encryptionKey;
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    
    let decrypted = decipher.update(data);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted;
  }

  // Decompress backup data
  private async decompressBackupData(data: Buffer, compression: string): Promise<Buffer> {
    switch (compression) {
      case 'gzip':
        return await this.decompressGzip(data);
      case 'zip':
        return await this.decompressZip(data);
      default:
        return data;
    }
  }

  // Decompress gzip
  private async decompressGzip(data: Buffer): Promise<Buffer> {
    const zlib = require('zlib');
    return new Promise((resolve, reject) => {
      zlib.gunzip(data, (error: Error | null, result: Buffer) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }

  // Decompress zip
  private async decompressZip(data: Buffer): Promise<Buffer> {
    // Implementation for zip decompression
    // This would require additional libraries like yauzl
    throw new Error('ZIP decompression not implemented yet');
  }

  // Validate backup data
  private async validateBackupData(backupContent: any): Promise<void> {
    if (!backupContent.metadata || !backupContent.metadata.version) {
      throw new Error('Invalid backup format: missing metadata');
    }

    if (!backupContent.data && !backupContent.files && !backupContent.config) {
      throw new Error('Invalid backup format: no data found');
    }
  }

  // Restore backup data
  private async restoreBackupData(backupContent: any, options: RestoreOptions, tenantId: string): Promise<void> {
    // Implementation for restoring backup data
    // This would involve importing data back into the database
    // and handling conflicts based on the overwriteExisting option
    throw new Error('Backup restoration not implemented yet');
  }

  // Delete backup
  async deleteBackup(backupId: string, userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const backupRecord = await prisma.backup.findFirst({
      where: {
        id: backupId,
        ...(user.role !== 'SUPER_ADMIN' ? { tenantId: user.tenantId } : {}),
      },
    });

    if (!backupRecord) {
      throw createNotFoundError('Backup');
    }

    try {
      // Delete from S3 if configured
      if (process.env.NODE_ENV === 'production' && process.env.AWS_ACCESS_KEY_ID) {
        const key = `backups/${backupId}.backup`;
        await this.s3.deleteObject({
          Bucket: this.bucketName,
          Key: key,
        }).promise();
      }

      // Delete from local storage
      if (fs.existsSync(backupRecord.filePath)) {
        fs.unlinkSync(backupRecord.filePath);
      }

      // Delete from database
      await prisma.backup.delete({
        where: { id: backupId },
      });

      // Log backup deletion activity
      await this.logBackupActivity(backupId, 'delete', 'Backup deleted', userId, user.tenantId);

    } catch (error) {
      console.error('Backup deletion error:', error);
      throw new Error(`Failed to delete backup: ${error.message}`);
    }
  }

  // Get backups
  async getBackups(userId: string, options: any = {}): Promise<{ backups: BackupInfo[]; total: number }> {
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

    // Apply filters
    if (options.status) {
      where.status = options.status;
    }

    if (options.type) {
      where.type = options.type;
    }

    if (options.dateFrom || options.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) where.createdAt.gte = options.dateFrom;
      if (options.dateTo) where.createdAt.lte = options.dateTo;
    }

    // Get total count
    const total = await prisma.backup.count({ where });

    // Get backups with pagination
    const backups = await prisma.backup.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 20,
      skip: options.offset || 0,
    });

    return {
      backups: backups.map(backup => ({
        id: backup.id,
        name: backup.name,
        description: backup.description,
        type: backup.type,
        status: backup.status,
        size: backup.size,
        filePath: backup.filePath,
        checksum: backup.checksum,
        compression: backup.compression,
        encryption: backup.encryption,
        entities: backup.entities,
        dateFrom: backup.dateFrom,
        dateTo: backup.dateTo,
        retentionDays: backup.retentionDays,
        expiresAt: backup.expiresAt,
        createdBy: backup.createdBy,
        tenantId: backup.tenantId,
        createdAt: backup.createdAt,
        updatedAt: backup.updatedAt,
        completedAt: backup.completedAt,
        errorMessage: backup.errorMessage,
        metadata: backup.metadata,
      })),
      total,
    };
  }

  // Get backup statistics
  async getBackupStats(userId: string, dateRange?: { from: Date; to: Date }): Promise<BackupStats> {
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
    const totalBackups = await prisma.backup.count({ where });
    const totalSizeResult = await prisma.backup.aggregate({
      where,
      _sum: { size: true },
    });
    const totalSize = totalSizeResult._sum.size || 0;

    // Get backups by type
    const typeStats = await prisma.backup.groupBy({
      by: ['type'],
      where,
      _count: { type: true },
      _sum: { size: true },
    });

    const backupsByType = typeStats.reduce((acc, stat) => {
      acc[stat.type] = stat._count.type;
      return acc;
    }, {} as Record<string, number>);

    // Get backups by status
    const statusStats = await prisma.backup.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
      _sum: { size: true },
    });

    const backupsByStatus = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {} as Record<string, number>);

    // Get recent backups
    const recentBackups = await prisma.backup.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get largest backups
    const largestBackups = await prisma.backup.findMany({
      where,
      orderBy: { size: 'desc' },
      take: 10,
    });

    // Calculate storage usage
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { storageLimit: true },
    });

    const storageLimit = tenant?.storageLimit || 1073741824; // 1GB default
    const storageUsage = {
      used: totalSize,
      limit: storageLimit,
      percentage: storageLimit > 0 ? (totalSize / storageLimit) * 100 : 0,
    };

    // Get backup types with size
    const backupTypes = typeStats.map(stat => ({
      type: stat.type,
      count: stat._count.type,
      size: stat._sum.size || 0,
    }));

    // Get backup statuses with size
    const backupStatuses = statusStats.map(stat => ({
      status: stat.status,
      count: stat._count.status,
      size: stat._sum.size || 0,
    }));

    // Get backup trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendStats = await prisma.backup.groupBy({
      by: ['createdAt'],
      where: {
        ...where,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { createdAt: true },
      _sum: { size: true },
    });

    const backupTrends = trendStats.map(stat => ({
      date: stat.createdAt.toISOString().split('T')[0],
      count: stat._count.createdAt,
      size: stat._sum.size || 0,
    }));

    // Get retention stats
    const now = new Date();
    const totalRetained = await prisma.backup.count({
      where: { ...where, expiresAt: { gt: now } },
    });
    const totalExpired = await prisma.backup.count({
      where: { ...where, expiresAt: { lte: now } },
    });

    const nextCleanup = new Date();
    nextCleanup.setDate(nextCleanup.getDate() + 1);

    return {
      totalBackups,
      totalSize,
      backupsByType,
      backupsByStatus,
      backupsByUser: [], // Would need to implement user stats
      backupsByTenant: [], // Would need to implement tenant stats
      recentBackups: recentBackups.map(backup => ({
        id: backup.id,
        name: backup.name,
        description: backup.description,
        type: backup.type,
        status: backup.status,
        size: backup.size,
        filePath: backup.filePath,
        checksum: backup.checksum,
        compression: backup.compression,
        encryption: backup.encryption,
        entities: backup.entities,
        dateFrom: backup.dateFrom,
        dateTo: backup.dateTo,
        retentionDays: backup.retentionDays,
        expiresAt: backup.expiresAt,
        createdBy: backup.createdBy,
        tenantId: backup.tenantId,
        createdAt: backup.createdAt,
        updatedAt: backup.updatedAt,
        completedAt: backup.completedAt,
        errorMessage: backup.errorMessage,
        metadata: backup.metadata,
      })),
      largestBackups: largestBackups.map(backup => ({
        id: backup.id,
        name: backup.name,
        description: backup.description,
        type: backup.type,
        status: backup.status,
        size: backup.size,
        filePath: backup.filePath,
        checksum: backup.checksum,
        compression: backup.compression,
        encryption: backup.encryption,
        entities: backup.entities,
        dateFrom: backup.dateFrom,
        dateTo: backup.dateTo,
        retentionDays: backup.retentionDays,
        expiresAt: backup.expiresAt,
        createdBy: backup.createdBy,
        tenantId: backup.tenantId,
        createdAt: backup.createdAt,
        updatedAt: backup.updatedAt,
        completedAt: backup.completedAt,
        errorMessage: backup.errorMessage,
        metadata: backup.metadata,
      })),
      storageUsage,
      backupTypes,
      backupStatuses,
      backupTrends,
      retentionStats: {
        totalRetained,
        totalExpired,
        nextCleanup,
      },
    };
  }

  // Cleanup expired backups
  async cleanupExpiredBackups(): Promise<number> {
    const now = new Date();
    const expiredBackups = await prisma.backup.findMany({
      where: {
        expiresAt: { lt: now },
      },
    });

    let deletedCount = 0;
    for (const backup of expiredBackups) {
      try {
        await this.deleteBackup(backup.id, 'system'); // System cleanup
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete expired backup ${backup.id}:`, error);
      }
    }

    return deletedCount;
  }

  // Log backup activity
  private async logBackupActivity(backupId: string, action: string, details: string, userId: string, tenantId: string): Promise<void> {
    await prisma.activity.create({
      data: {
        type: 'BACKUP_ACTIVITY',
        title: `Backup ${action}`,
        description: details,
        resource: backupId,
        resourceType: 'BACKUP',
        tenantId,
        createdBy: userId,
      },
    });
  }
}

export const backupService = new BackupService();
