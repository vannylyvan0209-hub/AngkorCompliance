import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { join } from 'path';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/angkor_compliance_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';

// Global test setup
beforeAll(async () => {
  // Reset test database
  try {
    execSync('npx prisma db push --force-reset', {
      stdio: 'inherit',
      cwd: join(__dirname, '../..')
    });
  } catch (error) {
    console.warn('Failed to reset test database:', error);
  }
});

afterAll(async () => {
  // Cleanup after all tests
  const prisma = new PrismaClient();
  await prisma.$disconnect();
});

// Mock external services
jest.mock('../services/emailNotificationService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('../services/fileStorageService', () => ({
  uploadFile: jest.fn().mockResolvedValue({ url: 'https://example.com/file.jpg' }),
  deleteFile: jest.fn().mockResolvedValue(true),
  getSignedUrl: jest.fn().mockResolvedValue('https://example.com/signed-url')
}));

jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    expire: jest.fn(),
    disconnect: jest.fn()
  };
  return jest.fn(() => mockRedis);
});

// Global test utilities
global.testUtils = {
  createTestUser: async (prisma: PrismaClient, userData = {}) => {
    return await prisma.user.create({
      data: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'factory_admin',
        isActive: true,
        ...userData
      }
    });
  },
  
  createTestFactory: async (prisma: PrismaClient, factoryData = {}) => {
    return await prisma.factory.create({
      data: {
        name: 'Test Factory',
        address: 'Test Address',
        city: 'Test City',
        country: 'Cambodia',
        isActive: true,
        ...factoryData
      }
    });
  },
  
  generateAuthToken: (userId: string, role: string) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
};
