import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TestDatabase, AuthTestUtils, ApiTestUtils, mockData } from '../../test/test-utils';
import auditRoutes from '../audits';
import { authMiddleware } from '../../middleware/auth';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/audits', authMiddleware, auditRoutes);

describe('Audit Routes Integration Tests', () => {
  let testDb: TestDatabase;
  let authToken: string;
  let user: any;
  let factory: any;
  let audit: any;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.cleanup();

    // Create test user and factory
    user = await testDb.createTestUser({ role: 'factory_admin' });
    factory = await testDb.createTestFactory();
    authToken = AuthTestUtils.generateToken(user.id, user.role, factory.id);

    // Create test audit
    audit = await testDb.getPrisma().audit.create({
      data: {
        title: 'Test Audit',
        type: 'internal',
        standard: 'SMETA',
        scheduledDate: new Date('2024-06-01'),
        status: 'scheduled',
        factoryId: factory.id,
        createdBy: user.id
      }
    });
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe('GET /api/audits', () => {
    it('should return audits for authenticated user', async () => {
      const response = await request(app)
        .get('/api/audits')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('audits');
      expect(Array.isArray(response.body.audits)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/audits')
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });

    it('should apply status filter correctly', async () => {
      await testDb.getPrisma().audit.create({
        data: {
          title: 'Scheduled Audit',
          type: 'internal',
          standard: 'SMETA',
          scheduledDate: new Date('2024-06-01'),
          status: 'scheduled',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      await testDb.getPrisma().audit.create({
        data: {
          title: 'Completed Audit',
          type: 'internal',
          standard: 'SMETA',
          scheduledDate: new Date('2024-05-01'),
          status: 'completed',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      const response = await request(app)
        .get('/api/audits?status=scheduled')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.audits).toHaveLength(1);
      expect(response.body.audits[0].status).toBe('scheduled');
    });

    it('should apply type filter correctly', async () => {
      await testDb.getPrisma().audit.create({
        data: {
          title: 'Internal Audit',
          type: 'internal',
          standard: 'SMETA',
          scheduledDate: new Date('2024-06-01'),
          status: 'scheduled',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      await testDb.getPrisma().audit.create({
        data: {
          title: 'External Audit',
          type: 'external',
          standard: 'SMETA',
          scheduledDate: new Date('2024-06-01'),
          status: 'scheduled',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      const response = await request(app)
        .get('/api/audits?type=internal')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.audits).toHaveLength(1);
      expect(response.body.audits[0].type).toBe('internal');
    });

    it('should apply date range filter correctly', async () => {
      await testDb.getPrisma().audit.create({
        data: {
          title: 'June Audit',
          type: 'internal',
          standard: 'SMETA',
          scheduledDate: new Date('2024-06-15'),
          status: 'scheduled',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      await testDb.getPrisma().audit.create({
        data: {
          title: 'August Audit',
          type: 'internal',
          standard: 'SMETA',
          scheduledDate: new Date('2024-08-15'),
          status: 'scheduled',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      const response = await request(app)
        .get('/api/audits?startDate=2024-06-01&endDate=2024-07-01')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.audits).toHaveLength(1);
      expect(response.body.audits[0].title).toBe('June Audit');
    });

    it('should apply pagination correctly', async () => {
      // Create multiple audits
      for (let i = 1; i <= 5; i++) {
        await testDb.getPrisma().audit.create({
          data: {
            title: `Audit ${i}`,
            type: 'internal',
            standard: 'SMETA',
            scheduledDate: new Date('2024-06-01'),
            status: 'scheduled',
            factoryId: factory.id,
            createdBy: user.id
          }
        });
      }

      const response = await request(app)
        .get('/api/audits?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.audits).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: expect.any(Number)
      });
    });
  });

  describe('GET /api/audits/:id', () => {
    it('should return specific audit by id', async () => {
      const response = await request(app)
        .get(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: audit.id,
        title: audit.title,
        type: audit.type,
        standard: audit.standard
      });
    });

    it('should return 404 for non-existent audit', async () => {
      const response = await request(app)
        .get('/api/audits/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Audit not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/audits/${audit.id}`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('POST /api/audits', () => {
    it('should create new audit with valid data', async () => {
      const auditData = mockData.audit({
        title: 'New Audit',
        type: 'external',
        standard: 'SA8000',
        scheduledDate: new Date('2024-07-01'),
        factoryId: factory.id
      });

      const response = await request(app)
        .post('/api/audits')
        .set('Authorization', `Bearer ${authToken}`)
        .send(auditData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: auditData.title,
        type: auditData.type,
        standard: auditData.standard,
        scheduledDate: auditData.scheduledDate.toISOString(),
        factoryId: factory.id,
        createdBy: user.id,
        status: 'scheduled'
      });
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = { title: 'Test Audit' }; // Missing required fields

      const response = await request(app)
        .post('/api/audits')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    it('should return 401 without authentication', async () => {
      const auditData = mockData.audit();

      const response = await request(app)
        .post('/api/audits')
        .send(auditData)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });

    it('should require appropriate role', async () => {
      const hrUser = await testDb.createTestUser({ role: 'hr_staff' });
      const hrToken = AuthTestUtils.generateToken(hrUser.id, hrUser.role, factory.id);

      const auditData = mockData.audit();

      const response = await request(app)
        .post('/api/audits')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(auditData)
        .expect(201); // HR staff can create audits
    });
  });

  describe('PUT /api/audits/:id', () => {
    it('should update audit with valid data', async () => {
      const updateData = {
        title: 'Updated Audit Title',
        scheduledDate: new Date('2024-07-01')
      };

      const response = await request(app)
        .put(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: audit.id,
        title: updateData.title,
        scheduledDate: updateData.scheduledDate.toISOString()
      });
    });

    it('should return 404 for non-existent audit', async () => {
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put('/api/audits/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toContain('Audit not found');
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = { title: '' }; // Empty title

      const response = await request(app)
        .put(`/api/audits/${audit.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    it('should return 401 without authentication', async () => {
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put(`/api/audits/${audit.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('POST /api/audits/:id/start', () => {
    it('should start scheduled audit', async () => {
      const response = await request(app)
        .post(`/api/audits/${audit.id}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: audit.id,
        status: 'in_progress',
        startedAt: expect.any(String)
      });
    });

    it('should return 404 for non-existent audit', async () => {
      const response = await request(app)
        .post('/api/audits/non-existent-id/start')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Audit not found');
    });

    it('should return 400 for already started audit', async () => {
      // Create in-progress audit
      const inProgressAudit = await testDb.getPrisma().audit.create({
        data: {
          title: 'In Progress Audit',
          type: 'internal',
          standard: 'SMETA',
          scheduledDate: new Date('2024-06-01'),
          status: 'in_progress',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      const response = await request(app)
        .post(`/api/audits/${inProgressAudit.id}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error).toContain('already in progress');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/audits/${audit.id}/start`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('POST /api/audits/:id/complete', () => {
    it('should complete audit with findings', async () => {
      // Start audit first
      await request(app)
        .post(`/api/audits/${audit.id}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const completionData = {
        findings: 'Some findings were identified',
        recommendations: 'Implement corrective actions',
        overallScore: 85
      };

      const response = await request(app)
        .post(`/api/audits/${audit.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(completionData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: audit.id,
        status: 'completed',
        findings: completionData.findings,
        recommendations: completionData.recommendations,
        overallScore: completionData.overallScore,
        completedAt: expect.any(String)
      });
    });

    it('should return 404 for non-existent audit', async () => {
      const completionData = {
        findings: 'Findings',
        recommendations: 'Recommendations',
        overallScore: 85
      };

      const response = await request(app)
        .post('/api/audits/non-existent-id/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send(completionData)
        .expect(404);

      expect(response.body.error).toContain('Audit not found');
    });

    it('should return 400 for audit not in progress', async () => {
      const completionData = {
        findings: 'Findings',
        recommendations: 'Recommendations',
        overallScore: 85
      };

      const response = await request(app)
        .post(`/api/audits/${audit.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(completionData)
        .expect(400);

      expect(response.body.error).toContain('not in progress');
    });

    it('should return 400 for invalid completion data', async () => {
      // Start audit first
      await request(app)
        .post(`/api/audits/${audit.id}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const invalidData = { findings: '' }; // Empty findings

      const response = await request(app)
        .post(`/api/audits/${audit.id}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    it('should return 401 without authentication', async () => {
      const completionData = {
        findings: 'Findings',
        recommendations: 'Recommendations',
        overallScore: 85
      };

      const response = await request(app)
        .post(`/api/audits/${audit.id}/complete`)
        .send(completionData)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('POST /api/audits/:id/findings', () => {
    it('should add finding to audit', async () => {
      // Start audit first
      await request(app)
        .post(`/api/audits/${audit.id}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const findingData = {
        title: 'Safety Issue',
        description: 'Safety equipment not properly maintained',
        severity: 'high',
        category: 'safety',
        evidence: 'Photos and documentation'
      };

      const response = await request(app)
        .post(`/api/audits/${audit.id}/findings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(findingData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: findingData.title,
        description: findingData.description,
        severity: findingData.severity,
        category: findingData.category,
        evidence: findingData.evidence,
        auditId: audit.id,
        createdBy: user.id
      });
    });

    it('should return 404 for non-existent audit', async () => {
      const findingData = {
        title: 'Safety Issue',
        description: 'Description',
        severity: 'high',
        category: 'safety'
      };

      const response = await request(app)
        .post('/api/audits/non-existent-id/findings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(findingData)
        .expect(404);

      expect(response.body.error).toContain('Audit not found');
    });

    it('should return 400 for invalid finding data', async () => {
      // Start audit first
      await request(app)
        .post(`/api/audits/${audit.id}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const invalidData = { title: '' }; // Empty title

      const response = await request(app)
        .post(`/api/audits/${audit.id}/findings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    it('should return 401 without authentication', async () => {
      const findingData = {
        title: 'Safety Issue',
        description: 'Description',
        severity: 'high',
        category: 'safety'
      };

      const response = await request(app)
        .post(`/api/audits/${audit.id}/findings`)
        .send(findingData)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('GET /api/audits/:id/findings', () => {
    it('should return audit findings', async () => {
      // Start audit and add finding
      await request(app)
        .post(`/api/audits/${audit.id}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await testDb.getPrisma().auditFinding.create({
        data: {
          title: 'Test Finding',
          description: 'Test description',
          severity: 'high',
          category: 'safety',
          auditId: audit.id,
          createdBy: user.id
        }
      });

      const response = await request(app)
        .get(`/api/audits/${audit.id}/findings`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('findings');
      expect(Array.isArray(response.body.findings)).toBe(true);
      expect(response.body.findings).toHaveLength(1);
      expect(response.body.findings[0].title).toBe('Test Finding');
    });

    it('should return 404 for non-existent audit', async () => {
      const response = await request(app)
        .get('/api/audits/non-existent-id/findings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Audit not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/audits/${audit.id}/findings`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('GET /api/audits/stats', () => {
    it('should return audit statistics', async () => {
      // Create audits with different statuses
      await testDb.getPrisma().audit.create({
        data: {
          title: 'Scheduled Audit',
          type: 'internal',
          standard: 'SMETA',
          scheduledDate: new Date('2024-06-01'),
          status: 'scheduled',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      await testDb.getPrisma().audit.create({
        data: {
          title: 'Completed Audit',
          type: 'internal',
          standard: 'SMETA',
          scheduledDate: new Date('2024-05-01'),
          status: 'completed',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      const response = await request(app)
        .get('/api/audits/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        total: expect.any(Number),
        scheduled: expect.any(Number),
        inProgress: expect.any(Number),
        completed: expect.any(Number),
        cancelled: expect.any(Number),
        byType: expect.any(Object),
        byStandard: expect.any(Object)
      });
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/audits/stats')
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });
});
