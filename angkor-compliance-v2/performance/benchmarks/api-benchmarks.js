const autocannon = require('autocannon');
const { performance } = require('perf_hooks');

// Benchmark configuration
const config = {
  url: process.env.API_URL || 'http://localhost:3001',
  connections: 10,
  pipelining: 1,
  duration: 30,
  timeout: 10,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Test data
const testUsers = [
  { email: 'admin@test.com', password: 'Test123!' },
  { email: 'factory.admin@test.com', password: 'Test123!' },
  { email: 'worker@test.com', password: 'Test123!' },
  { email: 'auditor@test.com', password: 'Test123!' },
];

let authToken = null;

// Benchmark results storage
const benchmarkResults = {
  authentication: {},
  apiEndpoints: {},
  databaseOperations: {},
  fileOperations: {},
  overall: {}
};

async function runBenchmarks() {
  console.log('🚀 Starting API benchmarks...');
  console.log(`📡 Target URL: ${config.url}`);
  console.log(`⏱️ Duration: ${config.duration}s per test`);
  console.log(`🔗 Connections: ${config.connections}`);
  console.log('');

  try {
    // 1. Authentication Benchmark
    await benchmarkAuthentication();
    
    // 2. API Endpoints Benchmark
    await benchmarkApiEndpoints();
    
    // 3. Database Operations Benchmark
    await benchmarkDatabaseOperations();
    
    // 4. File Operations Benchmark
    await benchmarkFileOperations();
    
    // 5. Overall System Benchmark
    await benchmarkOverallSystem();
    
    // Generate report
    generateReport();
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

async function benchmarkAuthentication() {
  console.log('🔐 Benchmarking Authentication...');
  
  const authConfig = {
    ...config,
    requests: [
      {
        method: 'POST',
        path: '/api/auth/login',
        body: JSON.stringify(testUsers[0]),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ],
  };
  
  const startTime = performance.now();
  const result = await autocannon(authConfig);
  const endTime = performance.now();
  
  benchmarkResults.authentication = {
    requests: result.requests,
    latency: result.latency,
    throughput: result.throughput,
    errors: result.errors,
    duration: endTime - startTime,
    avgResponseTime: result.latency.average,
    p95ResponseTime: result.latency.p95,
    p99ResponseTime: result.latency.p99,
  };
  
  console.log(`✅ Authentication benchmark completed`);
  console.log(`   📊 Requests: ${result.requests.average}/s`);
  console.log(`   ⏱️ Avg Response Time: ${result.latency.average}ms`);
  console.log(`   📈 P95 Response Time: ${result.latency.p95}ms`);
  console.log(`   ❌ Errors: ${result.errors}`);
  console.log('');
}

async function benchmarkApiEndpoints() {
  console.log('🔌 Benchmarking API Endpoints...');
  
  // Get auth token first
  const loginResponse = await fetch(`${config.url}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUsers[0]),
  });
  
  if (loginResponse.ok) {
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  }
  
  const endpoints = [
    { path: '/api/dashboard', name: 'Dashboard' },
    { path: '/api/users', name: 'Users' },
    { path: '/api/factories', name: 'Factories' },
    { path: '/api/grievances', name: 'Grievances' },
    { path: '/api/audits', name: 'Audits' },
    { path: '/api/reports', name: 'Reports' },
  ];
  
  const endpointResults = {};
  
  for (const endpoint of endpoints) {
    const endpointConfig = {
      ...config,
      requests: [
        {
          method: 'GET',
          path: endpoint.path,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      ],
    };
    
    const startTime = performance.now();
    const result = await autocannon(endpointConfig);
    const endTime = performance.now();
    
    endpointResults[endpoint.name] = {
      requests: result.requests,
      latency: result.latency,
      throughput: result.throughput,
      errors: result.errors,
      duration: endTime - startTime,
      avgResponseTime: result.latency.average,
      p95ResponseTime: result.latency.p95,
      p99ResponseTime: result.latency.p99,
    };
    
    console.log(`   ✅ ${endpoint.name}: ${result.requests.average}/s (${result.latency.average}ms avg)`);
  }
  
  benchmarkResults.apiEndpoints = endpointResults;
  console.log('');
}

async function benchmarkDatabaseOperations() {
  console.log('🗄️ Benchmarking Database Operations...');
  
  const dbOperations = [
    { path: '/api/dashboard/analytics', name: 'Analytics' },
    { path: '/api/reports/summary', name: 'Reports Summary' },
    { path: '/api/audits/statistics', name: 'Audit Statistics' },
    { path: '/api/grievances/statistics', name: 'Grievance Statistics' },
    { path: '/api/users/search?q=test', name: 'User Search' },
    { path: '/api/factories/search?q=test', name: 'Factory Search' },
  ];
  
  const dbResults = {};
  
  for (const operation of dbOperations) {
    const operationConfig = {
      ...config,
      requests: [
        {
          method: 'GET',
          path: operation.path,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      ],
    };
    
    const startTime = performance.now();
    const result = await autocannon(operationConfig);
    const endTime = performance.now();
    
    dbResults[operation.name] = {
      requests: result.requests,
      latency: result.latency,
      throughput: result.throughput,
      errors: result.errors,
      duration: endTime - startTime,
      avgResponseTime: result.latency.average,
      p95ResponseTime: result.latency.p95,
      p99ResponseTime: result.latency.p99,
    };
    
    console.log(`   ✅ ${operation.name}: ${result.requests.average}/s (${result.latency.average}ms avg)`);
  }
  
  benchmarkResults.databaseOperations = dbResults;
  console.log('');
}

async function benchmarkFileOperations() {
  console.log('📁 Benchmarking File Operations...');
  
  const fileOperations = [
    { path: '/api/files/upload', method: 'POST', name: 'File Upload' },
    { path: '/api/files/list', method: 'GET', name: 'File List' },
    { path: '/api/files/download/test', method: 'GET', name: 'File Download' },
  ];
  
  const fileResults = {};
  
  for (const operation of fileOperations) {
    const operationConfig = {
      ...config,
      requests: [
        {
          method: operation.method,
          path: operation.path,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        },
      ],
    };
    
    const startTime = performance.now();
    const result = await autocannon(operationConfig);
    const endTime = performance.now();
    
    fileResults[operation.name] = {
      requests: result.requests,
      latency: result.latency,
      throughput: result.throughput,
      errors: result.errors,
      duration: endTime - startTime,
      avgResponseTime: result.latency.average,
      p95ResponseTime: result.latency.p95,
      p99ResponseTime: result.latency.p99,
    };
    
    console.log(`   ✅ ${operation.name}: ${result.requests.average}/s (${result.latency.average}ms avg)`);
  }
  
  benchmarkResults.fileOperations = fileResults;
  console.log('');
}

async function benchmarkOverallSystem() {
  console.log('🌐 Benchmarking Overall System...');
  
  const overallConfig = {
    ...config,
    requests: [
      {
        method: 'GET',
        path: '/health',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        body: JSON.stringify(testUsers[0]),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        method: 'GET',
        path: '/api/dashboard',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      },
    ],
  };
  
  const startTime = performance.now();
  const result = await autocannon(overallConfig);
  const endTime = performance.now();
  
  benchmarkResults.overall = {
    requests: result.requests,
    latency: result.latency,
    throughput: result.throughput,
    errors: result.errors,
    duration: endTime - startTime,
    avgResponseTime: result.latency.average,
    p95ResponseTime: result.latency.p95,
    p99ResponseTime: result.latency.p99,
  };
  
  console.log(`✅ Overall system benchmark completed`);
  console.log(`   📊 Requests: ${result.requests.average}/s`);
  console.log(`   ⏱️ Avg Response Time: ${result.latency.average}ms`);
  console.log(`   📈 P95 Response Time: ${result.latency.p95}ms`);
  console.log(`   ❌ Errors: ${result.errors}`);
  console.log('');
}

function generateReport() {
  console.log('📊 BENCHMARK REPORT');
  console.log('==================');
  console.log('');
  
  // Authentication Report
  console.log('🔐 AUTHENTICATION PERFORMANCE');
  console.log('------------------------------');
  const auth = benchmarkResults.authentication;
  console.log(`Requests/sec: ${auth.requests?.average || 'N/A'}`);
  console.log(`Avg Response Time: ${auth.avgResponseTime || 'N/A'}ms`);
  console.log(`P95 Response Time: ${auth.p95ResponseTime || 'N/A'}ms`);
  console.log(`P99 Response Time: ${auth.p99ResponseTime || 'N/A'}ms`);
  console.log(`Errors: ${auth.errors || 'N/A'}`);
  console.log('');
  
  // API Endpoints Report
  console.log('🔌 API ENDPOINTS PERFORMANCE');
  console.log('-----------------------------');
  Object.entries(benchmarkResults.apiEndpoints).forEach(([name, data]) => {
    console.log(`${name}:`);
    console.log(`  Requests/sec: ${data.requests?.average || 'N/A'}`);
    console.log(`  Avg Response Time: ${data.avgResponseTime || 'N/A'}ms`);
    console.log(`  P95 Response Time: ${data.p95ResponseTime || 'N/A'}ms`);
    console.log(`  Errors: ${data.errors || 'N/A'}`);
  });
  console.log('');
  
  // Database Operations Report
  console.log('🗄️ DATABASE OPERATIONS PERFORMANCE');
  console.log('-----------------------------------');
  Object.entries(benchmarkResults.databaseOperations).forEach(([name, data]) => {
    console.log(`${name}:`);
    console.log(`  Requests/sec: ${data.requests?.average || 'N/A'}`);
    console.log(`  Avg Response Time: ${data.avgResponseTime || 'N/A'}ms`);
    console.log(`  P95 Response Time: ${data.p95ResponseTime || 'N/A'}ms`);
    console.log(`  Errors: ${data.errors || 'N/A'}`);
  });
  console.log('');
  
  // File Operations Report
  console.log('📁 FILE OPERATIONS PERFORMANCE');
  console.log('------------------------------');
  Object.entries(benchmarkResults.fileOperations).forEach(([name, data]) => {
    console.log(`${name}:`);
    console.log(`  Requests/sec: ${data.requests?.average || 'N/A'}`);
    console.log(`  Avg Response Time: ${data.avgResponseTime || 'N/A'}ms`);
    console.log(`  P95 Response Time: ${data.p95ResponseTime || 'N/A'}ms`);
    console.log(`  Errors: ${data.errors || 'N/A'}`);
  });
  console.log('');
  
  // Overall System Report
  console.log('🌐 OVERALL SYSTEM PERFORMANCE');
  console.log('------------------------------');
  const overall = benchmarkResults.overall;
  console.log(`Requests/sec: ${overall.requests?.average || 'N/A'}`);
  console.log(`Avg Response Time: ${overall.avgResponseTime || 'N/A'}ms`);
  console.log(`P95 Response Time: ${overall.p95ResponseTime || 'N/A'}ms`);
  console.log(`P99 Response Time: ${overall.p99ResponseTime || 'N/A'}ms`);
  console.log(`Errors: ${overall.errors || 'N/A'}`);
  console.log('');
  
  // Performance Recommendations
  console.log('💡 PERFORMANCE RECOMMENDATIONS');
  console.log('-------------------------------');
  
  if (auth.avgResponseTime > 300) {
    console.log('⚠️ Authentication response time is high. Consider optimizing JWT validation.');
  }
  
  if (overall.avgResponseTime > 500) {
    console.log('⚠️ Overall system response time is high. Consider database optimization.');
  }
  
  if (overall.errors > 0) {
    console.log('⚠️ System has errors. Check logs and fix issues.');
  }
  
  console.log('✅ Benchmark completed successfully!');
}

// Run benchmarks if this file is executed directly
if (require.main === module) {
  runBenchmarks().catch(console.error);
}

module.exports = {
  runBenchmarks,
  benchmarkResults,
};
