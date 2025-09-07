import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import factoryRoutes from './routes/factories';
import documentRoutes from './routes/documents';
import auditRoutes from './routes/audits';
import grievanceRoutes from './routes/grievances';
import trainingRoutes from './routes/trainings';
import permitRoutes from './routes/permits';
import notificationRoutes from './routes/notifications';
import complianceStandardsRoutes from './routes/complianceStandards';
import correctiveActionRoutes from './routes/correctiveActions';
import userManagementRoutes from './routes/userManagement';
import activityLoggingRoutes from './routes/activityLogging';
import dashboardAnalyticsRoutes from './routes/dashboardAnalytics';
import exportRoutes from './routes/exports';
import emailNotificationRoutes from './routes/emailNotifications';
import fileStorageRoutes from './routes/fileStorage';
import backupRoutes from './routes/backups';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Prisma client
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Initialize Redis client
export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Connect to Redis
redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom middleware
app.use(requestLogger);
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/factories', factoryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/permits', permitRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/compliance-standards', complianceStandardsRoutes);
app.use('/api/corrective-actions', correctiveActionRoutes);
app.use('/api/users', userManagementRoutes);
app.use('/api/activities', activityLoggingRoutes);
app.use('/api/dashboard', dashboardAnalyticsRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/email-notifications', emailNotificationRoutes);
app.use('/api/file-storage', fileStorageRoutes);
app.use('/api/backups', backupRoutes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Angkor Compliance Platform API',
    version: '2.0.0',
    description: 'AI-powered factory compliance management system',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      factories: '/api/factories',
      documents: '/api/documents',
      audits: '/api/audits',
      grievances: '/api/grievances',
      trainings: '/api/trainings',
      permits: '/api/permits',
      notifications: '/api/notifications',
      complianceStandards: '/api/compliance-standards',
      correctiveActions: '/api/corrective-actions',
      userManagement: '/api/users',
      activityLogging: '/api/activities',
      dashboardAnalytics: '/api/dashboard',
      exports: '/api/exports',
      emailNotifications: '/api/email-notifications',
      fileStorage: '/api/file-storage',
      backups: '/api/backups',
    },
    authentication: {
      type: 'Bearer Token (JWT)',
      header: 'Authorization: Bearer <token>',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Close Redis connection
    await redis.quit();
    console.log('✅ Redis connection closed');
    
    // Close Prisma connection
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
    
    // Close server
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await redis.connect();
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
