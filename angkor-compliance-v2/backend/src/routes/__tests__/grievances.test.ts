import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TestDatabase, AuthTestUtils, ApiTestUtils, mockData } from '../../test/test-utils';
import grievanceRoutes from '../grievances';
import { authMiddleware } from '../../middleware/auth';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/grievances', authMiddleware, grievanceRoutes);

describe('Grievance Routes Integration Tests', () => {
  let testDb: TestDatabase;
  let authToken: string;
  let user: any;
  let factory: any;
  let grievance: any;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.cleanup();

    // Create test user and factory
    user = await testDb.createTestUser({ role: 'factory_admin' });
    factory = await testDb.createTestFactory();
    authToken = AuthTestUtils.generateToken(user.id, user.role, factory.id);

    // Create test grievance
    grievance = await testDb.getPrisma().grievance.create({
      data: {
        title: 'Test Grievance',
        description: 'Test description',
        category: 'harassment',
        priority: 'high',
        status: 'open',
        factoryId: factory.id,
        reportedBy: user.id
      }
    });
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe('GET /api/grievances', () => {
    it('should return grievances for authenticated user', async () => {
      const response = await request(app)
        .get('/api/grievances')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('grievances');
      expect(Array.isArray(response.body.grievances)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/grievances')
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });

    it('should apply status filter correctly', async () => {
      await testDb.getPrisma().grievance.create({
        data: {
          title: 'Open Grievance',
          description: 'Description',
          category: 'harassment',
          priority: 'high',
          status: 'open',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      await testDb.getPrisma().grievance.create({
        data: {
          title: 'Closed Grievance',
          description: 'Description',
          category: 'harassment',
          priority: 'high',
          status: 'closed',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      const response = await request(app)
        .get('/api/grievances?status=open')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.grievances).toHaveLength(1);
      expect(response.body.grievances[0].status).toBe('open');
    });

    it('should apply category filter correctly', async () => {
      await testDb.getPrisma().grievance.create({
        data: {
          title: 'Harassment Grievance',
          description: 'Description',
          category: 'harassment',
          priority: 'high',
          status: 'open',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      await testDb.getPrisma().grievance.create({
        data: {
          title: 'Safety Grievance',
          description: 'Description',
          category: 'safety',
          priority: 'high',
          status: 'open',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      const response = await request(app)
        .get('/api/grievances?category=harassment')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.grievances).toHaveLength(1);
      expect(response.body.grievances[0].category).toBe('harassment');
    });

    it('should apply priority filter correctly', async () => {
      await testDb.getPrisma().grievance.create({
        data: {
          title: 'High Priority Grievance',
          description: 'Description',
          category: 'harassment',
          priority: 'high',
          status: 'open',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      await testDb.getPrisma().grievance.create({
        data: {
          title: 'Low Priority Grievance',
          description: 'Description',
          category: 'harassment',
          priority: 'low',
          status: 'open',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      const response = await request(app)
        .get('/api/grievances?priority=high')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.grievances).toHaveLength(1);
      expect(response.body.grievances[0].priority).toBe('high');
    });

    it('should apply pagination correctly', async () => {
      // Create multiple grievances
      for (let i = 1; i <= 5; i++) {
        await testDb.getPrisma().grievance.create({
          data: {
            title: `Grievance ${i}`,
            description: 'Description',
            category: 'harassment',
            priority: 'high',
            status: 'open',
            factoryId: factory.id,
            reportedBy: user.id
          }
        });
      }

      const response = await request(app)
        .get('/api/grievances?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.grievances).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: expect.any(Number)
      });
    });
  });

  describe('GET /api/grievances/:id', () => {
    it('should return specific grievance by id', async () => {
      const response = await request(app)
        .get(`/api/grievances/${grievance.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: grievance.id,
        title: grievance.title,
        description: grievance.description,
        category: grievance.category,
        priority: grievance.priority
      });
    });

    it('should return 404 for non-existent grievance', async () => {
      const response = await request(app)
        .get('/api/grievances/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Grievance not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/grievances/${grievance.id}`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('POST /api/grievances', () => {
    it('should create new grievance with valid data', async () => {
      const grievanceData = mockData.grievance({
        title: 'New Grievance',
        description: 'New description',
        category: 'safety',
        priority: 'medium',
        factoryId: factory.id
      });

      const response = await request(app)
        .post('/api/grievances')
        .set('Authorization', `Bearer ${authToken}`)
        .send(grievanceData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: grievanceData.title,
        description: grievanceData.description,
        category: grievanceData.category,
        priority: grievanceData.priority,
        factoryId: factory.id,
        reportedBy: user.id,
        status: 'open'
      });
    });

    it('should create anonymous grievance', async () => {
      const grievanceData = mockData.grievance({
        title: 'Anonymous Grievance',
        description: 'Anonymous description',
        category: 'safety',
        isAnonymous: true,
        factoryId: factory.id
      });

      const response = await request(app)
        .post('/api/grievances')
        .set('Authorization', `Bearer ${authToken}`)
        .send(grievanceData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: grievanceData.title,
        isAnonymous: true,
        reportedBy: null
      });
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = { title: 'Test Grievance' }; // Missing required fields

      const response = await request(app)
        .post('/api/grievances')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    it('should return 401 without authentication', async () => {
      const grievanceData = mockData.grievance();

      const response = await request(app)
        .post('/api/grievances')
        .send(grievanceData)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('PUT /api/grievances/:id', () => {
    it('should update grievance with valid data', async () => {
      const updateData = {
        title: 'Updated Grievance Title',
        description: 'Updated description',
        priority: 'medium'
      };

      const response = await request(app)
        .put(`/api/grievances/${grievance.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: grievance.id,
        title: updateData.title,
        description: updateData.description,
        priority: updateData.priority
      });
    });

    it('should return 404 for non-existent grievance', async () => {
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put('/api/grievances/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toContain('Grievance not found');
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = { title: '' }; // Empty title

      const response = await request(app)
        .put(`/api/grievances/${grievance.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    it('should return 401 without authentication', async () => {
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put(`/api/grievances/${grievance.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('POST /api/grievances/:id/assign', () => {
    it('should assign grievance to committee member', async () => {
      const assignee = await testDb.createTestUser({ 
        role: 'grievance_committee',
        factoryId: factory.id 
      });

      const response = await request(app)
        .post(`/api/grievances/${grievance.id}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ assigneeId: assignee.id })
        .expect(200);

      expect(response.body).toMatchObject({
        id: grievance.id,
        assignedTo: assignee.id,
        status: 'assigned'
      });
    });

    it('should return 404 for non-existent grievance', async () => {
      const assignee = await testDb.createTestUser({ 
        role: 'grievance_committee',
        factoryId: factory.id 
      });

      const response = await request(app)
        .post('/api/grievances/non-existent-id/assign')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ assigneeId: assignee.id })
        .expect(404);

      expect(response.body.error).toContain('Grievance not found');
    });

    it('should return 400 for non-existent assignee', async () => {
      const response = await request(app)
        .post(`/api/grievances/${grievance.id}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ assigneeId: 'non-existent-user' })
        .expect(400);

      expect(response.body.error).toContain('Assignee not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/grievances/${grievance.id}/assign`)
        .send({ assigneeId: 'user-id' })
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('POST /api/grievances/:id/comments', () => {
    it('should add comment to grievance', async () => {
      const commentData = {
        content: 'This is a comment',
        isInternal: false
      };

      const response = await request(app)
        .post(`/api/grievances/${grievance.id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body).toMatchObject({
        content: commentData.content,
        isInternal: commentData.isInternal,
        createdBy: user.id,
        grievanceId: grievance.id
      });
    });

    it('should return 404 for non-existent grievance', async () => {
      const commentData = {
        content: 'This is a comment',
        isInternal: false
      };

      const response = await request(app)
        .post('/api/grievances/non-existent-id/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(commentData)
        .expect(404);

      expect(response.body.error).toContain('Grievance not found');
    });

    it('should return 400 for invalid comment data', async () => {
      const invalidData = { content: '' }; // Empty content

      const response = await request(app)
        .post(`/api/grievances/${grievance.id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    it('should return 401 without authentication', async () => {
      const commentData = {
        content: 'This is a comment',
        isInternal: false
      };

      const response = await request(app)
        .post(`/api/grievances/${grievance.id}/comments`)
        .send(commentData)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('POST /api/grievances/:id/close', () => {
    it('should close grievance with resolution', async () => {
      const resolutionData = {
        resolution: 'Issue has been resolved',
        resolutionType: 'resolved'
      };

      const response = await request(app)
        .post(`/api/grievances/${grievance.id}/close`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(resolutionData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: grievance.id,
        status: 'closed',
        resolution: resolutionData.resolution,
        resolutionType: resolutionData.resolutionType,
        closedAt: expect.any(String)
      });
    });

    it('should return 404 for non-existent grievance', async () => {
      const resolutionData = {
        resolution: 'Issue resolved',
        resolutionType: 'resolved'
      };

      const response = await request(app)
        .post('/api/grievances/non-existent-id/close')
        .set('Authorization', `Bearer ${authToken}`)
        .send(resolutionData)
        .expect(404);

      expect(response.body.error).toContain('Grievance not found');
    });

    it('should return 400 for invalid resolution data', async () => {
      const invalidData = { resolution: '' }; // Empty resolution

      const response = await request(app)
        .post(`/api/grievances/${grievance.id}/close`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    it('should return 401 without authentication', async () => {
      const resolutionData = {
        resolution: 'Issue resolved',
        resolutionType: 'resolved'
      };

      const response = await request(app)
        .post(`/api/grievances/${grievance.id}/close`)
        .send(resolutionData)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('GET /api/grievances/:id/comments', () => {
    it('should return grievance comments', async () => {
      // Add a comment first
      await testDb.getPrisma().grievanceComment.create({
        data: {
          content: 'Test comment',
          isInternal: false,
          grievanceId: grievance.id,
          createdBy: user.id
        }
      });

      const response = await request(app)
        .get(`/api/grievances/${grievance.id}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('comments');
      expect(Array.isArray(response.body.comments)).toBe(true);
      expect(response.body.comments).toHaveLength(1);
      expect(response.body.comments[0].content).toBe('Test comment');
    });

    it('should return 404 for non-existent grievance', async () => {
      const response = await request(app)
        .get('/api/grievances/non-existent-id/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Grievance not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/grievances/${grievance.id}/comments`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('GET /api/grievances/stats', () => {
    it('should return grievance statistics', async () => {
      // Create grievances with different statuses
      await testDb.getPrisma().grievance.create({
        data: {
          title: 'Open Grievance',
          description: 'Description',
          category: 'harassment',
          priority: 'high',
          status: 'open',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      await testDb.getPrisma().grievance.create({
        data: {
          title: 'Closed Grievance',
          description: 'Description',
          category: 'harassment',
          priority: 'high',
          status: 'closed',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      const response = await request(app)
        .get('/api/grievances/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        total: expect.any(Number),
        open: expect.any(Number),
        closed: expect.any(Number),
        assigned: expect.any(Number),
        inProgress: expect.any(Number),
        byCategory: expect.any(Object),
        byPriority: expect.any(Object)
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/grievances/stats')
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });
});
