import { prisma } from '../index';
import { User, UserRole, UserStatus, Role } from '@prisma/client';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  factoryId?: string;
  department?: string;
  position?: string;
  employeeId?: string;
  hireDate?: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  factoryId?: string;
  department?: string;
  position?: string;
  employeeId?: string;
  hireDate?: Date;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  factoryId?: string;
  department?: string;
  isActive?: boolean;
  createdDateFrom?: Date;
  createdDateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedUserResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Array<{ role: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  byFactory: Array<{ factoryId: string; factoryName: string; count: number }>;
  byDepartment: Array<{ department: string; count: number }>;
  recentUsers: Array<{ id: string; firstName: string; lastName: string; email: string; createdAt: Date }>;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
}

export interface UserActivity {
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class UserManagementService {
  // Create a new user
  async createUser(data: CreateUserData, createdById: string): Promise<User> {
    const creator = await prisma.user.findUnique({
      where: { id: createdById },
    });

    if (!creator) {
      throw createNotFoundError('Creator User');
    }

    // Only super admin and factory admin can create users
    if (!['SUPER_ADMIN', 'FACTORY_ADMIN'].includes(creator.role)) {
      throw createForbiddenError('You do not have permission to create users');
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new CustomError('User with this email already exists', 409);
    }

    // Validate factory if provided
    if (data.factoryId) {
      const factory = await prisma.factory.findUnique({
        where: { id: data.factoryId },
      });

      if (!factory) {
        throw createNotFoundError('Factory');
      }

      // Check if user has access to this factory
      if (creator.role !== 'SUPER_ADMIN') {
        if (creator.tenantId !== factory.tenantId) {
          throw createForbiddenError('You can only create users for factories in your tenant');
        }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        tenantId: creator.tenantId,
        createdById: createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            roles: true,
            activities: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('user:created', user.id, createdById, {
      userEmail: user.email,
      userRole: user.role,
      factoryId: user.factoryId,
    });

    return user;
  }

  // Get all users with filtering and pagination
  async getUsers(
    filters: UserFilters,
    userId: string
  ): Promise<PaginatedUserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const {
      search,
      role,
      status,
      factoryId,
      department,
      isActive,
      createdDateFrom,
      createdDateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (factoryId) {
      where.factoryId = factoryId;
    }

    if (department) {
      where.department = department;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (createdDateFrom || createdDateTo) {
      where.createdAt = {};
      if (createdDateFrom) where.createdAt.gte = createdDateFrom;
      if (createdDateTo) where.createdAt.lte = createdDateTo;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            roles: true,
            activities: true,
          },
        },
      },
    });

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get user by ID
  async getUserById(userId: string, requesterId: string): Promise<User> {
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester) {
      throw createNotFoundError('Requester User');
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: requester.tenantId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                permissions: {
                  include: {
                    permission: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            createdAt: true,
            metadata: true,
          },
        },
        _count: {
          select: {
            roles: true,
            activities: true,
          },
        },
      },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    return user;
  }

  // Update user
  async updateUser(
    userId: string,
    data: UpdateUserData,
    updaterId: string
  ): Promise<User> {
    const updater = await prisma.user.findUnique({
      where: { id: updaterId },
    });

    if (!updater) {
      throw createNotFoundError('Updater User');
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw createNotFoundError('User');
    }

    // Check access permissions
    if (updater.role !== 'SUPER_ADMIN') {
      if (updater.tenantId !== existingUser.tenantId) {
        throw createForbiddenError('You can only update users in your tenant');
      }
    }

    // Check if email already exists (if being updated)
    if (data.email && data.email !== existingUser.email) {
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUserWithEmail) {
        throw new CustomError('User with this email already exists', 409);
      }
    }

