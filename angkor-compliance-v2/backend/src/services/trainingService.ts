import { prisma } from '../index';
import { Training, TrainingStatus, TrainingType, TrainingMaterial, TrainingAttendance, TrainingAssessment } from '@prisma/client';
import { CustomError, createNotFoundError, createForbiddenError } from '../middleware/errorHandler';

export interface CreateTrainingData {
  title: string;
  description: string;
  type: TrainingType;
  category: string;
  duration: number; // in minutes
  factoryId: string;
  department?: string;
  targetAudience: string[];
  objectives: string[];
  prerequisites?: string[];
  materials?: string[];
  assessmentRequired: boolean;
  passingScore?: number;
  validityPeriod?: number; // in days
  instructorId?: string;
  scheduledDate?: Date;
  location?: string;
  maxParticipants?: number;
  metadata?: Record<string, any>;
}

export interface UpdateTrainingData {
  title?: string;
  description?: string;
  type?: TrainingType;
  category?: string;
  duration?: number;
  department?: string;
  targetAudience?: string[];
  objectives?: string[];
  prerequisites?: string[];
  materials?: string[];
  assessmentRequired?: boolean;
  passingScore?: number;
  validityPeriod?: number;
  instructorId?: string;
  scheduledDate?: Date;
  location?: string;
  maxParticipants?: number;
  status?: TrainingStatus;
  metadata?: Record<string, any>;
}

