import { prisma } from '../index';
import { Document, DocumentType } from '@prisma/client';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';

export interface CreateDocumentData {
  title: string;
  type: DocumentType;
  category: string;
  content?: string;
  metadata?: Record<string, any>;
  factoryId: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface UpdateDocumentData {
  title?: string;
  type?: DocumentType;
  category?: string;
  content?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
}

export interface DocumentFilters {
  search?: string;
  type?: DocumentType;
  category?: string;
  factoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedDocumentResponse {
  data: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class DocumentService {
  // Create a new document
  async createDocument(data: CreateDocumentData, userId: string): Promise<Document> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Validate factory access
    if (user.role !== 'SUPER_ADMIN') {
      if (user.role === 'FACTORY_ADMIN' && user.factoryId !== data.factoryId) {
        throw createForbiddenError('You can only create documents for your assigned factory');
      }
    }

    // Validate factory exists
    const factory = await prisma.factory.findUnique({
      where: { id: data.factoryId },
    });

    if (!factory) {
      throw createNotFoundError('Factory');
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        ...data,
        uploadedById: userId,
        tenantId: user.tenantId,
        version: 1,
        isActive: true,
      },
      include: {
        uploadedBy: {
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
    await this.logActivity('document:created', document.id, userId, {
      documentTitle: document.title,
      documentType: document.type,
      factoryName: factory.name,
    });

    return document;
  }

  // Get all documents with filtering and pagination
  async getDocuments(
    filters: DocumentFilters,
    userId: string
  ): Promise<PaginatedDocumentResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const {
      search,
      type,
      category,
      factoryId,
      isActive,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
    };

    // Super admin can see all documents, others only see their tenant's documents
    if (user.role !== 'SUPER_ADMIN') {
      // Factory admin can only see documents from their factory
      if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
        where.factoryId = user.factoryId;
      }
    }

    if (factoryId) {
      where.factoryId = factoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await prisma.document.count({ where });

    // Get documents
    const documents = await prisma.document.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        uploadedBy: {
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
        _count: {
          select: {
            evidence: true,
            trainingMaterials: true,
            permitDocuments: true,
          },
        },
      },
    });

    return {
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get document by ID
  async getDocumentById(documentId: string, userId: string): Promise<Document> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Build where clause based on user role
    const where: any = {
      id: documentId,
      tenantId: user.tenantId,
    };

    if (user.role !== 'SUPER_ADMIN') {
      if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
        where.factoryId = user.factoryId;
      }
    }

    const document = await prisma.document.findFirst({
      where,
      include: {
        uploadedBy: {
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
        evidence: {
          include: {
            control: {
              include: {
                requirement: {
                  include: {
                    standard: true,
                  },
                },
              },
            },
          },
        },
        trainingMaterials: {
          include: {
            training: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
        permitDocuments: {
          include: {
            permit: {
              select: {
                id: true,
                type: true,
                number: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      throw createNotFoundError('Document');
    }

    return document;
  }

  // Update document
  async updateDocument(
    documentId: string,
    data: UpdateDocumentData,
    userId: string
  ): Promise<Document> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check if user has permission to update this document
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!existingDocument) {
      throw createNotFoundError('Document');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== existingDocument.tenantId) {
        throw createForbiddenError('You can only update documents in your tenant');
      }
      if (user.role === 'FACTORY_ADMIN' && user.factoryId !== existingDocument.factoryId) {
        throw createForbiddenError('You can only update documents in your assigned factory');
      }
    }

    // Update document
    const document = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...data,
        version: existingDocument.version + 1,
      },
      include: {
        uploadedBy: {
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
    await this.logActivity('document:updated', document.id, userId, {
      documentTitle: document.title,
      changes: data,
    });

    return document;
  }

  // Delete document (soft delete by setting isActive to false)
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw createNotFoundError('Document');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== document.tenantId) {
        throw createForbiddenError('You can only delete documents in your tenant');
      }
      if (user.role === 'FACTORY_ADMIN' && user.factoryId !== document.factoryId) {
        throw createForbiddenError('You can only delete documents in your assigned factory');
      }
    }

    // Soft delete by setting isActive to false
    await prisma.document.update({
      where: { id: documentId },
      data: { isActive: false },
    });

    // Log activity
    await this.logActivity('document:deleted', document.id, userId, {
      documentTitle: document.title,
      documentType: document.type,
    });
  }

  // Get document statistics
  async getDocumentStats(factoryId?: string, userId?: string): Promise<any> {
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
      
      if (user.role !== 'SUPER_ADMIN') {
        if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
          where.factoryId = user.factoryId;
        }
      }
    }

    if (factoryId) {
      where.factoryId = factoryId;
    }

    // Get statistics
    const [
      totalDocuments,
      activeDocuments,
      documentsByType,
      documentsByCategory,
      recentDocuments,
    ] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.count({ where: { ...where, isActive: true } }),
      prisma.document.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      prisma.document.groupBy({
        by: ['category'],
        where,
        _count: { category: true },
      }),
      prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          uploadedBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
      }),
    ]);

    return {
      stats: {
        total: totalDocuments,
        active: activeDocuments,
        inactive: totalDocuments - activeDocuments,
      },
      byType: documentsByType.map(item => ({
        type: item.type,
        count: item._count.type,
      })),
      byCategory: documentsByCategory.map(item => ({
        category: item.category,
        count: item._count.category,
      })),
      recent: recentDocuments,
    };
  }

  // Search documents
  async searchDocuments(
    query: string,
    filters: Omit<DocumentFilters, 'search'>,
    userId: string
  ): Promise<PaginatedDocumentResponse> {
    return this.getDocuments({ ...filters, search: query }, userId);
  }

  // Get document categories
  async getDocumentCategories(factoryId?: string, userId?: string): Promise<string[]> {
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
      
      if (user.role !== 'SUPER_ADMIN') {
        if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
          where.factoryId = user.factoryId;
        }
      }
    }

    if (factoryId) {
      where.factoryId = factoryId;
    }

    const categories = await prisma.document.findMany({
      where,
      select: { category: true },
      distinct: ['category'],
    });

    return categories.map(item => item.category);
  }

  // Get document types
  async getDocumentTypes(): Promise<DocumentType[]> {
    return Object.values(DocumentType);
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
          type: 'DOCUMENT',
          title: `Document ${action}`,
          description: `Document ${action} by user`,
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

export const documentService = new DocumentService();
