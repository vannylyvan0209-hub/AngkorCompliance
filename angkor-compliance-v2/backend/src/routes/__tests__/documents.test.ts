import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TestDatabase, AuthTestUtils, ApiTestUtils, mockData } from '../../test/test-utils';
import documentRoutes from '../documents';
import { authMiddleware } from '../../middleware/auth';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/documents', authMiddleware, documentRoutes);

describe('Document Routes Integration Tests', () => {
  let testDb: TestDatabase;
  let authToken: string;
  let user: any;
  let factory: any;
  let document: any;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.cleanup();

    // Create test user and factory
    user = await testDb.createTestUser({ role: 'factory_admin' });
    factory = await testDb.createTestFactory();
    authToken = AuthTestUtils.generateToken(user.id, user.role, factory.id);

    // Create test document
    document = await testDb.getPrisma().document.create({
      data: {
        title: 'Test Document',
        type: 'policy',
        content: 'Test content',
        factoryId: factory.id,
        createdBy: user.id,
        status: 'draft'
      }
    });
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe('GET /api/documents', () => {
    it('should return documents for authenticated user', async () => {
      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('documents');
      expect(Array.isArray(response.body.documents)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/documents')
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });

    it('should apply type filter correctly', async () => {
      // Create documents with different types
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

      const response = await request(app)
        .get('/api/documents?type=policy')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.documents).toHaveLength(1);
      expect(response.body.documents[0].type).toBe('policy');
    });

    it('should apply status filter correctly', async () => {
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

      const response = await request(app)
        .get('/api/documents?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.documents).toHaveLength(1);
      expect(response.body.documents[0].status).toBe('active');
    });

    it('should apply search filter correctly', async () => {
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

      const response = await request(app)
        .get('/api/documents?search=Safety')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.documents).toHaveLength(1);
      expect(response.body.documents[0].title).toBe('Safety Policy');
    });

    it('should apply pagination correctly', async () => {
      // Create multiple documents
      for (let i = 1; i <= 5; i++) {
        await testDb.getPrisma().document.create({
          data: {
            title: `Document ${i}`,
            type: 'policy',
            content: 'Content',
            factoryId: factory.id,
            createdBy: user.id,
            status: 'active'
          }
        });
      }

      const response = await request(app)
        .get('/api/documents?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.documents).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: expect.any(Number)
      });
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should return specific document by id', async () => {
      const response = await request(app)
        .get(`/api/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: document.id,
        title: document.title,
        type: document.type,
        content: document.content
      });
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .get('/api/documents/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Document not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/documents/${document.id}`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('POST /api/documents', () => {
    it('should create new document with valid data', async () => {
      const documentData = mockData.document({
        title: 'New Document',
        type: 'policy',
        content: 'New content',
        factoryId: factory.id
      });

      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(documentData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: documentData.title,
        type: documentData.type,
        content: documentData.content,
        factoryId: factory.id,
        createdBy: user.id,
        status: 'draft'
      });
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = { title: 'Test Document' }; // Missing required fields

      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    it('should return 401 without authentication', async () => {
      const documentData = mockData.document();

      const response = await request(app)
        .post('/api/documents')
        .send(documentData)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });

    it('should require appropriate role', async () => {
      const hrUser = await testDb.createTestUser({ role: 'hr_staff' });
      const hrToken = AuthTestUtils.generateToken(hrUser.id, hrUser.role, factory.id);

      const documentData = mockData.document();

      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(documentData)
        .expect(201); // HR staff can create documents
    });
  });

  describe('PUT /api/documents/:id', () => {
    it('should update document with valid data', async () => {
      const updateData = {
        title: 'Updated Document Title',
        content: 'Updated content'
      };

      const response = await request(app)
        .put(`/api/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: document.id,
        title: updateData.title,
        content: updateData.content
      });
    });

    it('should return 404 for non-existent document', async () => {
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put('/api/documents/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toContain('Document not found');
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = { title: '' }; // Empty title

      const response = await request(app)
        .put(`/api/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    it('should return 401 without authentication', async () => {
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put(`/api/documents/${document.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('DELETE /api/documents/:id', () => {
    it('should delete document successfully', async () => {
      const response = await request(app)
        .delete(`/api/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('deleted');

      // Verify document is deleted
      const getResponse = await request(app)
        .get(`/api/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .delete('/api/documents/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Document not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/documents/${document.id}`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('POST /api/documents/:id/publish', () => {
    it('should publish draft document', async () => {
      const response = await request(app)
        .post(`/api/documents/${document.id}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('active');
      expect(response.body.publishedAt).toBeDefined();
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .post('/api/documents/non-existent-id/publish')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Document not found');
    });

    it('should return 400 for already published document', async () => {
      // Create published document
      const publishedDoc = await testDb.getPrisma().document.create({
        data: {
          title: 'Published Document',
          type: 'policy',
          content: 'Content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'active'
        }
      });

      const response = await request(app)
        .post(`/api/documents/${publishedDoc.id}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error).toContain('already published');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/documents/${document.id}/publish`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('POST /api/documents/:id/archive', () => {
    it('should archive active document', async () => {
      // Create active document
      const activeDoc = await testDb.getPrisma().document.create({
        data: {
          title: 'Active Document',
          type: 'policy',
          content: 'Content',
          factoryId: factory.id,
          createdBy: user.id,
          status: 'active'
        }
      });

      const response = await request(app)
        .post(`/api/documents/${activeDoc.id}/archive`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('archived');
      expect(response.body.archivedAt).toBeDefined();
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .post('/api/documents/non-existent-id/archive')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Document not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/documents/${document.id}/archive`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('GET /api/documents/:id/versions', () => {
    it('should return document versions', async () => {
      // Update document to create version
      await request(app)
        .put(`/api/documents/${document.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Updated content' })
        .expect(200);

      const response = await request(app)
        .get(`/api/documents/${document.id}/versions`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('versions');
      expect(Array.isArray(response.body.versions)).toBe(true);
      expect(response.body.versions.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .get('/api/documents/non-existent-id/versions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Document not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/documents/${document.id}/versions`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });
});
