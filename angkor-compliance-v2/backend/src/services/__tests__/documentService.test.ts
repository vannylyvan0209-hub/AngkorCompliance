import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TestDatabase, AuthTestUtils, mockData } from '../../test/test-utils';
import { documentService } from '../documentService';

describe('DocumentService', () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.cleanup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe('createDocument', () => {
    it('should create a new document successfully', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const documentData = mockData.document({
        title: 'Safety Policy',
        type: 'policy',
        content: 'Safety policy content',
        factoryId: factory.id
      });

      const result = await documentService.createDocument(documentData, user.id);

      expect(result).toMatchObject({
        id: expect.any(String),
        title: documentData.title,
        type: documentData.type,
        content: documentData.content,
        factoryId: factory.id,
        createdBy: user.id,
        status: 'draft'
      });
    });

    it('should throw error for non-existent factory', async () => {
      const user = await testDb.createTestUser();

      const documentData = mockData.document({
        factoryId: 'non-existent-factory-id'
      });

      await expect(documentService.createDocument(documentData, user.id)).rejects.toThrow('Factory not found');
    });

    it('should validate required fields', async () => {
      const user = await testDb.createTestUser();

      const invalidData = { title: 'Test Document' };

      await expect(documentService.createDocument(invalidData as any, user.id)).rejects.toThrow();
    });
  });

  describe('getDocuments', () => {
    it('should return documents for factory', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      // Create test documents
      const doc1 = await testDb.getPrisma().document.create({
        data: {
          title: 'Document 1',
          type: 'policy',
          content: 'Content 1',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'active'
        }
      });

      const doc2 = await testDb.getPrisma().document.create({
        data: {
          title: 'Document 2',
          type: 'procedure',
          content: 'Content 2',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'active'
        }
      });

      const result = await documentService.getDocuments(factory.id);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: doc1.id, title: 'Document 1' }),
          expect.objectContaining({ id: doc2.id, title: 'Document 2' })
        ])
      );
    });

    it('should apply type filter correctly', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      await testDb.getPrisma().document.create({
        data: {
          title: 'Policy Document',
          type: 'policy',
          content: 'Policy content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'active'
        }
      });

      await testDb.getPrisma().document.create({
        data: {
          title: 'Procedure Document',
          type: 'procedure',
          content: 'Procedure content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'active'
        }
      });

      const result = await documentService.getDocuments(factory.id, { type: 'policy' });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('policy');
    });

    it('should apply status filter correctly', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      await testDb.getPrisma().document.create({
        data: {
          title: 'Active Document',
          type: 'policy',
          content: 'Content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'active'
        }
      });

      await testDb.getPrisma().document.create({
        data: {
          title: 'Draft Document',
          type: 'policy',
          content: 'Content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'draft'
        }
      });

      const result = await documentService.getDocuments(factory.id, { status: 'active' });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('active');
    });

    it('should apply search filter correctly', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      await testDb.getPrisma().document.create({
        data: {
          title: 'Safety Policy',
          type: 'policy',
          content: 'Safety content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'active'
        }
      });

      await testDb.getPrisma().document.create({
        data: {
          title: 'Quality Procedure',
          type: 'procedure',
          content: 'Quality content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'active'
        }
      });

      const result = await documentService.getDocuments(factory.id, { search: 'Safety' });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Safety Policy');
    });
  });

  describe('getDocumentById', () => {
    it('should return document by id', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const document = await testDb.getPrisma().document.create({
        data: {
          title: 'Test Document',
          type: 'policy',
          content: 'Test content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'active'
        }
      });

      const result = await documentService.getDocumentById(document.id);

      expect(result).toMatchObject({
        id: document.id,
        title: 'Test Document',
        type: 'policy',
        content: 'Test content'
      });
    });

    it('should throw error for non-existent document', async () => {
      await expect(documentService.getDocumentById('non-existent-id')).rejects.toThrow('Document not found');
    });
  });

  describe('updateDocument', () => {
    it('should update document successfully', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const document = await testDb.getPrisma().document.create({
        data: {
          title: 'Original Title',
          type: 'policy',
          content: 'Original content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'draft'
        }
      });

      const updateData = {
        title: 'Updated Title',
        content: 'Updated content'
      };

      const result = await documentService.updateDocument(document.id, updateData, user.id);

      expect(result).toMatchObject({
        id: document.id,
        title: 'Updated Title',
        content: 'Updated content'
      });
      expect(result.updatedAt).not.toBe(document.updatedAt);
    });

    it('should throw error for non-existent document', async () => {
      const user = await testDb.createTestUser();

      await expect(documentService.updateDocument('non-existent-id', { title: 'New Title' }, user.id)).rejects.toThrow('Document not found');
    });

    it('should validate update data', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const document = await testDb.getPrisma().document.create({
        data: {
          title: 'Test Document',
          type: 'policy',
          content: 'Content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'draft'
        }
      });

      await expect(documentService.updateDocument(document.id, { title: '' }, user.id)).rejects.toThrow();
    });
  });

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const document = await testDb.getPrisma().document.create({
        data: {
          title: 'Test Document',
          type: 'policy',
          content: 'Content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'draft'
        }
      });

      await documentService.deleteDocument(document.id, user.id);

      const deletedDocument = await testDb.getPrisma().document.findUnique({
        where: { id: document.id }
      });
      expect(deletedDocument).toBeNull();
    });

    it('should throw error for non-existent document', async () => {
      const user = await testDb.createTestUser();

      await expect(documentService.deleteDocument('non-existent-id', user.id)).rejects.toThrow('Document not found');
    });
  });

  describe('publishDocument', () => {
    it('should publish draft document', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const document = await testDb.getPrisma().document.create({
        data: {
          title: 'Draft Document',
          type: 'policy',
          content: 'Content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'draft'
        }
      });

      const result = await documentService.publishDocument(document.id, user.id);

      expect(result.status).toBe('active');
      expect(result.publishedAt).toBeDefined();
    });

    it('should throw error for non-existent document', async () => {
      const user = await testDb.createTestUser();

      await expect(documentService.publishDocument('non-existent-id', user.id)).rejects.toThrow('Document not found');
    });

    it('should throw error for already published document', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const document = await testDb.getPrisma().document.create({
        data: {
          title: 'Published Document',
          type: 'policy',
          content: 'Content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'active'
        }
      });

      await expect(documentService.publishDocument(document.id, user.id)).rejects.toThrow('Document is already published');
    });
  });

  describe('archiveDocument', () => {
    it('should archive active document', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const document = await testDb.getPrisma().document.create({
        data: {
          title: 'Active Document',
          type: 'policy',
          content: 'Content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'active'
        }
      });

      const result = await documentService.archiveDocument(document.id, user.id);

      expect(result.status).toBe('archived');
      expect(result.archivedAt).toBeDefined();
    });

    it('should throw error for non-existent document', async () => {
      const user = await testDb.createTestUser();

      await expect(documentService.archiveDocument('non-existent-id', user.id)).rejects.toThrow('Document not found');
    });
  });

  describe('getDocumentVersions', () => {
    it('should return document versions', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const document = await testDb.getPrisma().document.create({
        data: {
          title: 'Test Document',
          type: 'policy',
          content: 'Version 1',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'active'
        }
      });

      // Create a new version
      await documentService.updateDocument(document.id, { content: 'Version 2' }, user.id);

      const versions = await documentService.getDocumentVersions(document.id);

      expect(versions).toHaveLength(2);
      expect(versions[0].content).toBe('Version 2');
      expect(versions[1].content).toBe('Version 1');
    });

    it('should throw error for non-existent document', async () => {
      await expect(documentService.getDocumentVersions('non-existent-id')).rejects.toThrow('Document not found');
    });
  });
});
