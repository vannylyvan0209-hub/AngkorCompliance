import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { User, UserRole } from '@prisma/client';
import { CustomError, createAuthError, createNotFoundError } from '../middleware/errorHandler';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  factoryId?: string;
  tenantId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  factoryId?: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
}

class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;
  private readonly bcryptRounds: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '7d';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');

    if (this.jwtSecret === 'fallback-secret' || this.jwtRefreshSecret === 'fallback-refresh-secret') {
      console.warn('⚠️ Using fallback JWT secrets. Please set JWT_SECRET and JWT_REFRESH_SECRET environment variables.');
    }
  }

  // Hash password
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.bcryptRounds);
  }

  // Verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT tokens
  generateTokens(user: AuthUser): AuthTokens {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      factoryId: user.factoryId,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
    });

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.jwtRefreshSecret,
      { expiresIn: this.refreshTokenExpiry }
    );

    // Calculate expiry time
    const decoded = jwt.decode(accessToken) as any;
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  // Verify access token
  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw createAuthError('Invalid or expired access token');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.jwtRefreshSecret) as any;
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw createAuthError('Invalid or expired refresh token');
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const { email, password } = credentials;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        tenant: true,
        factory: true,
      },
    });

    if (!user) {
      throw createAuthError('Invalid email or password');
    }

    if (!user.isActive) {
      throw createAuthError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw createAuthError('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
      factoryId: user.factoryId || undefined,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
    };

    const tokens = this.generateTokens(authUser);

    return { user: authUser, tokens };
  }

  // Register new user
  async register(data: RegisterData): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const { email, password, firstName, lastName, role, factoryId, tenantId } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new CustomError('User with this email already exists', 409);
    }

    // Validate tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw createNotFoundError('Tenant');
    }

    // Validate factory if provided
    if (factoryId) {
      const factory = await prisma.factory.findUnique({
        where: { id: factoryId },
      });

      if (!factory) {
        throw createNotFoundError('Factory');
      }
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role,
        tenantId,
        factoryId,
        isActive: true,
        isEmailVerified: false,
      },
      include: {
        tenant: true,
        factory: true,
      },
    });

    // Generate tokens
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
      factoryId: user.factoryId || undefined,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
    };

    const tokens = this.generateTokens(authUser);

    return { user: authUser, tokens };
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const decoded = this.verifyRefreshToken(refreshToken);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tenant: true,
        factory: true,
      },
    });

    if (!user || !user.isActive) {
      throw createAuthError('User not found or inactive');
    }

    // Generate new tokens
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
      factoryId: user.factoryId || undefined,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
    };

    return this.generateTokens(authUser);
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw createAuthError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  // Reset password (forgot password flow)
  async resetPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      this.jwtSecret,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset token
    console.log(`Password reset token for ${email}: ${resetToken}`);

    // In production, you would:
    // 1. Store the reset token in database with expiry
    // 2. Send email with reset link
    // 3. Implement token validation endpoint
  }

  // Verify email
  async verifyEmail(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
        factory: true,
      },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
      factoryId: user.factoryId || undefined,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
    };
  }

  // Logout (invalidate refresh token)
  async logout(refreshToken: string): Promise<void> {
    // In a more sophisticated implementation, you would:
    // 1. Store refresh tokens in database
    // 2. Mark the token as invalid
    // 3. Implement token blacklisting
    
    // For now, we'll just verify the token is valid
    this.verifyRefreshToken(refreshToken);
  }
}

export const authService = new AuthService();
