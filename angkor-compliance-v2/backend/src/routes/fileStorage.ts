import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { fileStorageService } from '../services/fileStorageService';
import multer from 'multer';
import * as path from 'path';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
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

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

// Validation schemas
const fileUploadSchema = z.object({
  folder: z.string().optional(),
  isPublic: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  expiresAt: z.string().transform(str => new Date(str)).optional(),
});

const fileSearchSchema = z.object({
  query: z.string().optional(),
  folder: z.string().optional(),
  mimetype: z.string().optional(),
  tags: z.array(z.string()).optional(),
  uploadedBy: z.string().optional(),
  isPublic: z.boolean().optional(),
  dateFrom: z.string().transform(str => new Date(str)).optional(),
  dateTo: z.string().transform(str => new Date(str)).optional(),
  sizeMin: z.string().transform(str => parseInt(str)).optional(),
  sizeMax: z.string().transform(str => parseInt(str)).optional(),
  limit: z.string().transform(str => parseInt(str)).default('20'),
  offset: z.string().transform(str => parseInt(str)).default('0'),
  sortBy: z.enum(['filename', 'size', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// POST /api/file-storage/upload
router.post('/upload', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  const uploadOptions = fileUploadSchema.parse(req.body);
  
  const fileInfo = await fileStorageService.uploadFile({
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    buffer: req.file.buffer,
    folder: uploadOptions.folder,
    isPublic: uploadOptions.isPublic,
    metadata: uploadOptions.metadata,
    tags: uploadOptions.tags,
    expiresAt: uploadOptions.expiresAt,
  }, req.user!.id, req.user!.tenantId);

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: fileInfo,
  });
}));

// POST /api/file-storage/upload-multiple
router.post('/upload-multiple', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), upload.array('files', 10), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded',
    });
  }

  const uploadOptions = fileUploadSchema.parse(req.body);
  const files = req.files as Express.Multer.File[];
  
  const fileInfos = await Promise.all(
    files.map(file => fileStorageService.uploadFile({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
      folder: uploadOptions.folder,
      isPublic: uploadOptions.isPublic,
      metadata: uploadOptions.metadata,
      tags: uploadOptions.tags,
      expiresAt: uploadOptions.expiresAt,
    }, req.user!.id, req.user!.tenantId))
  );

  res.status(201).json({
    success: true,
    message: 'Files uploaded successfully',
    data: fileInfos,
  });
}));

// GET /api/file-storage/search
router.get('/search', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const searchOptions = fileSearchSchema.parse(req.query);
  const result = await fileStorageService.searchFiles(searchOptions, req.user!.id);
  
  res.json({
    success: true,
    data: result.files,
    pagination: {
      total: result.total,
      limit: searchOptions.limit,
      offset: searchOptions.offset,
    },
  });
}));

// GET /api/file-storage/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const fileInfo = await fileStorageService.getFileInfo(req.params.id, req.user!.id);
  
  if (!fileInfo) {
    return res.status(404).json({
      success: false,
      message: 'File not found',
    });
  }
  
  res.json({
    success: true,
    data: fileInfo,
  });
}));

// GET /api/file-storage/:id/download
router.get('/:id/download', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const fileData = await fileStorageService.downloadFile(req.params.id, req.user!.id);
  
  res.setHeader('Content-Type', fileData.mimetype);
  res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
  res.send(fileData.buffer);
}));

// DELETE /api/file-storage/:id
router.delete('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  await fileStorageService.deleteFile(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'File deleted successfully',
  });
}));

// GET /api/file-storage/stats
router.get('/stats', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const dateFrom = req.query.dateFrom as string;
  const dateTo = req.query.dateTo as string;
  
  const dateRange = dateFrom && dateTo ? {
    from: new Date(dateFrom),
    to: new Date(dateTo),
  } : undefined;
  
  const stats = await fileStorageService.getFileStats(req.user!.id, dateRange);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/file-storage/folders
router.get('/folders', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const folders = await fileStorageService.getFileFolders(req.user!.id);
  
  res.json({
    success: true,
    data: folders,
  });
}));

// GET /api/file-storage/tags
router.get('/tags', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const tags = await fileStorageService.getFileTags(req.user!.id);
  
  res.json({
    success: true,
    data: tags,
  });
}));

// POST /api/file-storage/cleanup-expired
router.post('/cleanup-expired', requireRole(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const deletedCount = await fileStorageService.cleanupExpiredFiles();
  
  res.json({
    success: true,
    message: `Cleaned up ${deletedCount} expired files`,
    data: { deletedCount },
  });
}));

// GET /api/file-storage/mime-types
router.get('/mime-types', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const mimeTypes = [
    { value: 'image/jpeg', label: 'JPEG Image', description: 'JPEG image files' },
    { value: 'image/png', label: 'PNG Image', description: 'PNG image files' },
    { value: 'image/gif', label: 'GIF Image', description: 'GIF image files' },
    { value: 'image/webp', label: 'WebP Image', description: 'WebP image files' },
    { value: 'application/pdf', label: 'PDF Document', description: 'PDF documents' },
    { value: 'application/msword', label: 'Word Document', description: 'Microsoft Word documents' },
    { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word Document (DOCX)', description: 'Microsoft Word documents (DOCX)' },
    { value: 'application/vnd.ms-excel', label: 'Excel Spreadsheet', description: 'Microsoft Excel spreadsheets' },
    { value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'Excel Spreadsheet (XLSX)', description: 'Microsoft Excel spreadsheets (XLSX)' },
    { value: 'application/vnd.ms-powerpoint', label: 'PowerPoint Presentation', description: 'Microsoft PowerPoint presentations' },
    { value: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', label: 'PowerPoint Presentation (PPTX)', description: 'Microsoft PowerPoint presentations (PPTX)' },
    { value: 'text/plain', label: 'Text File', description: 'Plain text files' },
    { value: 'text/csv', label: 'CSV File', description: 'Comma-separated values files' },
    { value: 'application/zip', label: 'ZIP Archive', description: 'ZIP compressed archives' },
    { value: 'application/x-zip-compressed', label: 'ZIP Archive (Alternative)', description: 'ZIP compressed archives (alternative MIME type)' },
  ];
  
  res.json({
    success: true,
    data: mimeTypes,
  });
}));

// GET /api/file-storage/folders/default
router.get('/folders/default', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'GRIEVANCE_COMMITTEE', 'AUDITOR']), asyncHandler(async (req, res) => {
  const defaultFolders = [
    { value: 'general', label: 'General', description: 'General file storage' },
    { value: 'documents', label: 'Documents', description: 'Document files' },
    { value: 'images', label: 'Images', description: 'Image files' },
    { value: 'audits', label: 'Audits', description: 'Audit-related files' },
    { value: 'grievances', label: 'Grievances', description: 'Grievance-related files' },
    { value: 'trainings', label: 'Trainings', description: 'Training-related files' },
    { value: 'permits', label: 'Permits', description: 'Permit-related files' },
    { value: 'compliance', label: 'Compliance', description: 'Compliance-related files' },
    { value: 'corrective-actions', label: 'Corrective Actions', description: 'Corrective action-related files' },
    { value: 'exports', label: 'Exports', description: 'Export files' },
    { value: 'templates', label: 'Templates', description: 'Template files' },
    { value: 'backups', label: 'Backups', description: 'Backup files' },
  ];
  
  res.json({
    success: true,
    data: defaultFolders,
  });
}));

export default router;
