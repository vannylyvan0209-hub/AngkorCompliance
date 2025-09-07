import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const requestCount = new Counter('request_count');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
    error_rate: ['rate<0.1'],         // Custom error rate threshold
    response_time: ['p(95)<500'],     // Custom response time threshold
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const FRONTEND_URL = __ENV.FRONTEND_URL || 'http://localhost:5173';

// Test data
const testUsers = [
  { email: 'admin@test.com', password: 'Test123!' },
  { email: 'factory.admin@test.com', password: 'Test123!' },
  { email: 'worker@test.com', password: 'Test123!' },
  { email: 'auditor@test.com', password: 'Test123!' },
];

// Authentication token storage
let authToken = null;

export function setup() {
  console.log('🚀 Starting load test setup...');
  
  // Test API connectivity
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    throw new Error('API health check failed');
  }
  
  console.log('✅ API health check passed');
  return { baseUrl: BASE_URL, frontendUrl: FRONTEND_URL };
}

export default function(data) {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  
  // Test 1: Authentication
  testAuthentication(user, data.baseUrl);
  
  // Test 2: API Endpoints
  testApiEndpoints(data.baseUrl);
  
  // Test 3: Frontend Pages
  testFrontendPages(data.frontendUrl);
  
  // Test 4: Database Operations
  testDatabaseOperations(data.baseUrl);
  
  // Test 5: File Operations
  testFileOperations(data.baseUrl);
  
  sleep(1); // Wait 1 second between iterations
}

function testAuthentication(user, baseUrl) {
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password
  });
  
  const loginResponse = http.post(`${baseUrl}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const loginSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500,
    'login has token': (r) => r.json('token') !== undefined,
  });
  
  if (loginSuccess) {
    authToken = loginResponse.json('token');
  }
  
  errorRate.add(!loginSuccess);
  responseTime.add(loginResponse.timings.duration);
  requestCount.add(1);
  
  sleep(0.5);
}

function testApiEndpoints(baseUrl) {
  if (!authToken) return;
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
  
  // Test dashboard endpoint
  const dashboardResponse = http.get(`${baseUrl}/api/dashboard`, { headers });
  check(dashboardResponse, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  // Test users endpoint
  const usersResponse = http.get(`${baseUrl}/api/users`, { headers });
  check(usersResponse, {
    'users status is 200': (r) => r.status === 200,
    'users response time < 400ms': (r) => r.timings.duration < 400,
  });
  
  // Test factories endpoint
  const factoriesResponse = http.get(`${baseUrl}/api/factories`, { headers });
  check(factoriesResponse, {
    'factories status is 200': (r) => r.status === 200,
    'factories response time < 400ms': (r) => r.timings.duration < 400,
  });
  
  // Test grievances endpoint
  const grievancesResponse = http.get(`${baseUrl}/api/grievances`, { headers });
  check(grievancesResponse, {
    'grievances status is 200': (r) => r.status === 200,
    'grievances response time < 400ms': (r) => r.timings.duration < 400,
  });
  
  // Test audits endpoint
  const auditsResponse = http.get(`${baseUrl}/api/audits`, { headers });
  check(auditsResponse, {
    'audits status is 200': (r) => r.status === 200,
    'audits response time < 400ms': (r) => r.timings.duration < 400,
  });
  
  errorRate.add(dashboardResponse.status !== 200 || usersResponse.status !== 200 || 
                factoriesResponse.status !== 200 || grievancesResponse.status !== 200 || 
                auditsResponse.status !== 200);
  
  responseTime.add(dashboardResponse.timings.duration);
  requestCount.add(5);
  
  sleep(0.5);
}

function testFrontendPages(frontendUrl) {
  // Test main pages
  const pages = [
    '/',
    '/login',
    '/dashboard',
    '/factories',
    '/grievances',
    '/audits',
    '/users',
    '/reports'
  ];
  
  pages.forEach(page => {
    const response = http.get(`${frontendUrl}${page}`);
    check(response, {
      [`${page} status is 200`]: (r) => r.status === 200,
      [`${page} response time < 1000ms`]: (r) => r.timings.duration < 1000,
      [`${page} has content`]: (r) => r.body.length > 0,
    });
    
    errorRate.add(response.status !== 200);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  });
  
  sleep(0.5);
}

function testDatabaseOperations(baseUrl) {
  if (!authToken) return;
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
  
  // Test database-heavy operations
  const operations = [
    { url: '/api/dashboard/analytics', name: 'analytics' },
    { url: '/api/reports/summary', name: 'reports' },
    { url: '/api/audits/statistics', name: 'audit-stats' },
    { url: '/api/grievances/statistics', name: 'grievance-stats' }
  ];
  
  operations.forEach(op => {
    const response = http.get(`${baseUrl}${op.url}`, { headers });
    check(response, {
      [`${op.name} status is 200`]: (r) => r.status === 200,
      [`${op.name} response time < 1000ms`]: (r) => r.timings.duration < 1000,
    });
    
    errorRate.add(response.status !== 200);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  });
  
  sleep(0.5);
}

function testFileOperations(baseUrl) {
  if (!authToken) return;
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
  };
  
  // Test file upload endpoint
  const fileData = 'test file content';
  const fileResponse = http.post(`${baseUrl}/api/files/upload`, fileData, {
    headers: {
      ...headers,
      'Content-Type': 'text/plain'
    }
  });
  
  check(fileResponse, {
    'file upload status is 200 or 400': (r) => r.status === 200 || r.status === 400,
    'file upload response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  
  errorRate.add(fileResponse.status >= 500);
  responseTime.add(fileResponse.timings.duration);
  requestCount.add(1);
  
  sleep(0.5);
}

export function teardown(data) {
  console.log('🧹 Load test teardown completed');
  console.log(`📊 Total requests: ${requestCount.count}`);
  console.log(`⏱️ Average response time: ${responseTime.avg}ms`);
  console.log(`❌ Error rate: ${(errorRate.rate * 100).toFixed(2)}%`);
}
