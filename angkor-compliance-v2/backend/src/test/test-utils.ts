import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  factoryId?: string;
}

export interface TestFactory {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
}

export class TestDatabase {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }

  async cleanup() {
    // Delete in reverse order of dependencies
    await this.prisma.audit.deleteMany();
    await this.prisma.grievance.deleteMany();
    await this.prisma.document.deleteMany();
    await this.prisma.training.deleteMany();
    await this.prisma.permit.deleteMany();
    await this.prisma.user.deleteMany();
    await this.prisma.factory.deleteMany();
    await this.prisma.organization.deleteMany();
  }

  async createTestUser(userData: Partial<TestUser> = {}): Promise<TestUser> {
    const user = await this.prisma.user.create({
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

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      factoryId: user.factoryId || undefined
    };
  }

  async createTestFactory(factoryData: Partial<TestFactory> = {}): Promise<TestFactory> {
    const factory = await this.prisma.factory.create({
      data: {
        name: 'Test Factory',
        address: 'Test Address',
        city: 'Test City',
        country: 'Cambodia',
        isActive: true,
        ...factoryData
      }
    });

    return {
      id: factory.id,
      name: factory.name,
      address: factory.address,
      city: factory.city,
      country: factory.country
    };
  }

  async createTestOrganization() {
    return await this.prisma.organization.create({
      data: {
        name: 'Test Organization',
        email: 'org@example.com',
        phone: '+855123456789',
        address: 'Test Address',
        isActive: true
      }
    });
  }

  getPrisma() {
    return this.prisma;
  }
}

export class AuthTestUtils {
  static generateToken(userId: string, role: string, factoryId?: string): string {
    return jwt.sign(
      { userId, role, factoryId },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  }

  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
  }

  static createMockRequest(user?: TestUser): Partial<Request> {
    const token = user ? this.generateToken(user.id, user.role, user.factoryId) : undefined;
    
    return {
      headers: {
        authorization: token ? `Bearer ${token}` : undefined
      },
      user: user ? {
        id: user.id,
        role: user.role,
        factoryId: user.factoryId
      } : undefined
    } as Partial<Request>;
  }

  static createMockResponse(): Partial<Response> {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };
    return res;
  }

  static createMockNext(): NextFunction {
    return jest.fn();
  }
}

export class ApiTestUtils {
  static expectSuccessResponse(res: any, expectedData?: any) {
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    
    if (expectedData) {
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining(expectedData)
      );
    }
  }

  static expectErrorResponse(res: any, statusCode: number, message?: string) {
    expect(res.status).toHaveBeenCalledWith(statusCode);
    expect(res.json).toHaveBeenCalled();
    
    if (message) {
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining(message)
        })
      );
    }
  }

  static expectValidationError(res: any, field?: string) {
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('validation')
      })
    );
  }

  static expectUnauthorizedResponse(res: any) {
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('unauthorized')
      })
    );
  }

  static expectForbiddenResponse(res: any) {
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('forbidden')
      })
    );
  }
}

// Mock data factories
export const mockData = {
  user: (overrides = {}) => ({
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'password123',
    role: 'factory_admin',
    isActive: true,
    ...overrides
  }),

  factory: (overrides = {}) => ({
    name: 'Test Factory',
    address: 'Test Address',
    city: 'Test City',
    country: 'Cambodia',
    isActive: true,
    ...overrides
  }),

  document: (overrides = {}) => ({
    title: 'Test Document',
    type: 'policy',
    status: 'active',
    ...overrides
  }),

  audit: (overrides = {}) => ({
    title: 'Test Audit',
    type: 'internal',
    status: 'scheduled',
    scheduledDate: new Date(),
    ...overrides
  }),

  grievance: (overrides = {}) => ({
    title: 'Test Grievance',
    description: 'Test description',
    category: 'workplace',
    status: 'open',
    priority: 'medium',
    ...overrides
  })
};
