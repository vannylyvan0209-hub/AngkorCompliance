import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TestDatabase, AuthTestUtils, mockData } from '../../test/test-utils';
import { authService } from '../authService';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock jwt
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('AuthService', () => {
  let testDb: TestDatabase;

  beforeEach(async () => {
    testDb = new TestDatabase();
    await testDb.cleanup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = mockData.user({
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User'
      });

      mockedBcrypt.hash.mockResolvedValue('hashedpassword' as never);

      const result = await authService.register(userData);

      expect(result).toMatchObject({
        id: expect.any(String),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      });
      expect(result.password).toBeUndefined();
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(userData.password, 12);
    });

    it('should throw error if user already exists', async () => {
      const userData = mockData.user();
      await testDb.createTestUser({ email: userData.email });

      await expect(authService.register(userData)).rejects.toThrow('User already exists');
    });

    it('should validate required fields', async () => {
      const invalidData = { email: 'test@example.com' };

      await expect(authService.register(invalidData as any)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const userData = mockData.user();
      const user = await testDb.createTestUser(userData);

      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedJwt.sign.mockReturnValue('mock-token' as never);

      const result = await authService.login({
        email: userData.email,
        password: userData.password
      });

      expect(result).toMatchObject({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token: 'mock-token',
        refreshToken: 'mock-token'
      });
      expect(result.user.password).toBeUndefined();
    });

    it('should throw error for invalid email', async () => {
      await expect(authService.login({
        email: 'nonexistent@example.com',
        password: 'password'
      })).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      const userData = mockData.user();
      await testDb.createTestUser(userData);

      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(authService.login({
        email: userData.email,
        password: 'wrongpassword'
      })).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for inactive user', async () => {
      const userData = mockData.user({ isActive: false });
      await testDb.createTestUser(userData);

      await expect(authService.login({
        email: userData.email,
        password: userData.password
      })).rejects.toThrow('Account is inactive');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const user = await testDb.createTestUser();
      const refreshToken = AuthTestUtils.generateRefreshToken(user.id);

      mockedJwt.verify.mockReturnValue({ userId: user.id } as any);
      mockedJwt.sign.mockReturnValue('new-token' as never);

      const result = await authService.refreshToken(refreshToken);

      expect(result).toMatchObject({
        token: 'new-token',
        refreshToken: 'new-token'
      });
    });

    it('should throw error for invalid refresh token', async () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken('invalid-token')).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error for non-existent user', async () => {
      const refreshToken = AuthTestUtils.generateRefreshToken('non-existent-id');

      mockedJwt.verify.mockReturnValue({ userId: 'non-existent-id' } as any);

      await expect(authService.refreshToken(refreshToken)).rejects.toThrow('User not found');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const user = await testDb.createTestUser();
      const newPassword = 'newpassword123';

      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedBcrypt.hash.mockResolvedValue('newhashedpassword' as never);

      await authService.changePassword(user.id, {
        currentPassword: 'oldpassword',
        newPassword
      });

      const updatedUser = await testDb.getPrisma().user.findUnique({
        where: { id: user.id }
      });

      expect(updatedUser?.password).toBe('newhashedpassword');
    });

    it('should throw error for incorrect current password', async () => {
      const user = await testDb.createTestUser();

      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(authService.changePassword(user.id, {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword'
      })).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const user = await testDb.createTestUser();
      const resetToken = 'valid-reset-token';
      const newPassword = 'newpassword123';

      // Mock token verification
      mockedJwt.verify.mockReturnValue({ userId: user.id } as any);
      mockedBcrypt.hash.mockResolvedValue('newhashedpassword' as never);

      await authService.resetPassword(resetToken, newPassword);

      const updatedUser = await testDb.getPrisma().user.findUnique({
        where: { id: user.id }
      });

      expect(updatedUser?.password).toBe('newhashedpassword');
    });

    it('should throw error for invalid reset token', async () => {
      mockedJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.resetPassword('invalid-token', 'newpassword')).rejects.toThrow('Invalid reset token');
    });
  });
});
