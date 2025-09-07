import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TestDatabase, AuthTestUtils, ApiTestUtils, mockData } from '../../test/test-utils';
import factoryRoutes from '../factories';
import { authMiddleware } from '../../middleware/auth';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/factories', authMiddleware, factoryRoutes);

describe('Factory Routes Integration Tests', () => {
  let testDb: TestDatabase;
  let authToken: string;
  let user: any;
  let factory: any;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.cleanup();

    // Create test user and factory
    user = await testDb.createTestUser({ role: 'factory_admin' });
    factory = await testDb.createTestFactory();
    authToken = AuthTestUtils.generateToken(user.id, user.role, factory.id);
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe('GET /api/factories', () => {
    it('should return factories for authenticated user', async () => {
      const response = await request(app)
        .get('/api/factories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('factories');
      expect(Array.isArray(response.body.factories)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/factories')
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });

    it('should apply pagination correctly', async () => {
      // Create multiple factories
      for (let i = 1; i <= 5; i++) {
        await testDb.createTestFactory({ name: `Factory ${i}` });
      }

      const response = await request(app)
        .get('/api/factories?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.factories).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: expect.any(Number)
      });
    });

    it('should apply search filter correctly', async () => {
      await testDb.createTestFactory({ name: 'Textile Factory' });
      await testDb.createTestFactory({ name: 'Electronics Factory' });

      const response = await request(app)
        .get('/api/factories?search=Textile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.factories).toHaveLength(1);
      expect(response.body.factories[0].name).toBe('Textile Factory');
    });

    it('should respect role-based access control', async () => {
      // Create user with limited access
      const limitedUser = await testDb.createTestUser({ 
        role: 'hr_staff',
        factoryId: factory.id 
      });
      const limitedToken = AuthTestUtils.generateToken(limitedUser.id, limitedUser.role, factory.id);

      const response = await request(app)
        .get('/api/factories')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(200);

      // HR staff should only see their assigned factory
      expect(response.body.factories).toHaveLength(1);
      expect(response.body.factories[0].id).toBe(factory.id);
    });
  });

  describe('GET /api/factories/:id', () => {
    it('should return specific factory by id', async () => {
      const response = await request(app)
        .get(`/api/factories/${factory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: factory.id,
        name: factory.name,
        address: factory.address,
        city: factory.city,
        country: factory.country
      });
    });

    it('should return 404 for non-existent factory', async () => {
      const response = await request(app)
        .get('/api/factories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Factory not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/factories/${factory.id}`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });

    it('should respect access control for factory admin', async () => {
      const otherFactory = await testDb.createTestFactory({ name: 'Other Factory' });
      const factoryAdmin = await testDb.createTestUser({ 
        role: 'factory_admin',
        factoryId: factory.id 
      });
      const factoryAdminToken = AuthTestUtils.generateToken(factoryAdmin.id, factoryAdmin.role, factory.id);

      // Should be able to access assigned factory
      const response1 = await request(app)
        .get(`/api/factories/${factory.id}`)
        .set('Authorization', `Bearer ${factoryAdminToken}`)
        .expect(200);

      expect(response1.body.id).toBe(factory.id);

      // Should not be able to access other factory
      const response2 = await request(app)
        .get(`/api/factories/${otherFactory.id}`)
        .set('Authorization', `Bearer ${factoryAdminToken}`)
        .expect(403);

      expect(response2.body.error).toContain('Access denied');
    });
  });

  describe('POST /api/factories', () => {
    it('should create new factory with valid data', async () => {
      const factoryData = mockData.factory({
        name: 'New Factory',
        address: '123 New Street',
        city: 'Phnom Penh',
        country: 'Cambodia'
      });

      const response = await request(app)
        .post('/api/factories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(factoryData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: factoryData.name,
        address: factoryData.address,
        city: factoryData.city,
        country: factoryData.country,
        isActive: true
      });
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = { name: 'Test Factory' }; // Missing required fields

      const response = await request(app)
        .post('/api/factories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    it('should return 409 for duplicate factory name', async () => {
      const factoryData = mockData.factory({ name: factory.name });

      const response = await request(app)
        .post('/api/factories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(factoryData)
        .expect(409);

      expect(response.body.error).toContain('already exists');
    });

    it('should return 401 without authentication', async () => {
      const factoryData = mockData.factory();

      const response = await request(app)
        .post('/api/factories')
        .send(factoryData)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });

    it('should require super_admin or factory_admin role', async () => {
      const hrUser = await testDb.createTestUser({ role: 'hr_staff' });
      const hrToken = AuthTestUtils.generateToken(hrUser.id, hrUser.role);

      const factoryData = mockData.factory();

      const response = await request(app)
        .post('/api/factories')
        .set('Authorization', `Bearer ${hrToken}`)
        .send(factoryData)
        .expect(403);

      expect(response.body.error).toContain('forbidden');
    });
  });

  describe('PUT /api/factories/:id', () => {
    it('should update factory with valid data', async () => {
      const updateData = {
        name: 'Updated Factory Name',
        address: 'Updated Address'
      };

      const response = await request(app)
        .put(`/api/factories/${factory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: factory.id,
        name: updateData.name,
        address: updateData.address
      });
    });

    it('should return 404 for non-existent factory', async () => {
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put('/api/factories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toContain('Factory not found');
    });

    it('should return 400 for invalid update data', async () => {
      const invalidData = { name: '' }; // Empty name

      const response = await request(app)
        .put(`/api/factories/${factory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toContain('validation');
    });

    it('should return 401 without authentication', async () => {
      const updateData = { name: 'Updated Name' };

      const response = await request(app)
        .put(`/api/factories/${factory.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });

    it('should respect access control for factory admin', async () => {
      const otherFactory = await testDb.createTestFactory({ name: 'Other Factory' });
      const factoryAdmin = await testDb.createTestUser({ 
        role: 'factory_admin',
        factoryId: factory.id 
      });
      const factoryAdminToken = AuthTestUtils.generateToken(factoryAdmin.id, factoryAdmin.role, factory.id);

      const updateData = { name: 'Updated Name' };

      // Should be able to update assigned factory
      const response1 = await request(app)
        .put(`/api/factories/${factory.id}`)
        .set('Authorization', `Bearer ${factoryAdminToken}`)
        .send(updateData)
        .expect(200);

      expect(response1.body.name).toBe(updateData.name);

      // Should not be able to update other factory
      const response2 = await request(app)
        .put(`/api/factories/${otherFactory.id}`)
        .set('Authorization', `Bearer ${factoryAdminToken}`)
        .send(updateData)
        .expect(403);

      expect(response2.body.error).toContain('Access denied');
    });
  });

  describe('DELETE /api/factories/:id', () => {
    it('should delete factory successfully', async () => {
      const response = await request(app)
        .delete(`/api/factories/${factory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toContain('deleted');

      // Verify factory is deleted
      const getResponse = await request(app)
        .get(`/api/factories/${factory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent factory', async () => {
      const response = await request(app)
        .delete('/api/factories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Factory not found');
    });

    it('should return 400 for factory with active users', async () => {
      // Create user associated with factory
      await testDb.createTestUser({ factoryId: factory.id });

      const response = await request(app)
        .delete(`/api/factories/${factory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error).toContain('active users');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/factories/${factory.id}`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });

    it('should require super_admin role for deletion', async () => {
      const factoryAdmin = await testDb.createTestUser({ 
        role: 'factory_admin',
        factoryId: factory.id 
      });
      const factoryAdminToken = AuthTestUtils.generateToken(factoryAdmin.id, factoryAdmin.role, factory.id);

      const response = await request(app)
        .delete(`/api/factories/${factory.id}`)
        .set('Authorization', `Bearer ${factoryAdminToken}`)
        .expect(403);

      expect(response.body.error).toContain('forbidden');
    });
  });

  describe('GET /api/factories/:id/stats', () => {
    it('should return factory statistics', async () => {
      // Create some test data
      await testDb.createTestUser({ factoryId: factory.id });

      const response = await request(app)
        .get(`/api/factories/${factory.id}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        totalUsers: expect.any(Number),
        activeUsers: expect.any(Number),
        totalDocuments: expect.any(Number),
        totalAudits: expect.any(Number),
        totalGrievances: expect.any(Number),
        complianceScore: expect.any(Number)
      });
    });

    it('should return 404 for non-existent factory', async () => {
      const response = await request(app)
        .get('/api/factories/non-existent-id/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Factory not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/factories/${factory.id}/stats`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('POST /api/factories/:id/activate', () => {
    it('should activate inactive factory', async () => {
      const inactiveFactory = await testDb.createTestFactory({ isActive: false });

      const response = await request(app)
        .post(`/api/factories/${inactiveFactory.id}/activate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.isActive).toBe(true);
    });

    it('should return 404 for non-existent factory', async () => {
      const response = await request(app)
        .post('/api/factories/non-existent-id/activate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Factory not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/factories/${factory.id}/activate`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });

  describe('POST /api/factories/:id/deactivate', () => {
    it('should deactivate active factory', async () => {
      const response = await request(app)
        .post(`/api/factories/${factory.id}/deactivate`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.isActive).toBe(false);
    });

    it('should return 404 for non-existent factory', async () => {
      const response = await request(app)
        .post('/api/factories/non-existent-id/deactivate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toContain('Factory not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/factories/${factory.id}/deactivate`)
        .expect(401);

      expect(response.body.error).toContain('unauthorized');
    });
  });
});
