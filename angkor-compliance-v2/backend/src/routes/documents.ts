import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { documentService } from '../services/documentService';
import { fileUploadService } from '../services/fileUploadService';
import { DocumentType } from '@prisma/client';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation schemas
const createDocumentSchema = z.object({
  title: z.string().min(1, 'Document title is required'),
  type: z.nativeEnum(DocumentType),
  category: z.string().min(1, 'Category is required'),
  content: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  factoryId: z.string().min(1, 'Factory ID is required'),
  filePath: z.string().optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
});

const updateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  type: z.nativeEnum(DocumentType).optional(),
  category: z.string().min(1).optional(),
  content: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

const documentFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(DocumentType).optional(),
  category: z.string().optional(),
  factoryId: z.string().optional(),
  isActive: z.boolean().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// GET /api/documents
router.get('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'AUDITOR']), asyncHandler(async (req, res) => {
  const filters = documentFiltersSchema.parse(req.query);
  const result = await documentService.getDocuments(filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/documents/stats
router.get('/stats', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'AUDITOR']), asyncHandler(async (req, res) => {
  const factoryId = req.query.factoryId as string;
  const stats = await documentService.getDocumentStats(factoryId, req.user!.id);
  
  res.json({
    success: true,
    data: stats,
  });
}));

// GET /api/documents/categories
router.get('/categories', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'AUDITOR']), asyncHandler(async (req, res) => {
  const factoryId = req.query.factoryId as string;
  const categories = await documentService.getDocumentCategories(factoryId, req.user!.id);
  
  res.json({
    success: true,
    data: categories,
  });
}));

// GET /api/documents/types
router.get('/types', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'AUDITOR']), asyncHandler(async (req, res) => {
  const types = await documentService.getDocumentTypes();
  
  res.json({
    success: true,
    data: types,
  });
}));

// GET /api/documents/search
router.get('/search', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'AUDITOR']), asyncHandler(async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Search query is required',
    });
  }

  const filters = documentFiltersSchema.parse(req.query);
  const result = await documentService.searchDocuments(query, filters, req.user!.id);
  
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
}));

// GET /api/documents/:id
router.get('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF', 'AUDITOR']), asyncHandler(async (req, res) => {
  const document = await documentService.getDocumentById(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    data: document,
  });
}));

// POST /api/documents/upload
router.post('/upload', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), fileUploadService.getMulterInstance().array('files', 5), asyncHandler(async (req, res) => {
  const files = req.files as Express.Multer.File[];
  const processedFiles = await fileUploadService.processUploadedFiles(files);
  
  res.json({
    success: true,
    message: 'Files uploaded successfully',
    data: processedFiles,
  });
}));

// POST /api/documents
router.post('/', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const validatedData = createDocumentSchema.parse(req.body);
  const document = await documentService.createDocument(validatedData, req.user!.id);
  
  res.status(201).json({
    success: true,
    message: 'Document created successfully',
    data: document,
  });
}));

// PUT /api/documents/:id
router.put('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF']), asyncHandler(async (req, res) => {
  const validatedData = updateDocumentSchema.parse(req.body);
  const document = await documentService.updateDocument(req.params.id, validatedData, req.user!.id);
  
  res.json({
    success: true,
    message: 'Document updated successfully',
    data: document,
  });
}));

// DELETE /api/documents/:id
router.delete('/:id', requireRole(['SUPER_ADMIN', 'FACTORY_ADMIN']), asyncHandler(async (req, res) => {
  await documentService.deleteDocument(req.params.id, req.user!.id);
  
  res.json({
    success: true,
    message: 'Document deleted successfully',
  });
}));

export default router;
