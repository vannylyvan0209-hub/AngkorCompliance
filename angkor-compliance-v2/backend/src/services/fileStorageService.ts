import { prisma } from '../index';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as sharp from 'sharp';

export interface FileUploadOptions {
  filename: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  folder?: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
  expiresAt?: Date;
}

export interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  folder: string;
  isPublic: boolean;
  metadata: Record<string, any>;
  tags: string[];
  expiresAt?: Date;
  uploadedBy: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileStorageStats {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  filesByFolder: Record<string, number>;
  filesByUser: Array<{ userId: string; userName: string; count: number; size: number }>;
  filesByTenant: Array<{ tenantId: string; tenantName: string; count: number; size: number }>;
  recentUploads: FileInfo[];
  largestFiles: FileInfo[];
  storageUsage: {
    used: number;
    limit: number;
    percentage: number;
  };
  fileTypes: Array<{ type: string; count: number; size: number }>;
  folders: Array<{ folder: string; count: number; size: number }>;
  uploadTrends: Array<{ date: string; count: number; size: number }>;
}

export interface FileSearchOptions {
  query?: string;
  folder?: string;
  mimetype?: string;
  tags?: string[];
  uploadedBy?: string;
  isPublic?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sizeMin?: number;
  sizeMax?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'filename' | 'size' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

class FileStorageService {
  private s3: AWS.S3;
  private bucketName: string;
  private localStoragePath: string;
  private maxFileSize: number;
  private allowedMimeTypes: string[];

  constructor() {
    // Initialize AWS S3
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
    });

