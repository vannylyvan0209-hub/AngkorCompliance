import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { CustomError } from '../middleware/errorHandler';

export interface UploadedFile {
  originalName: string;
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  extension: string;
}

export interface FileUploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadPath: string;
}

class FileUploadService {
  private config: FileUploadConfig;

  constructor() {
    this.config = {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
      allowedMimeTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,xls,xlsx,jpg,jpeg,png').split(','),
      uploadPath: process.env.UPLOAD_PATH || './uploads',
    };
  }

  // Initialize upload directory
  async initializeUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.config.uploadPath);
    } catch {
      await fs.mkdir(this.config.uploadPath, { recursive: true });
    }
  }

  // Configure multer storage
  private getStorage() {
    return multer.diskStorage({
      destination: async (req, file, cb) => {
        await this.initializeUploadDirectory();
        cb(null, this.config.uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });
  }

  // File filter function
  private fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedExtensions = this.config.allowedMimeTypes.map(type => `.${type}`);
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new CustomError(`File type ${fileExtension} is not allowed. Allowed types: ${this.config.allowedMimeTypes.join(', ')}`, 400));
    }
  };

  // Get multer instance
  getMulterInstance() {
    return multer({
      storage: this.getStorage(),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: this.config.maxFileSize,
        files: 5, // Maximum 5 files per request
      },
    });
  }

  // Process uploaded file
  async processUploadedFile(file: Express.Multer.File): Promise<UploadedFile> {
    if (!file) {
      throw new CustomError('No file uploaded', 400);
    }

    // Validate file size
    if (file.size > this.config.maxFileSize) {
      await this.deleteFile(file.path);
      throw new CustomError(`File size exceeds maximum allowed size of ${this.config.maxFileSize} bytes`, 400);
    }

    // Get file extension
    const extension = path.extname(file.originalname).toLowerCase();

    return {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype,
      extension,
    };
  }

  // Process multiple uploaded files
  async processUploadedFiles(files: Express.Multer.File[]): Promise<UploadedFile[]> {
    if (!files || files.length === 0) {
      throw new CustomError('No files uploaded', 400);
    }

    const processedFiles: UploadedFile[] = [];

    for (const file of files) {
      try {
        const processedFile = await this.processUploadedFile(file);
        processedFiles.push(processedFile);
      } catch (error) {
        // Clean up any files that were uploaded but failed processing
        await this.deleteFile(file.path);
        throw error;
      }
    }

    return processedFiles;
  }

  // Delete file from filesystem
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }

  // Get file info
  async getFileInfo(filePath: string): Promise<{ size: number; exists: boolean }> {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        exists: true,
      };
    } catch {
      return {
        size: 0,
        exists: false,
      };
    }
  }

  // Move file to permanent location
  async moveFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destinationPath);
      await fs.mkdir(destDir, { recursive: true });
      
      // Move file
      await fs.rename(sourcePath, destinationPath);
    } catch (error) {
      throw new CustomError(`Failed to move file: ${error}`, 500);
    }
  }

  // Copy file
  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      // Ensure destination directory exists
      const destDir = path.dirname(destinationPath);
      await fs.mkdir(destDir, { recursive: true });
      
      // Copy file
      await fs.copyFile(sourcePath, destinationPath);
    } catch (error) {
      throw new CustomError(`Failed to copy file: ${error}`, 500);
    }
  }

  // Generate file URL
  generateFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  // Validate file type
  validateFileType(filename: string): boolean {
    const extension = path.extname(filename).toLowerCase().substring(1);
    return this.config.allowedMimeTypes.includes(extension);
  }

  // Get file size in human readable format
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get allowed file types
  getAllowedFileTypes(): string[] {
    return this.config.allowedMimeTypes;
  }

  // Get maximum file size
  getMaxFileSize(): number {
    return this.config.maxFileSize;
  }

  // Get maximum file size in human readable format
  getMaxFileSizeFormatted(): string {
    return this.formatFileSize(this.config.maxFileSize);
  }

  // Clean up old temporary files
  async cleanupTempFiles(olderThanHours: number = 24): Promise<void> {
    try {
      const files = await fs.readdir(this.config.uploadPath);
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(this.config.uploadPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          await this.deleteFile(filePath);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup temp files:', error);
    }
  }

  // Get upload statistics
  async getUploadStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
  }> {
    try {
      const files = await fs.readdir(this.config.uploadPath);
      let totalSize = 0;
      const filesByType: Record<string, number> = {};

      for (const file of files) {
        const filePath = path.join(this.config.uploadPath, file);
        const stats = await fs.stat(filePath);
        const extension = path.extname(file).toLowerCase();
        
        totalSize += stats.size;
        filesByType[extension] = (filesByType[extension] || 0) + 1;
      }

      return {
        totalFiles: files.length,
        totalSize,
        filesByType,
      };
    } catch (error) {
      console.error('Failed to get upload stats:', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        filesByType: {},
      };
    }
  }
}

export const fileUploadService = new FileUploadService();
