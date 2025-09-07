import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics for authentication testing
const authErrorRate = new Rate('auth_error_rate');
const authResponseTime = new Trend('auth_response_time');
const authSuccessRate = new Rate('auth_success_rate');
const tokenRefreshRate = new Rate('token_refresh_rate');

// Test configuration for authentication load testing
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 concurrent users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 200 }, // Ramp up to 200 users
    { duration: '3m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    auth_response_time: ['p(95)<300'], // 95% of auth requests < 300ms
    auth_error_rate: ['rate<0.05'],    // Auth error rate < 5%
    auth_success_rate: ['rate>0.95'],  // Auth success rate > 95%
    token_refresh_rate: ['rate>0.98'], // Token refresh success > 98%
  },
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// Test user data
const testUsers = [
  { email: 'admin@test.com', password: 'Test123!', role: 'super_admin' },
  { email: 'factory.admin@test.com', password: 'Test123!', role: 'factory_admin' },
  { email: 'worker@test.com', password: 'Test123!', role: 'worker' },
  { email: 'auditor@test.com', password: 'Test123!', role: 'auditor' },
  { email: 'hr.staff@test.com', password: 'Test123!', role: 'hr_staff' },
  { email: 'grievance.committee@test.com', password: 'Test123!', role: 'grievance_committee' },
];

// Token storage for each virtual user
let userTokens = {};

export function setup() {
  console.log('🔐 Starting authentication load test setup...');
  
  // Test API connectivity
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    throw new Error('API health check failed');
  }
  
  console.log('✅ API health check passed');
  return { baseUrl: BASE_URL };
}

export default function(data) {
  const userId = __VU; // Virtual User ID
  const user = testUsers[userId % testUsers.length];
  
  // Test authentication flow
  testLogin(user, data.baseUrl);
  
  // Test token validation
  testTokenValidation(data.baseUrl);
  
  // Test token refresh
  testTokenRefresh(data.baseUrl);
  
  // Test logout
  testLogout(data.baseUrl);
  
  // Test concurrent login attempts
  testConcurrentLogin(user, data.baseUrl);
  
  sleep(0.5); // Wait 500ms between iterations
}

function testLogin(user, baseUrl) {
  const loginPayload = JSON.stringify({
    email: user.email,
    password: user.password
  });
  
  const loginResponse = http.post(`${baseUrl}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const loginSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 300ms': (r) => r.timings.duration < 300,
    'login has token': (r) => r.json('token') !== undefined,
    'login has user data': (r) => r.json('user') !== undefined,
    'login has correct role': (r) => r.json('user.role') === user.role,
  });
  
  if (loginSuccess) {
    userTokens[__VU] = loginResponse.json('token');
    authSuccessRate.add(true);
  } else {
    authSuccessRate.add(false);
  }
  
  authErrorRate.add(!loginSuccess);
  authResponseTime.add(loginResponse.timings.duration);
  
  sleep(0.1);
}

function testTokenValidation(baseUrl) {
  const token = userTokens[__VU];
  if (!token) return;
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const validateResponse = http.get(`${baseUrl}/api/auth/validate`, { headers });
  
  const validationSuccess = check(validateResponse, {
    'token validation status is 200': (r) => r.status === 200,
    'token validation response time < 200ms': (r) => r.timings.duration < 200,
    'token is valid': (r) => r.json('valid') === true,
  });
  
  authErrorRate.add(!validationSuccess);
  authResponseTime.add(validateResponse.timings.duration);
  
  sleep(0.1);
}

function testTokenRefresh(baseUrl) {
  const token = userTokens[__VU];
  if (!token) return;
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const refreshResponse = http.post(`${baseUrl}/api/auth/refresh`, {}, { headers });
  
  const refreshSuccess = check(refreshResponse, {
    'token refresh status is 200': (r) => r.status === 200,
    'token refresh response time < 200ms': (r) => r.timings.duration < 200,
    'token refresh has new token': (r) => r.json('token') !== undefined,
  });
  
  if (refreshSuccess) {
    userTokens[__VU] = refreshResponse.json('token');
    tokenRefreshRate.add(true);
  } else {
    tokenRefreshRate.add(false);
  }
  
  authErrorRate.add(!refreshSuccess);
  authResponseTime.add(refreshResponse.timings.duration);
  
  sleep(0.1);
}

function testLogout(baseUrl) {
  const token = userTokens[__VU];
  if (!token) return;
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const logoutResponse = http.post(`${baseUrl}/api/auth/logout`, {}, { headers });
  
  const logoutSuccess = check(logoutResponse, {
    'logout status is 200': (r) => r.status === 200,
    'logout response time < 200ms': (r) => r.timings.duration < 200,
    'logout successful': (r) => r.json('success') === true,
  });
  
  if (logoutSuccess) {
    delete userTokens[__VU];
  }
  
  authErrorRate.add(!logoutSuccess);
  authResponseTime.add(logoutResponse.timings.duration);
  
  sleep(0.1);
}

function testConcurrentLogin(user, baseUrl) {
  // Simulate multiple concurrent login attempts from the same user
  const concurrentRequests = 3;
  const promises = [];
  
  for (let i = 0; i < concurrentRequests; i++) {
    const loginPayload = JSON.stringify({
      email: user.email,
      password: user.password
    });
    
    const loginResponse = http.post(`${baseUrl}/api/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    const concurrentSuccess = check(loginResponse, {
      [`concurrent login ${i+1} status is 200`]: (r) => r.status === 200,
      [`concurrent login ${i+1} response time < 500ms`]: (r) => r.timings.duration < 500,
    });
    
    authErrorRate.add(!concurrentSuccess);
    authResponseTime.add(loginResponse.timings.duration);
  }
  
  sleep(0.1);
}

