import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { domain: 'angkor-compliance.com' },
    update: {},
    create: {
      name: 'Angkor Compliance Platform',
      domain: 'angkor-compliance.com',
      settings: {
        theme: 'light',
        language: 'en',
        timezone: 'Asia/Phnom_Penh',
        features: ['audits', 'grievances', 'training', 'permits', 'documents'],
        limits: {
          maxFactories: 100,
          maxUsers: 1000,
          maxStorage: 1000000000, // 1GB
        },
      },
    },
  });

  console.log('✅ Created tenant:', tenant.name);

  // Create default factory
  const factory = await prisma.factory.upsert({
    where: { code: 'DEMO-FACTORY-001' },
    update: {},
    create: {
      name: 'Demo Garment Factory',
      code: 'DEMO-FACTORY-001',
      address: 'Phnom Penh, Cambodia',
      country: 'Cambodia',
      industry: 'Garment Manufacturing',
      size: 500,
      tenantId: tenant.id,
    },
  });

  console.log('✅ Created factory:', factory.name);

  // Create permissions
  const permissions = [
    // User management
    { name: 'users:read', resource: 'users', action: 'read', description: 'View users' },
    { name: 'users:create', resource: 'users', action: 'create', description: 'Create users' },
    { name: 'users:update', resource: 'users', action: 'update', description: 'Update users' },
    { name: 'users:delete', resource: 'users', action: 'delete', description: 'Delete users' },
    
    // Factory management
    { name: 'factories:read', resource: 'factories', action: 'read', description: 'View factories' },
    { name: 'factories:create', resource: 'factories', action: 'create', description: 'Create factories' },
    { name: 'factories:update', resource: 'factories', action: 'update', description: 'Update factories' },
    { name: 'factories:delete', resource: 'factories', action: 'delete', description: 'Delete factories' },
    
    // Document management
    { name: 'documents:read', resource: 'documents', action: 'read', description: 'View documents' },
    { name: 'documents:create', resource: 'documents', action: 'create', description: 'Upload documents' },
    { name: 'documents:update', resource: 'documents', action: 'update', description: 'Update documents' },
    { name: 'documents:delete', resource: 'documents', action: 'delete', description: 'Delete documents' },
    
    // Audit management
    { name: 'audits:read', resource: 'audits', action: 'read', description: 'View audits' },
    { name: 'audits:create', resource: 'audits', action: 'create', description: 'Create audits' },
    { name: 'audits:update', resource: 'audits', action: 'update', description: 'Update audits' },
    { name: 'audits:delete', resource: 'audits', action: 'delete', description: 'Delete audits' },
    
    // Grievance management
    { name: 'grievances:read', resource: 'grievances', action: 'read', description: 'View grievances' },
    { name: 'grievances:create', resource: 'grievances', action: 'create', description: 'Create grievances' },
    { name: 'grievances:update', resource: 'grievances', action: 'update', description: 'Update grievances' },
    { name: 'grievances:delete', resource: 'grievances', action: 'delete', description: 'Delete grievances' },
    
    // Training management
    { name: 'trainings:read', resource: 'trainings', action: 'read', description: 'View trainings' },
    { name: 'trainings:create', resource: 'trainings', action: 'create', description: 'Create trainings' },
    { name: 'trainings:update', resource: 'trainings', action: 'update', description: 'Update trainings' },
    { name: 'trainings:delete', resource: 'trainings', action: 'delete', description: 'Delete trainings' },
    
    // Permit management
    { name: 'permits:read', resource: 'permits', action: 'read', description: 'View permits' },
    { name: 'permits:create', resource: 'permits', action: 'create', description: 'Create permits' },
    { name: 'permits:update', resource: 'permits', action: 'update', description: 'Update permits' },
    { name: 'permits:delete', resource: 'permits', action: 'delete', description: 'Delete permits' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  console.log('✅ Created permissions:', permissions.length);

  // Create role permissions
  const rolePermissions = [
    // Super Admin - all permissions
    ...permissions.map(p => ({ role: 'SUPER_ADMIN' as UserRole, permissionName: p.name })),
    
    // Factory Admin - factory and user management
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'users:read' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'users:create' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'users:update' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'factories:read' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'factories:update' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'documents:read' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'documents:create' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'documents:update' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'audits:read' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'grievances:read' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'grievances:update' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'trainings:read' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'trainings:create' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'trainings:update' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'permits:read' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'permits:create' },
    { role: 'FACTORY_ADMIN' as UserRole, permissionName: 'permits:update' },
    
    // HR Staff - document and training management
    { role: 'HR_STAFF' as UserRole, permissionName: 'documents:read' },
    { role: 'HR_STAFF' as UserRole, permissionName: 'documents:create' },
    { role: 'HR_STAFF' as UserRole, permissionName: 'documents:update' },
    { role: 'HR_STAFF' as UserRole, permissionName: 'trainings:read' },
    { role: 'HR_STAFF' as UserRole, permissionName: 'trainings:create' },
    { role: 'HR_STAFF' as UserRole, permissionName: 'trainings:update' },
    { role: 'HR_STAFF' as UserRole, permissionName: 'permits:read' },
    { role: 'HR_STAFF' as UserRole, permissionName: 'permits:create' },
    { role: 'HR_STAFF' as UserRole, permissionName: 'permits:update' },
    
    // Grievance Committee - grievance management
    { role: 'GRIEVANCE_COMMITTEE' as UserRole, permissionName: 'grievances:read' },
    { role: 'GRIEVANCE_COMMITTEE' as UserRole, permissionName: 'grievances:create' },
    { role: 'GRIEVANCE_COMMITTEE' as UserRole, permissionName: 'grievances:update' },
    { role: 'GRIEVANCE_COMMITTEE' as UserRole, permissionName: 'documents:read' },
    
    // Auditor - audit and document management
    { role: 'AUDITOR' as UserRole, permissionName: 'audits:read' },
    { role: 'AUDITOR' as UserRole, permissionName: 'audits:create' },
    { role: 'AUDITOR' as UserRole, permissionName: 'audits:update' },
    { role: 'AUDITOR' as UserRole, permissionName: 'documents:read' },
    { role: 'AUDITOR' as UserRole, permissionName: 'factories:read' },
    
    // Analytics User - read-only access
    { role: 'ANALYTICS_USER' as UserRole, permissionName: 'audits:read' },
    { role: 'ANALYTICS_USER' as UserRole, permissionName: 'grievances:read' },
    { role: 'ANALYTICS_USER' as UserRole, permissionName: 'trainings:read' },
    { role: 'ANALYTICS_USER' as UserRole, permissionName: 'permits:read' },
    { role: 'ANALYTICS_USER' as UserRole, permissionName: 'factories:read' },
    
    // Worker - limited access
    { role: 'WORKER' as UserRole, permissionName: 'grievances:create' },
  ];

  for (const rolePermission of rolePermissions) {
    const permission = await prisma.permission.findUnique({
      where: { name: rolePermission.permissionName },
    });

    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          role_permissionId: {
            role: rolePermission.role,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          role: rolePermission.role,
          permissionId: permission.id,
        },
      });
    }
  }

  console.log('✅ Created role permissions:', rolePermissions.length);

  // Create default users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = [
    {
      email: 'admin@angkorcompliance.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN' as UserRole,
      factoryId: null,
    },
    {
      email: 'factory.admin@demo.com',
      firstName: 'Factory',
      lastName: 'Admin',
      role: 'FACTORY_ADMIN' as UserRole,
      factoryId: factory.id,
    },
    {
      email: 'hr.staff@demo.com',
      firstName: 'HR',
      lastName: 'Staff',
      role: 'HR_STAFF' as UserRole,
      factoryId: factory.id,
    },
    {
      email: 'grievance.committee@demo.com',
      firstName: 'Grievance',
      lastName: 'Committee',
      role: 'GRIEVANCE_COMMITTEE' as UserRole,
      factoryId: factory.id,
    },
    {
      email: 'auditor@demo.com',
      firstName: 'External',
      lastName: 'Auditor',
      role: 'AUDITOR' as UserRole,
      factoryId: null,
    },
    {
      email: 'analytics@demo.com',
      firstName: 'Analytics',
      lastName: 'User',
      role: 'ANALYTICS_USER' as UserRole,
      factoryId: null,
    },
    {
      email: 'worker@demo.com',
      firstName: 'Demo',
      lastName: 'Worker',
      role: 'WORKER' as UserRole,
      factoryId: factory.id,
    },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        passwordHash: hashedPassword,
        tenantId: tenant.id,
        isActive: true,
        isEmailVerified: true,
      },
    });
  }

  console.log('✅ Created users:', users.length);

  // Create compliance standards
  const standards = [
    {
      name: 'SMETA (Sedex Members Ethical Trade Audit)',
      code: 'SMETA',
      version: '6.1',
      description: 'Sedex Members Ethical Trade Audit standard for ethical trade practices',
    },
    {
      name: 'SA8000',
      code: 'SA8000',
      version: '2014',
      description: 'Social Accountability 8000 standard for workplace conditions',
    },
    {
      name: 'ISO 9001:2015',
      code: 'ISO9001',
      version: '2015',
      description: 'Quality management systems standard',
    },
    {
      name: 'ISO 14001:2015',
      code: 'ISO14001',
      version: '2015',
      description: 'Environmental management systems standard',
    },
    {
      name: 'ISO 45001:2018',
      code: 'ISO45001',
      version: '2018',
      description: 'Occupational health and safety management systems standard',
    },
  ];

  for (const standard of standards) {
    await prisma.complianceStandard.upsert({
      where: { code: standard.code },
      update: {},
      create: {
        ...standard,
        tenantId: tenant.id,
      },
    });
  }

  console.log('✅ Created compliance standards:', standards.length);

  // Create sample permits
  const permits = [
    {
      type: 'Business License',
      number: 'BL-2024-001',
      issuingAuthority: 'Ministry of Commerce',
      issueDate: new Date('2024-01-01'),
      expiryDate: new Date('2025-01-01'),
    },
    {
      type: 'Factory License',
      number: 'FL-2024-001',
      issuingAuthority: 'Ministry of Industry',
      issueDate: new Date('2024-01-01'),
      expiryDate: new Date('2025-01-01'),
    },
    {
      type: 'Fire Safety Certificate',
      number: 'FSC-2024-001',
      issuingAuthority: 'Ministry of Interior',
      issueDate: new Date('2024-01-01'),
      expiryDate: new Date('2025-01-01'),
    },
  ];

  for (const permit of permits) {
    await prisma.permit.upsert({
      where: { number: permit.number },
      update: {},
      create: {
        ...permit,
        tenantId: tenant.id,
        factoryId: factory.id,
      },
    });
  }

  console.log('✅ Created permits:', permits.length);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Default login credentials:');
  console.log('Super Admin: admin@angkorcompliance.com / password123');
  console.log('Factory Admin: factory.admin@demo.com / password123');
  console.log('HR Staff: hr.staff@demo.com / password123');
  console.log('Grievance Committee: grievance.committee@demo.com / password123');
  console.log('Auditor: auditor@demo.com / password123');
  console.log('Analytics User: analytics@demo.com / password123');
  console.log('Worker: worker@demo.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
