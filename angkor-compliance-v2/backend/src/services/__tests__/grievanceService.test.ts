import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TestDatabase, AuthTestUtils, mockData } from '../../test/test-utils';
import { grievanceService } from '../grievanceService';

describe('GrievanceService', () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.cleanup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe('createGrievance', () => {
    it('should create a new grievance successfully', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const grievanceData = mockData.grievance({
        title: 'Workplace Harassment',
        description: 'Detailed description of the issue',
        category: 'harassment',
        priority: 'high',
        factoryId: factory.id
      });

      const result = await grievanceService.createGrievance(grievanceData, user.id);

      expect(result).toMatchObject({
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
      const factory = await testDb.createTestFactory();

      const grievanceData = mockData.grievance({
        title: 'Anonymous Complaint',
        description: 'Anonymous description',
        category: 'safety',
        isAnonymous: true,
        factoryId: factory.id
      });

      const result = await grievanceService.createGrievance(grievanceData);

      expect(result).toMatchObject({
        title: grievanceData.title,
        isAnonymous: true,
        reportedBy: null
      });
    });

    it('should throw error for non-existent factory', async () => {
      const user = await testDb.createTestUser();

      const grievanceData = mockData.grievance({
        factoryId: 'non-existent-factory-id'
      });

      await expect(grievanceService.createGrievance(grievanceData, user.id)).rejects.toThrow('Factory not found');
    });

    it('should validate required fields', async () => {
      const user = await testDb.createTestUser();

      const invalidData = { title: 'Test Grievance' };

      await expect(grievanceService.createGrievance(invalidData as any, user.id)).rejects.toThrow();
    });
  });

  describe('getGrievances', () => {
    it('should return grievances for factory', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      // Create test grievances
      const grievance1 = await testDb.getPrisma().grievance.create({
        data: {
          title: 'Grievance 1',
          description: 'Description 1',
          category: 'harassment',
          priority: 'high',
          status: 'open',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      const grievance2 = await testDb.getPrisma().grievance.create({
        data: {
          title: 'Grievance 2',
          description: 'Description 2',
          category: 'safety',
          priority: 'medium',
          status: 'open',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      const result = await grievanceService.getGrievances(factory.id);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: grievance1.id, title: 'Grievance 1' }),
          expect.objectContaining({ id: grievance2.id, title: 'Grievance 2' })
        ])
      );
    });

    it('should apply status filter correctly', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

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

      const result = await grievanceService.getGrievances(factory.id, { status: 'open' });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('open');
    });

    it('should apply category filter correctly', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

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

      const result = await grievanceService.getGrievances(factory.id, { category: 'harassment' });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('harassment');
    });

    it('should apply priority filter correctly', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

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

      const result = await grievanceService.getGrievances(factory.id, { priority: 'high' });

      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe('high');
    });
  });

  describe('getGrievanceById', () => {
    it('should return grievance by id', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const grievance = await testDb.getPrisma().grievance.create({
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

      const result = await grievanceService.getGrievanceById(grievance.id);

      expect(result).toMatchObject({
        id: grievance.id,
        title: 'Test Grievance',
        description: 'Test description',
        category: 'harassment',
        priority: 'high'
      });
    });

    it('should throw error for non-existent grievance', async () => {
      await expect(grievanceService.getGrievanceById('non-existent-id')).rejects.toThrow('Grievance not found');
    });
  });

  describe('updateGrievance', () => {
    it('should update grievance successfully', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const grievance = await testDb.getPrisma().grievance.create({
        data: {
          title: 'Original Title',
          description: 'Original description',
          category: 'harassment',
          priority: 'high',
          status: 'open',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      const updateData = {
        title: 'Updated Title',
        description: 'Updated description',
        priority: 'medium'
      };

      const result = await grievanceService.updateGrievance(grievance.id, updateData, user.id);

      expect(result).toMatchObject({
        id: grievance.id,
        title: 'Updated Title',
        description: 'Updated description',
        priority: 'medium'
      });
      expect(result.updatedAt).not.toBe(grievance.updatedAt);
    });

    it('should throw error for non-existent grievance', async () => {
      const user = await testDb.createTestUser();

      await expect(grievanceService.updateGrievance('non-existent-id', { title: 'New Title' }, user.id)).rejects.toThrow('Grievance not found');
    });

    it('should validate update data', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const grievance = await testDb.getPrisma().grievance.create({
        data: {
          title: 'Test Grievance',
          description: 'Description',
          category: 'harassment',
          priority: 'high',
          status: 'open',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      await expect(grievanceService.updateGrievance(grievance.id, { title: '' }, user.id)).rejects.toThrow();
    });
  });

  describe('assignGrievance', () => {
    it('should assign grievance to committee member', async () => {
      const factory = await testDb.createTestFactory();
      const reporter = await testDb.createTestUser({ factoryId: factory.id });
      const assignee = await testDb.createTestUser({ 
        factoryId: factory.id,
        role: 'grievance_committee'
      });

      const grievance = await testDb.getPrisma().grievance.create({
        data: {
          title: 'Test Grievance',
          description: 'Description',
          category: 'harassment',
          priority: 'high',
          status: 'open',
          factoryId: factory.id,
          reportedBy: reporter.id
        }
      });

      const result = await grievanceService.assignGrievance(grievance.id, assignee.id, user.id);

      expect(result).toMatchObject({
        id: grievance.id,
        assignedTo: assignee.id,
        status: 'assigned'
      });
    });

    it('should throw error for non-existent grievance', async () => {
      const user = await testDb.createTestUser();

      await expect(grievanceService.assignGrievance('non-existent-id', user.id, user.id)).rejects.toThrow('Grievance not found');
    });

    it('should throw error for non-existent assignee', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const grievance = await testDb.getPrisma().grievance.create({
        data: {
          title: 'Test Grievance',
          description: 'Description',
          category: 'harassment',
          priority: 'high',
          status: 'open',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      await expect(grievanceService.assignGrievance(grievance.id, 'non-existent-user', user.id)).rejects.toThrow('Assignee not found');
    });
  });

  describe('addGrievanceComment', () => {
    it('should add comment to grievance', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const grievance = await testDb.getPrisma().grievance.create({
        data: {
          title: 'Test Grievance',
          description: 'Description',
          category: 'harassment',
          priority: 'high',
          status: 'open',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      const commentData = {
        content: 'This is a comment',
        isInternal: false
      };

      const result = await grievanceService.addGrievanceComment(grievance.id, commentData, user.id);

      expect(result).toMatchObject({
        content: 'This is a comment',
        isInternal: false,
        createdBy: user.id,
        grievanceId: grievance.id
      });
    });

    it('should throw error for non-existent grievance', async () => {
      const user = await testDb.createTestUser();

      const commentData = {
        content: 'This is a comment',
        isInternal: false
      };

      await expect(grievanceService.addGrievanceComment('non-existent-id', commentData, user.id)).rejects.toThrow('Grievance not found');
    });
  });

  describe('closeGrievance', () => {
    it('should close grievance with resolution', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const grievance = await testDb.getPrisma().grievance.create({
        data: {
          title: 'Test Grievance',
          description: 'Description',
          category: 'harassment',
          priority: 'high',
          status: 'open',
          factoryId: factory.id,
          reportedBy: user.id
        }
      });

      const resolutionData = {
        resolution: 'Issue has been resolved',
        resolutionType: 'resolved'
      };

      const result = await grievanceService.closeGrievance(grievance.id, resolutionData, user.id);

      expect(result).toMatchObject({
        id: grievance.id,
        status: 'closed',
        resolution: 'Issue has been resolved',
        resolutionType: 'resolved',
        closedAt: expect.any(Date)
      });
    });

    it('should throw error for non-existent grievance', async () => {
      const user = await testDb.createTestUser();

      const resolutionData = {
        resolution: 'Issue resolved',
        resolutionType: 'resolved'
      };

      await expect(grievanceService.closeGrievance('non-existent-id', resolutionData, user.id)).rejects.toThrow('Grievance not found');
    });
  });

  describe('getGrievanceStats', () => {
    it('should return grievance statistics', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

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

      const result = await grievanceService.getGrievanceStats(factory.id);

      expect(result).toMatchObject({
        total: 2,
        open: 1,
        closed: 1,
        assigned: 0,
        inProgress: 0,
        byCategory: expect.any(Object),
        byPriority: expect.any(Object)
      });
    });
  });
});