    this.bucketName = process.env.AWS_S3_BUCKET || 'angkor-compliance-files';
    this.localStoragePath = path.join(process.cwd(), 'uploads');
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-zip-compressed',
    ];

    // Ensure local storage directory exists
    if (!fs.existsSync(this.localStoragePath)) {
      fs.mkdirSync(this.localStoragePath, { recursive: true });
    }
  }

  // Upload file
  async uploadFile(options: FileUploadOptions, userId: string, tenantId: string): Promise<FileInfo> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Validate file
    this.validateFile(options);

    // Generate unique file ID
    const fileId = crypto.randomUUID();
    const fileExtension = path.extname(options.filename);
    const fileName = `${fileId}${fileExtension}`;
    const folder = options.folder || 'general';
    const filePath = `${tenantId}/${folder}/${fileName}`;

    try {
      // Upload to S3 or local storage
      let url: string;
      let thumbnailUrl: string | undefined;

      if (process.env.NODE_ENV === 'production' && process.env.AWS_ACCESS_KEY_ID) {
        // Upload to S3
        const uploadResult = await this.uploadToS3(options.buffer, filePath, options.mimetype);
        url = uploadResult.Location;

        // Generate thumbnail for images
        if (options.mimetype.startsWith('image/')) {
          const thumbnailBuffer = await this.generateThumbnail(options.buffer);
          const thumbnailPath = `${tenantId}/${folder}/thumbnails/${fileName}`;
          const thumbnailResult = await this.uploadToS3(thumbnailBuffer, thumbnailPath, 'image/jpeg');
          thumbnailUrl = thumbnailResult.Location;
        }
      } else {
        // Upload to local storage
        const localPath = path.join(this.localStoragePath, filePath);
        const localDir = path.dirname(localPath);
        
        if (!fs.existsSync(localDir)) {
          fs.mkdirSync(localDir, { recursive: true });
        }

        fs.writeFileSync(localPath, options.buffer);
        url = `/uploads/${filePath}`;

        // Generate thumbnail for images
        if (options.mimetype.startsWith('image/')) {
          const thumbnailBuffer = await this.generateThumbnail(options.buffer);
          const thumbnailPath = path.join(this.localStoragePath, `${tenantId}/${folder}/thumbnails/${fileName}`);
          const thumbnailDir = path.dirname(thumbnailPath);
          
          if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
          }

          fs.writeFileSync(thumbnailPath, thumbnailBuffer);
          thumbnailUrl = `/uploads/${tenantId}/${folder}/thumbnails/${fileName}`;
        }
      }

      // Save file info to database
      const fileRecord = await prisma.fileStorage.create({
        data: {
          id: fileId,
          filename: fileName,
          originalName: options.filename,
          mimetype: options.mimetype,
          size: options.size,
          url,
          thumbnailUrl,
          folder,
          isPublic: options.isPublic || false,
          metadata: options.metadata || {},
          tags: options.tags || [],
          expiresAt: options.expiresAt,
          uploadedBy: userId,
          tenantId,
        },
      });

      // Log file upload activity
      await this.logFileActivity(fileId, 'upload', 'File uploaded successfully', userId, tenantId);

      return {
        id: fileRecord.id,
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        mimetype: fileRecord.mimetype,
        size: fileRecord.size,
        url: fileRecord.url,
        thumbnailUrl: fileRecord.thumbnailUrl,
        folder: fileRecord.folder,
        isPublic: fileRecord.isPublic,
        metadata: fileRecord.metadata,
        tags: fileRecord.tags,
        expiresAt: fileRecord.expiresAt,
        uploadedBy: fileRecord.uploadedBy,
        tenantId: fileRecord.tenantId,
        createdAt: fileRecord.createdAt,
        updatedAt: fileRecord.updatedAt,
      };

    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Upload to S3
  private async uploadToS3(buffer: Buffer, key: string, mimetype: string): Promise<AWS.S3.ManagedUpload.SendData> {
    const uploadParams: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ACL: 'private',
    };

    return this.s3.upload(uploadParams).promise();
  }

  // Generate thumbnail
  private async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  // Validate file
  private validateFile(options: FileUploadOptions): void {
    if (options.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
    }

    if (!this.allowedMimeTypes.includes(options.mimetype)) {
      throw new Error(`File type ${options.mimetype} is not allowed`);
    }

    if (!options.filename || options.filename.trim() === '') {
      throw new Error('Filename is required');
    }

    if (!options.buffer || options.buffer.length === 0) {
      throw new Error('File buffer is required');
    }
  }

  // Get file info
  async getFileInfo(fileId: string, userId: string): Promise<FileInfo | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const fileRecord = await prisma.fileStorage.findFirst({
      where: {
        id: fileId,
        ...(user.role !== 'SUPER_ADMIN' ? { tenantId: user.tenantId } : {}),
      },
    });

    if (!fileRecord) {
      return null;
    }

    return {
      id: fileRecord.id,
      filename: fileRecord.filename,
      originalName: fileRecord.originalName,
      mimetype: fileRecord.mimetype,
      size: fileRecord.size,
      url: fileRecord.url,
      thumbnailUrl: fileRecord.thumbnailUrl,
      folder: fileRecord.folder,
      isPublic: fileRecord.isPublic,
      metadata: fileRecord.metadata,
      tags: fileRecord.tags,
      expiresAt: fileRecord.expiresAt,
      uploadedBy: fileRecord.uploadedBy,
      tenantId: fileRecord.tenantId,
      createdAt: fileRecord.createdAt,
      updatedAt: fileRecord.updatedAt,
    };
  }

  // Download file
  async downloadFile(fileId: string, userId: string): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const fileRecord = await prisma.fileStorage.findFirst({
      where: {
        id: fileId,
        ...(user.role !== 'SUPER_ADMIN' ? { tenantId: user.tenantId } : {}),
      },
    });

    if (!fileRecord) {
      throw createNotFoundError('File');
    }

    try {
      let buffer: Buffer;

      if (process.env.NODE_ENV === 'production' && process.env.AWS_ACCESS_KEY_ID) {
        // Download from S3
        const key = fileRecord.url.split('/').slice(-3).join('/'); // Extract key from URL
        const downloadParams: AWS.S3.GetObjectRequest = {
          Bucket: this.bucketName,
          Key: key,
        };

        const result = await this.s3.getObject(downloadParams).promise();
        buffer = result.Body as Buffer;
      } else {
        // Download from local storage
        const localPath = path.join(this.localStoragePath, fileRecord.url.replace('/uploads/', ''));
        buffer = fs.readFileSync(localPath);
      }

      // Log file download activity
      await this.logFileActivity(fileId, 'download', 'File downloaded', userId, user.tenantId);

      return {
        buffer,
        filename: fileRecord.originalName,
        mimetype: fileRecord.mimetype,
      };

    } catch (error) {
      console.error('File download error:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  // Delete file
  async deleteFile(fileId: string, userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const fileRecord = await prisma.fileStorage.findFirst({
      where: {
        id: fileId,
        ...(user.role !== 'SUPER_ADMIN' ? { tenantId: user.tenantId } : {}),
      },
    });

    if (!fileRecord) {
      throw createNotFoundError('File');
    }

    try {
      // Delete from S3 or local storage
      if (process.env.NODE_ENV === 'production' && process.env.AWS_ACCESS_KEY_ID) {
        // Delete from S3
        const key = fileRecord.url.split('/').slice(-3).join('/');
        await this.s3.deleteObject({
          Bucket: this.bucketName,
          Key: key,
        }).promise();

        // Delete thumbnail if exists
        if (fileRecord.thumbnailUrl) {
          const thumbnailKey = fileRecord.thumbnailUrl.split('/').slice(-3).join('/');
          await this.s3.deleteObject({
            Bucket: this.bucketName,
            Key: thumbnailKey,
          }).promise();
        }
      } else {
        // Delete from local storage
        const localPath = path.join(this.localStoragePath, fileRecord.url.replace('/uploads/', ''));
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }

        // Delete thumbnail if exists
        if (fileRecord.thumbnailUrl) {
          const thumbnailPath = path.join(this.localStoragePath, fileRecord.thumbnailUrl.replace('/uploads/', ''));
          if (fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);
          }
        }
      }

      // Delete from database
      await prisma.fileStorage.delete({
        where: { id: fileId },
      });

      // Log file deletion activity
      await this.logFileActivity(fileId, 'delete', 'File deleted', userId, user.tenantId);

    } catch (error) {
      console.error('File deletion error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Search files
  async searchFiles(options: FileSearchOptions, userId: string): Promise<{ files: FileInfo[]; total: number }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const where: any = {};
    
    // Tenant isolation
    if (user.role !== 'SUPER_ADMIN') {
      where.tenantId = user.tenantId;
    }

    // Apply filters
    if (options.query) {
      where.OR = [
        { originalName: { contains: options.query, mode: 'insensitive' } },
        { filename: { contains: options.query, mode: 'insensitive' } },
        { tags: { has: options.query } },
      ];
    }

    if (options.folder) {
      where.folder = options.folder;
    }

    if (options.mimetype) {
      where.mimetype = options.mimetype;
    }

    if (options.tags && options.tags.length > 0) {
      where.tags = { hasSome: options.tags };
    }

    if (options.uploadedBy) {
      where.uploadedBy = options.uploadedBy;
    }

    if (options.isPublic !== undefined) {
      where.isPublic = options.isPublic;
    }

    if (options.dateFrom || options.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) where.createdAt.gte = options.dateFrom;
      if (options.dateTo) where.createdAt.lte = options.dateTo;
    }

    if (options.sizeMin || options.sizeMax) {
      where.size = {};
      if (options.sizeMin) where.size.gte = options.sizeMin;
      if (options.sizeMax) where.size.lte = options.sizeMax;
    }

    // Get total count
    const total = await prisma.fileStorage.count({ where });

    // Get files with pagination
    const files = await prisma.fileStorage.findMany({
      where,
      orderBy: {
        [options.sortBy || 'createdAt']: options.sortOrder || 'desc',
      },
      take: options.limit || 20,
      skip: options.offset || 0,
    });

    return {
      files: files.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        url: file.url,
        thumbnailUrl: file.thumbnailUrl,
        folder: file.folder,
        isPublic: file.isPublic,
        metadata: file.metadata,
        tags: file.tags,
        expiresAt: file.expiresAt,
        uploadedBy: file.uploadedBy,
        tenantId: file.tenantId,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      })),
      total,
    };
  }

  // Get file statistics
  async getFileStats(userId: string, dateRange?: { from: Date; to: Date }): Promise<FileStorageStats> {
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
    const totalFiles = await prisma.fileStorage.count({ where });
    const totalSizeResult = await prisma.fileStorage.aggregate({
      where,
      _sum: { size: true },
    });
    const totalSize = totalSizeResult._sum.size || 0;

    // Get files by type
    const typeStats = await prisma.fileStorage.groupBy({
      by: ['mimetype'],
      where,
      _count: { mimetype: true },
      _sum: { size: true },
    });

    const filesByType = typeStats.reduce((acc, stat) => {
      acc[stat.mimetype] = stat._count.mimetype;
      return acc;
    }, {} as Record<string, number>);

    // Get files by folder
    const folderStats = await prisma.fileStorage.groupBy({
      by: ['folder'],
      where,
      _count: { folder: true },
      _sum: { size: true },
    });

    const filesByFolder = folderStats.reduce((acc, stat) => {
      acc[stat.folder] = stat._count.folder;
      return acc;
    }, {} as Record<string, number>);

    // Get files by user
    const userStats = await prisma.fileStorage.groupBy({
      by: ['uploadedBy'],
      where,
      _count: { uploadedBy: true },
      _sum: { size: true },
    });

    const filesByUser = await Promise.all(
      userStats.map(async (stat) => {
        const user = await prisma.user.findUnique({
          where: { id: stat.uploadedBy },
          select: { firstName: true, lastName: true },
        });
        return {
          userId: stat.uploadedBy,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
          count: stat._count.uploadedBy,
          size: stat._sum.size || 0,
        };
      })
    );

    // Get files by tenant (for super admin)
    let filesByTenant: Array<{ tenantId: string; tenantName: string; count: number; size: number }> = [];
    if (user.role === 'SUPER_ADMIN') {
      const tenantStats = await prisma.fileStorage.groupBy({
        by: ['tenantId'],
        where: dateRange ? { createdAt: { gte: dateRange.from, lte: dateRange.to } } : {},
        _count: { tenantId: true },
        _sum: { size: true },
      });

      filesByTenant = await Promise.all(
        tenantStats.map(async (stat) => {
          const tenant = await prisma.tenant.findUnique({
            where: { id: stat.tenantId },
            select: { name: true },
          });
          return {
            tenantId: stat.tenantId,
            tenantName: tenant?.name || 'Unknown Tenant',
            count: stat._count.tenantId,
            size: stat._sum.size || 0,
          };
        })
      );
    }

    // Get recent uploads
    const recentUploads = await prisma.fileStorage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get largest files
    const largestFiles = await prisma.fileStorage.findMany({
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

    // Get file types with size
    const fileTypes = typeStats.map(stat => ({
      type: stat.mimetype,
      count: stat._count.mimetype,
      size: stat._sum.size || 0,
    }));

    // Get folders with size
    const folders = folderStats.map(stat => ({
      folder: stat.folder,
      count: stat._count.folder,
      size: stat._sum.size || 0,
    }));

    // Get upload trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendStats = await prisma.fileStorage.groupBy({
      by: ['createdAt'],
      where: {
        ...where,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { createdAt: true },
      _sum: { size: true },
    });

    const uploadTrends = trendStats.map(stat => ({
      date: stat.createdAt.toISOString().split('T')[0],
      count: stat._count.createdAt,
      size: stat._sum.size || 0,
    }));

    return {
      totalFiles,
      totalSize,
      filesByType,
      filesByFolder,
      filesByUser,
      filesByTenant,
      recentUploads: recentUploads.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        url: file.url,
        thumbnailUrl: file.thumbnailUrl,
        folder: file.folder,
        isPublic: file.isPublic,
        metadata: file.metadata,
        tags: file.tags,
        expiresAt: file.expiresAt,
        uploadedBy: file.uploadedBy,
        tenantId: file.tenantId,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      })),
      largestFiles: largestFiles.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
        url: file.url,
        thumbnailUrl: file.thumbnailUrl,
        folder: file.folder,
        isPublic: file.isPublic,
        metadata: file.metadata,
        tags: file.tags,
        expiresAt: file.expiresAt,
        uploadedBy: file.uploadedBy,
        tenantId: file.tenantId,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      })),
      storageUsage,
      fileTypes,
      folders,
      uploadTrends,
    };
  }

  // Cleanup expired files
  async cleanupExpiredFiles(): Promise<number> {
    const now = new Date();
    const expiredFiles = await prisma.fileStorage.findMany({
      where: {
        expiresAt: { lt: now },
      },
    });

    let deletedCount = 0;
    for (const file of expiredFiles) {
      try {
        await this.deleteFile(file.id, 'system'); // System cleanup
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete expired file ${file.id}:`, error);
      }
    }

    return deletedCount;
  }

  // Log file activity
  private async logFileActivity(fileId: string, action: string, details: string, userId: string, tenantId: string): Promise<void> {
    await prisma.activity.create({
      data: {
        type: 'FILE_ACTIVITY',
        title: `File ${action}`,
        description: details,
        resource: fileId,
        resourceType: 'FILE',
        tenantId,
        createdBy: userId,
      },
    });
  }

  // Get file folders
  async getFileFolders(userId: string): Promise<string[]> {
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

    const folders = await prisma.fileStorage.findMany({
      where,
      select: { folder: true },
      distinct: ['folder'],
    });

    return folders.map(f => f.folder);
  }

  // Get file tags
  async getFileTags(userId: string): Promise<string[]> {
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

    const files = await prisma.fileStorage.findMany({
      where,
      select: { tags: true },
    });

    const allTags = files.flatMap(f => f.tags);
    return [...new Set(allTags)]; // Remove duplicates
  }
}

export const fileStorageService = new FileStorageService();
