import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...');
  
  // Start browser for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Check if the application is running
    const title = await page.title();
    console.log(`✅ Application is ready with title: ${title}`);
    
    // Set up test data if needed
    console.log('📊 Setting up test data...');
    await setupTestData(page);
    
    console.log('✅ Global setup completed successfully');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData(page: any) {
  try {
    // Create test users if they don't exist
    const testUsers = [
      {
        email: 'admin@test.com',
        password: 'Test123!',
        role: 'super_admin',
        name: 'Test Admin'
      },
      {
        email: 'factory.admin@test.com',
        password: 'Test123!',
        role: 'factory_admin',
        name: 'Test Factory Admin'
      },
      {
        email: 'worker@test.com',
        password: 'Test123!',
        role: 'worker',
        name: 'Test Worker'
      },
      {
        email: 'auditor@test.com',
        password: 'Test123!',
        role: 'auditor',
        name: 'Test Auditor'
      }
    ];

    // Store test data in localStorage for tests to use
    await page.evaluate((users) => {
      localStorage.setItem('testUsers', JSON.stringify(users));
    }, testUsers);

    // Create test factories
    const testFactories = [
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
      }
    ];

    await page.evaluate((factories) => {
      localStorage.setItem('testFactories', JSON.stringify(factories));
    }, testFactories);

    // Create test documents
    const testDocuments = [
      {
        id: 'test-doc-1',
        title: 'Test Document 1',
        type: 'policy',
        status: 'approved',
        factoryId: 'test-factory-1'
      },
      {
        id: 'test-doc-2',
        title: 'Test Document 2',
        type: 'procedure',
        status: 'pending',
        factoryId: 'test-factory-1'
      }
    ];

    await page.evaluate((documents) => {
      localStorage.setItem('testDocuments', JSON.stringify(documents));
    }, testDocuments);

    // Create test grievances
    const testGrievances = [
      {
        id: 'test-grievance-1',
        title: 'Test Grievance 1',
        description: 'This is a test grievance for E2E testing',
        priority: 'high',
        status: 'open',
        factoryId: 'test-factory-1',
        reporterId: 'test-worker-1'
      },
      {
        id: 'test-grievance-2',
        title: 'Test Grievance 2',
        description: 'Another test grievance for E2E testing',
        priority: 'medium',
        status: 'in_progress',
        factoryId: 'test-factory-1',
        reporterId: 'test-worker-2'
      }
    ];

    await page.evaluate((grievances) => {
      localStorage.setItem('testGrievances', JSON.stringify(grievances));
    }, testGrievances);

    // Create test audits
    const testAudits = [
      {
        id: 'test-audit-1',
        title: 'Test Audit 1',
        type: 'compliance',
        status: 'scheduled',
        factoryId: 'test-factory-1',
        auditorId: 'test-auditor-1',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'test-audit-2',
        title: 'Test Audit 2',
        type: 'safety',
        status: 'completed',
        factoryId: 'test-factory-1',
        auditorId: 'test-auditor-1',
        scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    await page.evaluate((audits) => {
      localStorage.setItem('testAudits', JSON.stringify(audits));
    }, testAudits);

    console.log('✅ Test data setup completed');
  } catch (error) {
    console.error('❌ Test data setup failed:', error);
    // Don't throw here as test data setup is not critical
  }
}

export default globalSetup;