export interface TrainingFilters {
  search?: string;
  type?: TrainingType;
  category?: string;
  status?: TrainingStatus;
  factoryId?: string;
  department?: string;
  instructorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTrainingResponse {
  data: Training[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTrainingMaterialData {
  title: string;
  type: 'DOCUMENT' | 'VIDEO' | 'PRESENTATION' | 'QUIZ' | 'OTHER';
  content?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  order: number;
  isRequired: boolean;
  estimatedTime?: number; // in minutes
}

export interface CreateTrainingAssessmentData {
  title: string;
  description: string;
  questions: Array<{
    question: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
    options?: string[];
    correctAnswer?: string;
    points: number;
  }>;
  passingScore: number;
  timeLimit?: number; // in minutes
  attemptsAllowed: number;
}

class TrainingService {
  // Create a new training
  async createTraining(data: CreateTrainingData, userId: string): Promise<Training> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Only super admin, factory admin, or HR staff can create trainings
    if (!['SUPER_ADMIN', 'FACTORY_ADMIN', 'HR_STAFF'].includes(user.role)) {
      throw createForbiddenError('You do not have permission to create trainings');
    }

    // Validate factory access
    if (user.role !== 'SUPER_ADMIN') {
      if (user.role === 'FACTORY_ADMIN' && user.factoryId !== data.factoryId) {
        throw createForbiddenError('You can only create trainings for your assigned factory');
      }
    }

    // Validate factory exists
    const factory = await prisma.factory.findUnique({
      where: { id: data.factoryId },
    });

    if (!factory) {
      throw createNotFoundError('Factory');
    }

    // Validate instructor if provided
    if (data.instructorId) {
      const instructor = await prisma.user.findUnique({
        where: { id: data.instructorId },
      });

      if (!instructor || !instructor.isActive) {
        throw new CustomError('Instructor is invalid or inactive', 400);
      }
    }

    // Create training
    const training = await prisma.training.create({
      data: {
        ...data,
        createdById: userId,
        tenantId: user.tenantId,
        status: 'DRAFT',
        targetAudience: data.targetAudience,
        objectives: data.objectives,
        prerequisites: data.prerequisites || [],
        materials: data.materials || [],
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
        instructor: {
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
        _count: {
          select: {
            materials: true,
            assessments: true,
            attendances: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('training:created', training.id, userId, {
      trainingTitle: training.title,
      trainingType: training.type,
      factoryName: factory.name,
    });

    return training;
  }

  // Get all trainings with filtering and pagination
  async getTrainings(
    filters: TrainingFilters,
    userId: string
  ): Promise<PaginatedTrainingResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const {
      search,
      type,
      category,
      status,
      factoryId,
      department,
      instructorId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
    };

    // Super admin can see all trainings, others only see their tenant's trainings
    if (user.role !== 'SUPER_ADMIN') {
      // Factory admin can only see trainings from their factory
      if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
        where.factoryId = user.factoryId;
      }
    }

    if (factoryId) {
      where.factoryId = factoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (department) {
      where.department = department;
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    if (dateFrom || dateTo) {
      where.scheduledDate = {};
      if (dateFrom) where.scheduledDate.gte = dateFrom;
      if (dateTo) where.scheduledDate.lte = dateTo;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await prisma.training.count({ where });

    // Get trainings
    const trainings = await prisma.training.findMany({
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
        instructor: {
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
        _count: {
          select: {
            materials: true,
            assessments: true,
            attendances: true,
          },
        },
      },
    });

    return {
      data: trainings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get training by ID
  async getTrainingById(trainingId: string, userId: string): Promise<Training> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Build where clause based on user role
    const where: any = {
      id: trainingId,
      tenantId: user.tenantId,
    };

    if (user.role !== 'SUPER_ADMIN') {
      if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
        where.factoryId = user.factoryId;
      }
    }

    const training = await prisma.training.findFirst({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        instructor: {
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
        materials: {
          orderBy: { order: 'asc' },
        },
        assessments: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
        attendances: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { attendedAt: 'desc' },
        },
        _count: {
          select: {
            materials: true,
            assessments: true,
            attendances: true,
          },
        },
      },
    });

    if (!training) {
      throw createNotFoundError('Training');
    }

    return training;
  }

  // Update training
  async updateTraining(
    trainingId: string,
    data: UpdateTrainingData,
    userId: string
  ): Promise<Training> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    // Check if user has permission to update this training
    const existingTraining = await prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!existingTraining) {
      throw createNotFoundError('Training');
    }

    // Check access permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== existingTraining.tenantId) {
        throw createForbiddenError('You can only update trainings in your tenant');
      }
      if (user.role === 'FACTORY_ADMIN' && user.factoryId !== existingTraining.factoryId) {
        throw createForbiddenError('You can only update trainings in your assigned factory');
      }
    }

    // Update training
    const training = await prisma.training.update({
      where: { id: trainingId },
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
        instructor: {
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
        _count: {
          select: {
            materials: true,
            assessments: true,
            attendances: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('training:updated', training.id, userId, {
      trainingTitle: training.title,
      changes: data,
    });

    return training;
  }

  // Schedule training
  async scheduleTraining(
    trainingId: string,
    scheduledDate: Date,
    location: string,
    userId: string
  ): Promise<Training> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const training = await prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      throw createNotFoundError('Training');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== training.tenantId) {
        throw createForbiddenError('You can only schedule trainings in your tenant');
      }
    }

    if (training.status !== 'DRAFT') {
      throw new CustomError('Only draft trainings can be scheduled', 400);
    }

    // Update training
    const updatedTraining = await prisma.training.update({
      where: { id: trainingId },
      data: {
        status: 'SCHEDULED',
        scheduledDate,
        location,
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
        instructor: {
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
      },
    });

    // Log activity
    await this.logActivity('training:scheduled', training.id, userId, {
      trainingTitle: training.title,
      scheduledDate,
      location,
    });

    return updatedTraining;
  }

  // Start training
  async startTraining(trainingId: string, userId: string): Promise<Training> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const training = await prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      throw createNotFoundError('Training');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== training.tenantId) {
        throw createForbiddenError('You can only start trainings in your tenant');
      }
    }

    if (training.status !== 'SCHEDULED') {
      throw new CustomError('Only scheduled trainings can be started', 400);
    }

    // Update training
    const updatedTraining = await prisma.training.update({
      where: { id: trainingId },
      data: {
        status: 'IN_PROGRESS',
        actualStartDate: new Date(),
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
        instructor: {
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
      },
    });

    // Log activity
    await this.logActivity('training:started', training.id, userId, {
      trainingTitle: training.title,
    });

    return updatedTraining;
  }

  // Complete training
  async completeTraining(trainingId: string, userId: string): Promise<Training> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const training = await prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      throw createNotFoundError('Training');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== training.tenantId) {
        throw createForbiddenError('You can only complete trainings in your tenant');
      }
    }

    if (training.status !== 'IN_PROGRESS') {
      throw new CustomError('Only in-progress trainings can be completed', 400);
    }

    // Update training
    const updatedTraining = await prisma.training.update({
      where: { id: trainingId },
      data: {
        status: 'COMPLETED',
        actualEndDate: new Date(),
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
        instructor: {
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
      },
    });

    // Log activity
    await this.logActivity('training:completed', training.id, userId, {
      trainingTitle: training.title,
    });

    return updatedTraining;
  }

  // Add training material
  async addTrainingMaterial(
    trainingId: string,
    data: CreateTrainingMaterialData,
    userId: string
  ): Promise<TrainingMaterial> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const training = await prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      throw createNotFoundError('Training');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== training.tenantId) {
        throw createForbiddenError('You can only add materials to trainings in your tenant');
      }
    }

    // Create training material
    const material = await prisma.trainingMaterial.create({
      data: {
        ...data,
        trainingId,
        createdById: userId,
        tenantId: user.tenantId,
        factoryId: training.factoryId,
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
        training: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('training_material:created', material.id, userId, {
      materialTitle: material.title,
      trainingTitle: training.title,
    });

    return material;
  }

  // Add training assessment
  async addTrainingAssessment(
    trainingId: string,
    data: CreateTrainingAssessmentData,
    userId: string
  ): Promise<TrainingAssessment> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const training = await prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      throw createNotFoundError('Training');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== training.tenantId) {
        throw createForbiddenError('You can only add assessments to trainings in your tenant');
      }
    }

    // Create training assessment
    const assessment = await prisma.trainingAssessment.create({
      data: {
        ...data,
        trainingId,
        createdById: userId,
        tenantId: user.tenantId,
        factoryId: training.factoryId,
        questions: {
          create: data.questions.map((q, index) => ({
            ...q,
            order: index + 1,
            createdById: userId,
            tenantId: user.tenantId,
            factoryId: training.factoryId,
          })),
        },
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
        training: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    // Log activity
    await this.logActivity('training_assessment:created', assessment.id, userId, {
      assessmentTitle: assessment.title,
      trainingTitle: training.title,
    });

    return assessment;
  }

  // Record training attendance
  async recordAttendance(
    trainingId: string,
    userId: string,
    attendedBy: string
  ): Promise<TrainingAttendance> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    const training = await prisma.training.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      throw createNotFoundError('Training');
    }

    // Check permissions
    if (user.role !== 'SUPER_ADMIN') {
      if (user.tenantId !== training.tenantId) {
        throw createForbiddenError('You can only record attendance for trainings in your tenant');
      }
    }

    // Check if user already attended
    const existingAttendance = await prisma.trainingAttendance.findFirst({
      where: {
        trainingId,
        userId: attendedBy,
      },
    });

    if (existingAttendance) {
      throw new CustomError('User has already attended this training', 400);
    }

    // Create attendance record
    const attendance = await prisma.trainingAttendance.create({
      data: {
        trainingId,
        userId: attendedBy,
        recordedById: userId,
        tenantId: user.tenantId,
        factoryId: training.factoryId,
        attendedAt: new Date(),
        status: 'PRESENT',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        recordedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        training: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity('training_attendance:recorded', attendance.id, userId, {
      trainingTitle: training.title,
      attendedBy: attendance.user.firstName + ' ' + attendance.user.lastName,
    });

    return attendance;
  }

  // Get training statistics
  async getTrainingStats(factoryId?: string, userId?: string): Promise<any> {
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
      
      if (user.role !== 'SUPER_ADMIN') {
        if (user.role === 'FACTORY_ADMIN' && user.factoryId) {
          where.factoryId = user.factoryId;
        }
      }
    }

    if (factoryId) {
      where.factoryId = factoryId;
    }

    // Get statistics
    const [
      totalTrainings,
      completedTrainings,
      inProgressTrainings,
      scheduledTrainings,
      draftTrainings,
      trainingsByType,
      trainingsByStatus,
      totalAttendances,
      recentTrainings,
    ] = await Promise.all([
      prisma.training.count({ where }),
      prisma.training.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.training.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.training.count({ where: { ...where, status: 'SCHEDULED' } }),
      prisma.training.count({ where: { ...where, status: 'DRAFT' } }),
      prisma.training.groupBy({
        by: ['type'],
        where,
        _count: { type: true },
      }),
      prisma.training.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      prisma.trainingAttendance.count({
        where: {
          training: where,
        },
      }),
      prisma.training.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          factory: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      }),
    ]);

    return {
      stats: {
        total: totalTrainings,
        completed: completedTrainings,
        inProgress: inProgressTrainings,
        scheduled: scheduledTrainings,
        draft: draftTrainings,
        totalAttendances,
      },
      byType: trainingsByType.map(item => ({
        type: item.type,
        count: item._count.type,
      })),
      byStatus: trainingsByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      recent: recentTrainings,
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
          type: 'TRAINING',
          title: `Training ${action}`,
          description: `Training ${action} by user`,
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

export const trainingService = new TrainingService();
