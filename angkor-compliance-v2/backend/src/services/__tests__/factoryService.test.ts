import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TestDatabase, AuthTestUtils, mockData } from '../../test/test-utils';
import { factoryService } from '../factoryService';

describe('FactoryService', () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.cleanup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe('createFactory', () => {
    it('should create a new factory successfully', async () => {
      const factoryData = mockData.factory({
        name: 'New Factory',
        address: '123 Factory Street',
        city: 'Phnom Penh',
        country: 'Cambodia'
      });

      const result = await factoryService.createFactory(factoryData);

      expect(result).toMatchObject({
        id: expect.any(String),
        name: factoryData.name,
        address: factoryData.address,
        city: factoryData.city,
        country: factoryData.country,
        isActive: true
      });
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should throw error for duplicate factory name', async () => {
      const factoryData = mockData.factory({ name: 'Duplicate Factory' });
      await testDb.createTestFactory({ name: 'Duplicate Factory' });

      await expect(factoryService.createFactory(factoryData)).rejects.toThrow('Factory with this name already exists');
    });

    it('should validate required fields', async () => {
      const invalidData = { name: 'Test Factory' };

      await expect(factoryService.createFactory(invalidData as any)).rejects.toThrow();
    });
  });

  describe('getFactories', () => {
    it('should return all factories for super admin', async () => {
      const factory1 = await testDb.createTestFactory({ name: 'Factory 1' });
      const factory2 = await testDb.createTestFactory({ name: 'Factory 2' });

      const result = await factoryService.getFactories('super_admin');

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: factory1.id, name: 'Factory 1' }),
          expect.objectContaining({ id: factory2.id, name: 'Factory 2' })
        ])
      );
    });

    it('should return only assigned factories for factory admin', async () => {
      const factory1 = await testDb.createTestFactory({ name: 'Assigned Factory' });
      const factory2 = await testDb.createTestFactory({ name: 'Other Factory' });
      const user = await testDb.createTestUser({ 
        role: 'factory_admin',
        factoryId: factory1.id 
      });

      const result = await factoryService.getFactories('factory_admin', user.id);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: factory1.id,
        name: 'Assigned Factory'
      });
    });

    it('should apply pagination correctly', async () => {
      // Create multiple factories
      for (let i = 1; i <= 5; i++) {
        await testDb.createTestFactory({ name: `Factory ${i}` });
      }

      const result = await factoryService.getFactories('super_admin', undefined, {
        page: 1,
        limit: 2
      });

      expect(result).toHaveLength(2);
    });

    it('should apply search filter correctly', async () => {
      await testDb.createTestFactory({ name: 'Textile Factory' });
      await testDb.createTestFactory({ name: 'Electronics Factory' });

      const result = await factoryService.getFactories('super_admin', undefined, {
        search: 'Textile'
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Textile Factory');
    });
  });

  describe('getFactoryById', () => {
    it('should return factory by id', async () => {
      const factory = await testDb.createTestFactory({ name: 'Test Factory' });

      const result = await factoryService.getFactoryById(factory.id);

      expect(result).toMatchObject({
        id: factory.id,
        name: 'Test Factory'
      });
    });

    it('should throw error for non-existent factory', async () => {
      await expect(factoryService.getFactoryById('non-existent-id')).rejects.toThrow('Factory not found');
    });

    it('should respect access control for factory admin', async () => {
      const factory1 = await testDb.createTestFactory({ name: 'Assigned Factory' });
      const factory2 = await testDb.createTestFactory({ name: 'Other Factory' });
      const user = await testDb.createTestUser({ 
        role: 'factory_admin',
        factoryId: factory1.id 
      });

      // Should be able to access assigned factory
      const result1 = await factoryService.getFactoryById(factory1.id, user.id);
      expect(result1.id).toBe(factory1.id);

      // Should not be able to access other factory
      await expect(factoryService.getFactoryById(factory2.id, user.id)).rejects.toThrow('Access denied');
    });
  });

  describe('updateFactory', () => {
    it('should update factory successfully', async () => {
      const factory = await testDb.createTestFactory({ name: 'Original Name' });

      const updateData = {
        name: 'Updated Name',
        address: 'Updated Address'
      };

      const result = await factoryService.updateFactory(factory.id, updateData);

      expect(result).toMatchObject({
        id: factory.id,
        name: 'Updated Name',
        address: 'Updated Address'
      });
      expect(result.updatedAt).not.toBe(factory.updatedAt);
    });

    it('should throw error for non-existent factory', async () => {
      await expect(factoryService.updateFactory('non-existent-id', { name: 'New Name' })).rejects.toThrow('Factory not found');
    });

    it('should validate update data', async () => {
      const factory = await testDb.createTestFactory();

      await expect(factoryService.updateFactory(factory.id, { name: '' })).rejects.toThrow();
    });

    it('should respect access control', async () => {
      const factory1 = await testDb.createTestFactory({ name: 'Assigned Factory' });
      const factory2 = await testDb.createTestFactory({ name: 'Other Factory' });
      const user = await testDb.createTestUser({ 
        role: 'factory_admin',
        factoryId: factory1.id 
      });

      // Should be able to update assigned factory
      const result = await factoryService.updateFactory(factory1.id, { name: 'Updated Name' }, user.id);
      expect(result.name).toBe('Updated Name');

      // Should not be able to update other factory
      await expect(factoryService.updateFactory(factory2.id, { name: 'Updated Name' }, user.id)).rejects.toThrow('Access denied');
    });
  });

  describe('deleteFactory', () => {
    it('should delete factory successfully', async () => {
      const factory = await testDb.createTestFactory();

      await factoryService.deleteFactory(factory.id);

      const deletedFactory = await testDb.getPrisma().factory.findUnique({
        where: { id: factory.id }
      });
      expect(deletedFactory).toBeNull();
    });

    it('should throw error for non-existent factory', async () => {
      await expect(factoryService.deleteFactory('non-existent-id')).rejects.toThrow('Factory not found');
    });

    it('should prevent deletion of factory with users', async () => {
      const factory = await testDb.createTestFactory();
      await testDb.createTestUser({ factoryId: factory.id });

      await expect(factoryService.deleteFactory(factory.id)).rejects.toThrow('Cannot delete factory with active users');
    });

    it('should respect access control', async () => {
      const factory1 = await testDb.createTestFactory({ name: 'Assigned Factory' });
      const factory2 = await testDb.createTestFactory({ name: 'Other Factory' });
      const user = await testDb.createTestUser({ 
        role: 'factory_admin',
        factoryId: factory1.id 
      });

      // Should not be able to delete other factory
      await expect(factoryService.deleteFactory(factory2.id, user.id)).rejects.toThrow('Access denied');
    });
  });

  describe('getFactoryStats', () => {
    it('should return factory statistics', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const result = await factoryService.getFactoryStats(factory.id);

      expect(result).toMatchObject({
        totalUsers: 1,
        activeUsers: 1,
        totalDocuments: 0,
        totalAudits: 0,
        totalGrievances: 0,
        complianceScore: 0
      });
    });

    it('should throw error for non-existent factory', async () => {
      await expect(factoryService.getFactoryStats('non-existent-id')).rejects.toThrow('Factory not found');
    });
  });

  describe('activateFactory', () => {
    it('should activate inactive factory', async () => {
      const factory = await testDb.createTestFactory({ isActive: false });

      const result = await factoryService.activateFactory(factory.id);

      expect(result.isActive).toBe(true);
    });

    it('should throw error for non-existent factory', async () => {
      await expect(factoryService.activateFactory('non-existent-id')).rejects.toThrow('Factory not found');
    });
  });

  describe('deactivateFactory', () => {
    it('should deactivate active factory', async () => {
      const factory = await testDb.createTestFactory({ isActive: true });

      const result = await factoryService.deactivateFactory(factory.id);

      expect(result.isActive).toBe(false);
    });

    it('should throw error for non-existent factory', async () => {
      await expect(factoryService.deactivateFactory('non-existent-id')).rejects.toThrow('Factory not found');
    });
  });
});