function testInvalidCredentials(baseUrl) {
  const invalidCredentials = [
    { email: 'invalid@test.com', password: 'wrongpassword' },
    { email: 'admin@test.com', password: 'wrongpassword' },
    { email: 'invalid@test.com', password: 'Test123!' },
    { email: '', password: 'Test123!' },
    { email: 'admin@test.com', password: '' },
  ];
  
  const invalidUser = invalidCredentials[Math.floor(Math.random() * invalidCredentials.length)];
  
  const loginPayload = JSON.stringify({
    email: invalidUser.email,
    password: invalidUser.password
  });
  
  const loginResponse = http.post(`${baseUrl}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  const expectedFailure = check(loginResponse, {
    'invalid login status is 401': (r) => r.status === 401,
    'invalid login response time < 300ms': (r) => r.timings.duration < 300,
    'invalid login has error message': (r) => r.json('error') !== undefined,
  });
  
  // For invalid credentials, we expect failure, so success = expected failure
  authSuccessRate.add(expectedFailure);
  authErrorRate.add(!expectedFailure);
  authResponseTime.add(loginResponse.timings.duration);
  
  sleep(0.1);
}

function testRateLimiting(baseUrl) {
  // Test rate limiting by making rapid requests
  const rapidRequests = 10;
  
  for (let i = 0; i < rapidRequests; i++) {
    const loginPayload = JSON.stringify({
      email: 'admin@test.com',
      password: 'Test123!'
    });
    
    const loginResponse = http.post(`${baseUrl}/api/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    const rateLimitCheck = check(loginResponse, {
      [`rapid request ${i+1} handled`]: (r) => r.status === 200 || r.status === 429,
      [`rapid request ${i+1} response time < 1000ms`]: (r) => r.timings.duration < 1000,
    });
    
    authErrorRate.add(!rateLimitCheck);
    authResponseTime.add(loginResponse.timings.duration);
  }
  
  sleep(0.1);
}

export function teardown(data) {
  console.log('🔐 Authentication load test teardown completed');
  console.log(`📊 Auth success rate: ${(authSuccessRate.rate * 100).toFixed(2)}%`);
  console.log(`⏱️ Average auth response time: ${authResponseTime.avg.toFixed(2)}ms`);
  console.log(`❌ Auth error rate: ${(authErrorRate.rate * 100).toFixed(2)}%`);
  console.log(`🔄 Token refresh success rate: ${(tokenRefreshRate.rate * 100).toFixed(2)}%`);
}
