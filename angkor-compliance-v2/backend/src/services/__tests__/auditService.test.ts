import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TestDatabase, AuthTestUtils, mockData } from '../../test/test-utils';
import { auditService } from '../auditService';

describe('AuditService', () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.cleanup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe('createAudit', () => {
    it('should create a new audit successfully', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const auditData = mockData.audit({
        title: 'SMETA Audit 2024',
        type: 'external',
        standard: 'SMETA',
        scheduledDate: new Date('2024-06-01'),
        factoryId: factory.id
      });

      const result = await auditService.createAudit(auditData, user.id);

      expect(result).toMatchObject({
        id: expect.any(String),
        title: auditData.title,
        type: auditData.type,
        standard: auditData.standard,
        scheduledDate: auditData.scheduledDate,
        factoryId: factory.id,
        createdBy: user.id,
        status: 'scheduled'
      });
    });

    it('should throw error for non-existent factory', async () => {
      const user = await testDb.createTestUser();

      const auditData = mockData.audit({
        factoryId: 'non-existent-factory-id'
      });

      await expect(auditService.createAudit(auditData, user.id)).rejects.toThrow('Factory not found');
    });

    it('should validate required fields', async () => {
      const user = await testDb.createTestUser();

      const invalidData = { title: 'Test Audit' };

      await expect(auditService.createAudit(invalidData as any, user.id)).rejects.toThrow();
    });
  });

  describe('getAudits', () => {
    it('should return audits for factory', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      // Create test audits
      const audit1 = await testDb.getPrisma().audit.create({
        data: {
          title: 'Audit 1',
          type: 'internal',
          standard: 'SMETA',
          scheduledDate: new Date('2024-06-01'),
          status: 'scheduled',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      const audit2 = await testDb.getPrisma().audit.create({
        data: {
          title: 'Audit 2',
          type: 'external',
          standard: 'SA8000',
          scheduledDate: new Date('2024-07-01'),
          status: 'scheduled',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      const result = await auditService.getAudits(factory.id);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: audit1.id, title: 'Audit 1' }),
          expect.objectContaining({ id: audit2.id, title: 'Audit 2' })
        ])
      );
    });

    it('should apply status filter correctly', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

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

      const result = await auditService.getAudits(factory.id, { status: 'scheduled' });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('scheduled');
    });

    it('should apply type filter correctly', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

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

      const result = await auditService.getAudits(factory.id, { type: 'internal' });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('internal');
    });

    it('should apply date range filter correctly', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

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

      const result = await auditService.getAudits(factory.id, {
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-07-01')
      });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('June Audit');
    });
  });

  describe('getAuditById', () => {
    it('should return audit by id', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const audit = await testDb.getPrisma().audit.create({
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

      const result = await auditService.getAuditById(audit.id);

      expect(result).toMatchObject({
        id: audit.id,
        title: 'Test Audit',
        type: 'internal',
        standard: 'SMETA'
      });
    });

    it('should throw error for non-existent audit', async () => {
      await expect(auditService.getAuditById('non-existent-id')).rejects.toThrow('Audit not found');
    });
  });

  describe('updateAudit', () => {
    it('should update audit successfully', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const audit = await testDb.getPrisma().audit.create({
        data: {
          title: 'Original Title',
          type: 'internal',
          standard: 'SMETA',
          scheduledDate: new Date('2024-06-01'),
          status: 'scheduled',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      const updateData = {
        title: 'Updated Title',
        scheduledDate: new Date('2024-07-01')
      };

      const result = await auditService.updateAudit(audit.id, updateData, user.id);

      expect(result).toMatchObject({
        id: audit.id,
        title: 'Updated Title',
        scheduledDate: updateData.scheduledDate
      });
      expect(result.updatedAt).not.toBe(audit.updatedAt);
    });

    it('should throw error for non-existent audit', async () => {
      const user = await testDb.createTestUser();

      await expect(auditService.updateAudit('non-existent-id', { title: 'New Title' }, user.id)).rejects.toThrow('Audit not found');
    });

    it('should validate update data', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const audit = await testDb.getPrisma().audit.create({
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

      await expect(auditService.updateAudit(audit.id, { title: '' }, user.id)).rejects.toThrow();
    });
  });

  describe('startAudit', () => {
    it('should start scheduled audit', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const audit = await testDb.getPrisma().audit.create({
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

      const result = await auditService.startAudit(audit.id, user.id);

      expect(result).toMatchObject({
        id: audit.id,
        status: 'in_progress',
        startedAt: expect.any(Date)
      });
    });

    it('should throw error for non-existent audit', async () => {
      const user = await testDb.createTestUser();

      await expect(auditService.startAudit('non-existent-id', user.id)).rejects.toThrow('Audit not found');
    });

    it('should throw error for already started audit', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const audit = await testDb.getPrisma().audit.create({
        data: {
          title: 'Test Audit',
          type: 'internal',
          standard: 'SMETA',
          scheduledDate: new Date('2024-06-01'),
          status: 'in_progress',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      await expect(auditService.startAudit(audit.id, user.id)).rejects.toThrow('Audit is already in progress');
    });
  });

  describe('completeAudit', () => {
    it('should complete audit with findings', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const audit = await testDb.getPrisma().audit.create({
        data: {
          title: 'Test Audit',
          type: 'internal',
          standard: 'SMETA',
          scheduledDate: new Date('2024-06-01'),
          status: 'in_progress',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      const completionData = {
        findings: 'Some findings were identified',
        recommendations: 'Implement corrective actions',
        overallScore: 85
      };

      const result = await auditService.completeAudit(audit.id, completionData, user.id);

      expect(result).toMatchObject({
        id: audit.id,
        status: 'completed',
        findings: completionData.findings,
        recommendations: completionData.recommendations,
        overallScore: completionData.overallScore,
        completedAt: expect.any(Date)
      });
    });

    it('should throw error for non-existent audit', async () => {
      const user = await testDb.createTestUser();

      const completionData = {
        findings: 'Findings',
        recommendations: 'Recommendations',
        overallScore: 85
      };

      await expect(auditService.completeAudit('non-existent-id', completionData, user.id)).rejects.toThrow('Audit not found');
    });

    it('should throw error for audit not in progress', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const audit = await testDb.getPrisma().audit.create({
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

      const completionData = {
        findings: 'Findings',
        recommendations: 'Recommendations',
        overallScore: 85
      };

      await expect(auditService.completeAudit(audit.id, completionData, user.id)).rejects.toThrow('Audit is not in progress');
    });
  });

  describe('addAuditFinding', () => {
    it('should add finding to audit', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

      const audit = await testDb.getPrisma().audit.create({
        data: {
          title: 'Test Audit',
          type: 'internal',
          standard: 'SMETA',
          scheduledDate: new Date('2024-06-01'),
          status: 'in_progress',
          factoryId: factory.id,
          createdBy: user.id
        }
      });

      const findingData = {
        title: 'Safety Issue',
        description: 'Safety equipment not properly maintained',
        severity: 'high',
        category: 'safety',
        evidence: 'Photos and documentation'
      };

      const result = await auditService.addAuditFinding(audit.id, findingData, user.id);

      expect(result).toMatchObject({
        title: findingData.title,
        description: findingData.description,
        severity: findingData.severity,
        category: findingData.category,
        evidence: findingData.evidence,
        auditId: audit.id,
        createdBy: user.id
      });
    });

    it('should throw error for non-existent audit', async () => {
      const user = await testDb.createTestUser();

      const findingData = {
        title: 'Safety Issue',
        description: 'Description',
        severity: 'high',
        category: 'safety'
      };

      await expect(auditService.addAuditFinding('non-existent-id', findingData, user.id)).rejects.toThrow('Audit not found');
    });
  });

  describe('getAuditStats', () => {
    it('should return audit statistics', async () => {
      const factory = await testDb.createTestFactory();
      const user = await testDb.createTestUser({ factoryId: factory.id });

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

      const result = await auditService.getAuditStats(factory.id);

      expect(result).toMatchObject({
        total: 2,
        scheduled: 1,
        inProgress: 0,
        completed: 1,
        cancelled: 0,
        byType: expect.any(Object),
        byStandard: expect.any(Object)
      });
    });
  });
});
