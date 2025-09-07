// Test data fixtures for E2E tests

export interface TestUser {
  email: string;
  password: string;
  role: string;
  name: string;
  id?: string;
}

export interface TestFactory {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
}

export interface TestDocument {
  id: string;
  title: string;
  type: string;
  status: string;
  factoryId: string;
  content?: string;
}

export interface TestGrievance {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  factoryId: string;
  reporterId: string;
}

export interface TestAudit {
  id: string;
  title: string;
  type: string;
  status: string;
  factoryId: string;
  auditorId: string;
  scheduledDate: string;
}

export const testUsers: TestUser[] = [
  {
    email: 'admin@test.com',
    password: 'Test123!',
    role: 'super_admin',
    name: 'Test Admin',
    id: 'test-admin-1'
  },
  {
    email: 'factory.admin@test.com',
    password: 'Test123!',
    role: 'factory_admin',
    name: 'Test Factory Admin',
    id: 'test-factory-admin-1'
  },
  {
    email: 'worker@test.com',
    password: 'Test123!',
    role: 'worker',
    name: 'Test Worker',
    id: 'test-worker-1'
  },
  {
    email: 'auditor@test.com',
    password: 'Test123!',
    role: 'auditor',
    name: 'Test Auditor',
    id: 'test-auditor-1'
  },
  {
    email: 'hr.staff@test.com',
    password: 'Test123!',
    role: 'hr_staff',
    name: 'Test HR Staff',
    id: 'test-hr-staff-1'
  },
  {
    email: 'grievance.committee@test.com',
    password: 'Test123!',
    role: 'grievance_committee',
    name: 'Test Grievance Committee',
    id: 'test-grievance-committee-1'
  }
];

export const testFactories: TestFactory[] = [
  {
    id: 'test-factory-1',
    name: 'Test Factory 1',
    address: '123 Test Street, Phnom Penh, Cambodia',
    contactEmail: 'contact@testfactory1.com',
    contactPhone: '+855123456789',
    status: 'active'
  },
  {
    id: 'test-factory-2',
    name: 'Test Factory 2',
    address: '456 Test Avenue, Siem Reap, Cambodia',
    contactEmail: 'contact@testfactory2.com',
    contactPhone: '+855987654321',
    status: 'active'
  },
  {
    id: 'test-factory-3',
    name: 'Test Factory 3',
    address: '789 Test Boulevard, Battambang, Cambodia',
    contactEmail: 'contact@testfactory3.com',
    contactPhone: '+855555555555',
    status: 'inactive'
  }
];

export const testDocuments: TestDocument[] = [
  {
    id: 'test-doc-1',
    title: 'Test Policy Document',
    type: 'policy',
    status: 'approved',
    factoryId: 'test-factory-1',
    content: 'This is a test policy document for E2E testing.'
  },
  {
    id: 'test-doc-2',
    title: 'Test Procedure Document',
    type: 'procedure',
    status: 'pending',
    factoryId: 'test-factory-1',
    content: 'This is a test procedure document for E2E testing.'
  },
  {
    id: 'test-doc-3',
    title: 'Test Training Material',
    type: 'training',
    status: 'draft',
    factoryId: 'test-factory-1',
    content: 'This is a test training material for E2E testing.'
  }
];

export const testGrievances: TestGrievance[] = [
  {
    id: 'test-grievance-1',
    title: 'Test Grievance - Safety Issue',
    description: 'This is a test grievance about safety issues for E2E testing.',
    priority: 'high',
    status: 'open',
    factoryId: 'test-factory-1',
    reporterId: 'test-worker-1'
  },
  {
    id: 'test-grievance-2',
    title: 'Test Grievance - Working Conditions',
    description: 'This is a test grievance about working conditions for E2E testing.',
    priority: 'medium',
    status: 'in_progress',
    factoryId: 'test-factory-1',
    reporterId: 'test-worker-2'
  },
  {
    id: 'test-grievance-3',
    title: 'Test Grievance - Pay Issue',
    description: 'This is a test grievance about pay issues for E2E testing.',
    priority: 'low',
    status: 'resolved',
    factoryId: 'test-factory-1',
    reporterId: 'test-worker-3'
  }
];

export const testAudits: TestAudit[] = [
  {
    id: 'test-audit-1',
    title: 'Test Compliance Audit',
    type: 'compliance',
    status: 'scheduled',
    factoryId: 'test-factory-1',
    auditorId: 'test-auditor-1',
    scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'test-audit-2',
    title: 'Test Safety Audit',
    type: 'safety',
    status: 'completed',
    factoryId: 'test-factory-1',
    auditorId: 'test-auditor-1',
    scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'test-audit-3',
    title: 'Test Environmental Audit',
    type: 'environmental',
    status: 'in_progress',
    factoryId: 'test-factory-1',
    auditorId: 'test-auditor-1',
    scheduledDate: new Date().toISOString()
  }
];

export const testCAPs = [
  {
    id: 'test-cap-1',
    title: 'Test Corrective Action Plan 1',
    description: 'This is a test CAP for E2E testing.',
    status: 'open',
    priority: 'high',
    factoryId: 'test-factory-1',
    assignedTo: 'test-factory-admin-1',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'test-cap-2',
    title: 'Test Corrective Action Plan 2',
    description: 'This is another test CAP for E2E testing.',
    status: 'in_progress',
    priority: 'medium',
    factoryId: 'test-factory-1',
    assignedTo: 'test-hr-staff-1',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const testTrainings = [
  {
    id: 'test-training-1',
    title: 'Test Safety Training',
    description: 'This is a test safety training for E2E testing.',
    type: 'safety',
    status: 'scheduled',
    factoryId: 'test-factory-1',
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'test-training-2',
    title: 'Test Compliance Training',
    description: 'This is a test compliance training for E2E testing.',
    type: 'compliance',
    status: 'completed',
    factoryId: 'test-factory-1',
    scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const testPermits = [
  {
    id: 'test-permit-1',
    title: 'Test Business License',
    type: 'business_license',
    status: 'active',
    factoryId: 'test-factory-1',
    issueDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'test-permit-2',
    title: 'Test Environmental Permit',
    type: 'environmental_permit',
    status: 'expired',
    factoryId: 'test-factory-1',
    issueDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper functions to get test data
export function getTestUser(role: string): TestUser | undefined {
  return testUsers.find(user => user.role === role);
}

export function getTestFactory(id: string): TestFactory | undefined {
  return testFactories.find(factory => factory.id === id);
}

export function getTestDocument(id: string): TestDocument | undefined {
  return testDocuments.find(doc => doc.id === id);
}

export function getTestGrievance(id: string): TestGrievance | undefined {
  return testGrievances.find(grievance => grievance.id === id);
}

export function getTestAudit(id: string): TestAudit | undefined {
  return testAudits.find(audit => audit.id === id);
}

// Generate random test data
export function generateRandomEmail(): string {
  const randomId = Math.random().toString(36).substring(7);
  return `test-${randomId}@example.com`;
}

export function generateRandomName(): string {
  const firstNames = ['John', 'Jane', 'David', 'Sarah', 'Michael', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

export function generateRandomFactoryName(): string {
  const adjectives = ['Modern', 'Advanced', 'Efficient', 'Sustainable', 'Innovative'];
  const nouns = ['Manufacturing', 'Production', 'Industrial', 'Textile', 'Garment'];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun} Factory`;
}