    // Validate factory if being updated
    if (data.factoryId && data.factoryId !== existingUser.factoryId) {
      const factory = await prisma.factory.findUnique({
        where: { id: data.factoryId },
      });

      if (!factory) {
        throw createNotFoundError('Factory');
      }

      // Check if updater has access to this factory
      if (updater.role !== 'SUPER_ADMIN') {
        if (updater.tenantId !== factory.tenantId) {
          throw createForbiddenError('You can only assign users to factories in your tenant');
        }
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: {
            roles: true,
            activities: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('user:updated', user.id, updaterId, {
      userEmail: user.email,
      changes: data,
    });

    return user;
  }

  // Change user password
  async changePassword(
    userId: string,
    passwordData: ChangePasswordData,
    changerId: string
  ): Promise<void> {
    const changer = await prisma.user.findUnique({
      where: { id: changerId },
    });

    if (!changer) {
      throw createNotFoundError('Changer User');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check access permissions
    if (changer.role !== 'SUPER_ADMIN') {
      if (changer.tenantId !== user.tenantId) {
        throw createForbiddenError('You can only change passwords for users in your tenant');
      }
    }

    // Validate current password if changing own password
    if (changerId === userId) {
      const isCurrentPasswordValid = await bcrypt.compare(
        passwordData.currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new CustomError('Current password is incorrect', 400);
      }
    }

    // Validate new password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new CustomError('New password and confirmation do not match', 400);
    }

    if (passwordData.newPassword.length < 8) {
      throw new CustomError('New password must be at least 8 characters long', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(passwordData.newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Log activity
    await this.logActivity('user:password_changed', user.id, changerId, {
      userEmail: user.email,
      changedBy: changer.email,
    });
  }

  // Activate user
  async activateUser(userId: string, activatorId: string): Promise<User> {
    const activator = await prisma.user.findUnique({
      where: { id: activatorId },
    });

    if (!activator) {
      throw createNotFoundError('Activator User');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check access permissions
    if (activator.role !== 'SUPER_ADMIN') {
      if (activator.tenantId !== user.tenantId) {
        throw createForbiddenError('You can only activate users in your tenant');
      }
    }

    if (user.isActive) {
      throw new CustomError('User is already active', 400);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    // Log activity
    await this.logActivity('user:activated', user.id, activatorId, {
      userEmail: user.email,
    });

    return updatedUser;
  }

  // Deactivate user
  async deactivateUser(userId: string, deactivatorId: string): Promise<User> {
    const deactivator = await prisma.user.findUnique({
      where: { id: deactivatorId },
    });

    if (!deactivator) {
      throw createNotFoundError('Deactivator User');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check access permissions
    if (deactivator.role !== 'SUPER_ADMIN') {
      if (deactivator.tenantId !== user.tenantId) {
        throw createForbiddenError('You can only deactivate users in your tenant');
      }
    }

    if (!user.isActive) {
      throw new CustomError('User is already inactive', 400);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        status: 'INACTIVE',
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        factory: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    // Log activity
    await this.logActivity('user:deactivated', user.id, deactivatorId, {
      userEmail: user.email,
    });

    return updatedUser;
  }

  // Assign role to user
  async assignRoleToUser(
    userId: string,
    roleId: string,
    assignerId: string
  ): Promise<void> {
    const assigner = await prisma.user.findUnique({
      where: { id: assignerId },
    });

    if (!assigner) {
      throw createNotFoundError('Assigner User');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw createNotFoundError('Role');
    }

    // Check access permissions
    if (assigner.role !== 'SUPER_ADMIN') {
      if (assigner.tenantId !== user.tenantId || assigner.tenantId !== role.tenantId) {
        throw createForbiddenError('You can only assign roles to users in your tenant');
      }
    }

    // Check if role is already assigned
    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: userId,
          roleId: roleId,
        },
      },
    });

    if (existingUserRole) {
      throw new CustomError('Role is already assigned to this user', 409);
    }

    // Assign role
    await prisma.userRole.create({
      data: {
        userId: userId,
        roleId: roleId,
        assignedById: assignerId,
        tenantId: assigner.tenantId,
      },
    });

    // Log activity
    await this.logActivity('user:role_assigned', user.id, assignerId, {
      userEmail: user.email,
      roleName: role.name,
    });
  }

  // Remove role from user
  async removeRoleFromUser(
    userId: string,
    roleId: string,
    removerId: string
  ): Promise<void> {
    const remover = await prisma.user.findUnique({
      where: { id: removerId },
    });

    if (!remover) {
      throw createNotFoundError('Remover User');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw createNotFoundError('Role');
    }

    // Check access permissions
    if (remover.role !== 'SUPER_ADMIN') {
      if (remover.tenantId !== user.tenantId || remover.tenantId !== role.tenantId) {
        throw createForbiddenError('You can only remove roles from users in your tenant');
      }
    }

    // Check if role is assigned
    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: userId,
          roleId: roleId,
        },
      },
    });

    if (!existingUserRole) {
      throw new CustomError('Role is not assigned to this user', 404);
    }

    // Remove role
    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId: userId,
          roleId: roleId,
        },
      },
    });

    // Log activity
    await this.logActivity('user:role_removed', user.id, removerId, {
      userEmail: user.email,
      roleName: role.name,
    });
  }

  // Get user statistics
  async getUserStats(userId?: string): Promise<UserStats> {
    const user = userId ? await prisma.user.findUnique({
      where: { id: userId },
    }) : null;

    if (userId && !user) {
      throw createNotFoundError('User');
    }

    // Build where clause
    const where: any = {};

    if (user) {
      where.tenantId = user.tenantId;
    }

    // Get statistics
    const [
      total,
      active,
      inactive,
      byRole,
      byStatus,
      byFactory,
      byDepartment,
      recentUsers,
      newUsersThisMonth,
      newUsersThisWeek,
    ] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, isActive: true } }),
      prisma.user.count({ where: { ...where, isActive: false } }),
      prisma.user.groupBy({
        by: ['role'],
        where,
        _count: { role: true },
      }),
      prisma.user.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      prisma.user.groupBy({
        by: ['factoryId'],
        where: { ...where, factoryId: { not: null } },
        _count: { factoryId: true },
      }),
      prisma.user.groupBy({
        by: ['department'],
        where: { ...where, department: { not: null } },
        _count: { department: true },
      }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      }),
      prisma.user.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.user.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Get factory names for byFactory stats
    const factoryIds = byFactory.map(item => item.factoryId).filter(Boolean);
    const factories = await prisma.factory.findMany({
      where: { id: { in: factoryIds } },
      select: { id: true, name: true },
    });

    const factoryMap = new Map(factories.map(f => [f.id, f.name]));

    return {
      total,
      active,
      inactive,
      byRole: byRole.map(item => ({
        role: item.role,
        count: item._count.role,
      })),
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      byFactory: byFactory.map(item => ({
        factoryId: item.factoryId || '',
        factoryName: factoryMap.get(item.factoryId || '') || 'Unknown',
        count: item._count.factoryId,
      })),
      byDepartment: byDepartment.map(item => ({
        department: item.department || 'Unknown',
        count: item._count.department,
      })),
      recentUsers,
      newUsersThisMonth,
      newUsersThisWeek,
    };
  }

  // Get user activity
  async getUserActivity(
    userId: string,
    requesterId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
    });

    if (!requester) {
      throw createNotFoundError('Requester User');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check access permissions
    if (requester.role !== 'SUPER_ADMIN') {
      if (requester.tenantId !== user.tenantId) {
        throw createForbiddenError('You can only view activity for users in your tenant');
      }
    }

    // Get user activity
    const skip = (page - 1) * limit;
    const total = await prisma.activity.count({
      where: { userId: userId },
    });

    const activities = await prisma.activity.findMany({
      where: { userId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        resource: true,
        metadata: true,
        createdAt: true,
      },
    });

    return {
      data: activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Log activity
  private async logActivity(
    action: string,
    resourceId: string,
    userId: string,
    metadata: any
  ): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tenantId: true, factoryId: true },
      });

      await prisma.activity.create({
        data: {
          type: 'USER_MANAGEMENT',
          title: `User Management ${action}`,
          description: `User Management ${action} by user`,
          resource: resourceId,
          metadata,
          userId,
          tenantId: user?.tenantId || '',
          factoryId: user?.factoryId || '',
        },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}

export const userManagementService = new UserManagementService();
