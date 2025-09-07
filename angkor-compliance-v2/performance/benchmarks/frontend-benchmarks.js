const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const { performance } = require('perf_hooks');

// Benchmark configuration
const config = {
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:3001',
  headless: true,
  timeout: 30000,
};

// Test data
const testUsers = [
  { email: 'admin@test.com', password: 'Test123!', role: 'super_admin' },
  { email: 'factory.admin@test.com', password: 'Test123!', role: 'factory_admin' },
  { email: 'worker@test.com', password: 'Test123!', role: 'worker' },
  { email: 'auditor@test.com', password: 'Test123!', role: 'auditor' },
];

// Benchmark results storage
const benchmarkResults = {
  pageLoad: {},
  userInteractions: {},
  lighthouse: {},
  memoryUsage: {},
  networkPerformance: {},
  overall: {}
};

async function runFrontendBenchmarks() {
  console.log('🚀 Starting Frontend benchmarks...');
  console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
  console.log(`🔗 Backend URL: ${config.backendUrl}`);
  console.log('');

  const browser = await puppeteer.launch({
    headless: config.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // 1. Page Load Performance
    await benchmarkPageLoad(browser);
    
    // 2. User Interaction Performance
    await benchmarkUserInteractions(browser);
    
    // 3. Lighthouse Performance Audit
    await benchmarkLighthouse(browser);
    
    // 4. Memory Usage Performance
    await benchmarkMemoryUsage(browser);
    
    // 5. Network Performance
    await benchmarkNetworkPerformance(browser);
    
    // Generate report
    generateReport();
    
  } catch (error) {
    console.error('❌ Frontend benchmark failed:', error);
  } finally {
    await browser.close();
  }
}

async function benchmarkPageLoad(browser) {
  console.log('📄 Benchmarking Page Load Performance...');
  
  const pages = [
    { path: '/', name: 'Home' },
    { path: '/login', name: 'Login' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/factories', name: 'Factories' },
    { path: '/grievances', name: 'Grievances' },
    { path: '/audits', name: 'Audits' },
    { path: '/users', name: 'Users' },
    { path: '/reports', name: 'Reports' },
  ];
  
  const pageResults = {};
  
  for (const page of pages) {
    const pageInstance = await browser.newPage();
    
    try {
      // Enable performance metrics
      await pageInstance.setCacheEnabled(false);
      
      const startTime = performance.now();
      
      // Navigate to page
      const response = await pageInstance.goto(`${config.frontendUrl}${page.path}`, {
        waitUntil: 'networkidle0',
        timeout: config.timeout,
      });
      
      const endTime = performance.now();
      
      // Get performance metrics
      const metrics = await pageInstance.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        };
      });
      
      pageResults[page.name] = {
        url: page.path,
        status: response.status(),
        loadTime: endTime - startTime,
        domContentLoaded: metrics.domContentLoaded,
        loadComplete: metrics.loadComplete,
        firstPaint: metrics.firstPaint,
        firstContentfulPaint: metrics.firstContentfulPaint,
        totalLoadTime: metrics.totalLoadTime,
      };
      
      console.log(`   ✅ ${page.name}: ${(endTime - startTime).toFixed(2)}ms`);
      
    } catch (error) {
      console.log(`   ❌ ${page.name}: Error - ${error.message}`);
      pageResults[page.name] = { error: error.message };
    } finally {
      await pageInstance.close();
    }
  }
  
  benchmarkResults.pageLoad = pageResults;
  console.log('');
}

async function benchmarkUserInteractions(browser) {
  console.log('👆 Benchmarking User Interaction Performance...');
  
  const page = await browser.newPage();
  
  try {
    // Login first
    await loginUser(page, testUsers[0]);
    
    const interactions = [
      { action: 'click', selector: '[data-testid="dashboard-link"]', name: 'Dashboard Navigation' },
      { action: 'click', selector: '[data-testid="factories-link"]', name: 'Factories Navigation' },
      { action: 'click', selector: '[data-testid="grievances-link"]', name: 'Grievances Navigation' },
      { action: 'click', selector: '[data-testid="audits-link"]', name: 'Audits Navigation' },
      { action: 'click', selector: '[data-testid="users-link"]', name: 'Users Navigation' },
      { action: 'click', selector: '[data-testid="reports-link"]', name: 'Reports Navigation' },
    ];
    
    const interactionResults = {};
    
    for (const interaction of interactions) {
      try {
        const startTime = performance.now();
        
        // Wait for element and click
        await page.waitForSelector(interaction.selector, { timeout: 5000 });
        await page.click(interaction.selector);
        
        // Wait for navigation/update
        await page.waitForTimeout(1000);
        
        const endTime = performance.now();
        
        interactionResults[interaction.name] = {
          action: interaction.action,
          selector: interaction.selector,
          responseTime: endTime - startTime,
          success: true,
        };
        
        console.log(`   ✅ ${interaction.name}: ${(endTime - startTime).toFixed(2)}ms`);
        
      } catch (error) {
        console.log(`   ❌ ${interaction.name}: Error - ${error.message}`);
        interactionResults[interaction.name] = {
          action: interaction.action,
          selector: interaction.selector,
          error: error.message,
          success: false,
        };
      }
    }
    
    benchmarkResults.userInteractions = interactionResults;
    
  } catch (error) {
    console.log(`   ❌ User interaction benchmark failed: ${error.message}`);
  } finally {
    await page.close();
  }
  
  console.log('');
}

async function benchmarkLighthouse(browser) {
  console.log('🔍 Running Lighthouse Performance Audit...');
  
  try {
    const lighthouseConfig = {
      port: new URL(browser.wsEndpoint()).port,
      output: 'json',
      logLevel: 'info',
    };
  
    const lighthouseOptions = {
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      settings: {
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    };
    
    const pages = [
      { url: `${config.frontendUrl}/`, name: 'Home' },
      { url: `${config.frontendUrl}/login`, name: 'Login' },
      { url: `${config.frontendUrl}/dashboard`, name: 'Dashboard' },
    ];
    
    const lighthouseResults = {};
    
    for (const page of pages) {
      try {
        const startTime = performance.now();
        
        const result = await lighthouse(page.url, lighthouseOptions, lighthouseConfig);
        
        const endTime = performance.now();
        
        lighthouseResults[page.name] = {
          url: page.url,
          performance: result.lhr.categories.performance.score * 100,
          accessibility: result.lhr.categories.accessibility.score * 100,
          bestPractices: result.lhr.categories['best-practices'].score * 100,
          seo: result.lhr.categories.seo.score * 100,
          firstContentfulPaint: result.lhr.audits['first-contentful-paint'].numericValue,
          largestContentfulPaint: result.lhr.audits['largest-contentful-paint'].numericValue,
          cumulativeLayoutShift: result.lhr.audits['cumulative-layout-shift'].numericValue,
          totalBlockingTime: result.lhr.audits['total-blocking-time'].numericValue,
          auditTime: endTime - startTime,
        };
        
        console.log(`   ✅ ${page.name}: Performance ${lighthouseResults[page.name].performance.toFixed(1)}/100`);
        
      } catch (error) {
        console.log(`   ❌ ${page.name}: Error - ${error.message}`);
        lighthouseResults[page.name] = { error: error.message };
      }
    }
    
    benchmarkResults.lighthouse = lighthouseResults;
    
  } catch (error) {
    console.log(`   ❌ Lighthouse benchmark failed: ${error.message}`);
  }
  
  console.log('');
}

async function benchmarkMemoryUsage(browser) {
  console.log('🧠 Benchmarking Memory Usage...');
  
  const page = await browser.newPage();
  
  try {
    // Login first
    await loginUser(page, testUsers[0]);
    
    const memoryTests = [
      { action: 'navigate', path: '/dashboard', name: 'Dashboard Memory' },
      { action: 'navigate', path: '/factories', name: 'Factories Memory' },
      { action: 'navigate', path: '/grievances', name: 'Grievances Memory' },
      { action: 'navigate', path: '/audits', name: 'Audits Memory' },
    ];
    
    const memoryResults = {};
    
    for (const test of memoryTests) {
      try {
        // Navigate to page
        await page.goto(`${config.frontendUrl}${test.path}`, {
          waitUntil: 'networkidle0',
        });
        
        // Wait for page to stabilize
        await page.waitForTimeout(2000);
        
        // Get memory usage
        const memoryInfo = await page.evaluate(() => {
          if (performance.memory) {
            return {
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              totalJSHeapSize: performance.memory.totalJSHeapSize,
              jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            };
          }
          return null;
        });
        
        // Get browser memory info
        const browserMemory = await page.metrics();
        
        memoryResults[test.name] = {
          path: test.path,
          browserMemory: browserMemory,
          jsMemory: memoryInfo,
          timestamp: Date.now(),
        };
        
        console.log(`   ✅ ${test.name}: ${memoryInfo ? (memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'}`);
        
      } catch (error) {
        console.log(`   ❌ ${test.name}: Error - ${error.message}`);
        memoryResults[test.name] = { error: error.message };
      }
    }
    
    benchmarkResults.memoryUsage = memoryResults;
    
  } catch (error) {
    console.log(`   ❌ Memory usage benchmark failed: ${error.message}`);
  } finally {
    await page.close();
  }
  
  console.log('');
}

async function benchmarkNetworkPerformance(browser) {
  console.log('🌐 Benchmarking Network Performance...');
  
  const page = await browser.newPage();
  
  try {
    // Enable network monitoring
    await page.setRequestInterception(true);
    
    const networkMetrics = {
      requests: [],
      totalSize: 0,
      totalTime: 0,
    };
    
    page.on('request', (request) => {
      networkMetrics.requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        timestamp: Date.now(),
      });
    });
    
    page.on('response', (response) => {
      const request = networkMetrics.requests.find(r => r.url === response.url());
      if (request) {
        request.status = response.status();
        request.size = response.headers()['content-length'] || 0;
        request.time = Date.now() - request.timestamp;
        networkMetrics.totalSize += parseInt(request.size) || 0;
        networkMetrics.totalTime += request.time;
      }
    });
    
    // Test different pages
    const testPages = [
      { path: '/', name: 'Home' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/factories', name: 'Factories' },
    ];
    
    const networkResults = {};
    
    for (const testPage of testPages) {
      try {
        // Reset metrics
        networkMetrics.requests = [];
        networkMetrics.totalSize = 0;
        networkMetrics.totalTime = 0;
        
        const startTime = performance.now();
        
        // Navigate to page
        await page.goto(`${config.frontendUrl}${testPage.path}`, {
          waitUntil: 'networkidle0',
        });
        
        const endTime = performance.now();
        
        networkResults[testPage.name] = {
          path: testPage.path,
          loadTime: endTime - startTime,
          requestCount: networkMetrics.requests.length,
          totalSize: networkMetrics.totalSize,
          totalTime: networkMetrics.totalTime,
          avgRequestTime: networkMetrics.requests.length > 0 ? networkMetrics.totalTime / networkMetrics.requests.length : 0,
          requests: networkMetrics.requests,
        };
        
        console.log(`   ✅ ${testPage.name}: ${networkMetrics.requests.length} requests, ${(networkMetrics.totalSize / 1024).toFixed(2)}KB`);
        
      } catch (error) {
        console.log(`   ❌ ${testPage.name}: Error - ${error.message}`);
        networkResults[testPage.name] = { error: error.message };
      }
    }
    
    benchmarkResults.networkPerformance = networkResults;
    
  } catch (error) {
    console.log(`   ❌ Network performance benchmark failed: ${error.message}`);
  } finally {
    await page.close();
  }
  
  console.log('');
}

async function loginUser(page, user) {
  try {
    await page.goto(`${config.frontendUrl}/login`);
    await page.waitForSelector('[data-testid="email-input"]');
    
    await page.type('[data-testid="email-input"]', user.email);
    await page.type('[data-testid="password-input"]', user.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    return true;
  } catch (error) {
    console.log(`   ❌ Login failed: ${error.message}`);
    return false;
  }
}

function generateReport() {
  console.log('📊 FRONTEND BENCHMARK REPORT');
  console.log('============================');
  console.log('');
  
  // Page Load Report
  console.log('📄 PAGE LOAD PERFORMANCE');
  console.log('-------------------------');
  Object.entries(benchmarkResults.pageLoad).forEach(([name, data]) => {
    if (data.error) {
      console.log(`${name}: ❌ ${data.error}`);
    } else {
      console.log(`${name}:`);
      console.log(`  Load Time: ${data.loadTime.toFixed(2)}ms`);
      console.log(`  DOM Content Loaded: ${data.domContentLoaded.toFixed(2)}ms`);
      console.log(`  First Paint: ${data.firstPaint.toFixed(2)}ms`);
      console.log(`  First Contentful Paint: ${data.firstContentfulPaint.toFixed(2)}ms`);
    }
  });
  console.log('');
  
  // User Interaction Report
  console.log('👆 USER INTERACTION PERFORMANCE');
  console.log('--------------------------------');
  Object.entries(benchmarkResults.userInteractions).forEach(([name, data]) => {
    if (data.error) {
      console.log(`${name}: ❌ ${data.error}`);
    } else {
      console.log(`${name}: ${data.responseTime.toFixed(2)}ms`);
    }
  });
  console.log('');
  
  // Lighthouse Report
  console.log('🔍 LIGHTHOUSE PERFORMANCE AUDIT');
  console.log('--------------------------------');
  Object.entries(benchmarkResults.lighthouse).forEach(([name, data]) => {
    if (data.error) {
      console.log(`${name}: ❌ ${data.error}`);
    } else {
      console.log(`${name}:`);
      console.log(`  Performance: ${data.performance.toFixed(1)}/100`);
      console.log(`  Accessibility: ${data.accessibility.toFixed(1)}/100`);
      console.log(`  Best Practices: ${data.bestPractices.toFixed(1)}/100`);
      console.log(`  SEO: ${data.seo.toFixed(1)}/100`);
      console.log(`  First Contentful Paint: ${data.firstContentfulPaint.toFixed(2)}ms`);
      console.log(`  Largest Contentful Paint: ${data.largestContentfulPaint.toFixed(2)}ms`);
    }
  });
  console.log('');
  
  // Memory Usage Report
  console.log('🧠 MEMORY USAGE PERFORMANCE');
  console.log('---------------------------');
  Object.entries(benchmarkResults.memoryUsage).forEach(([name, data]) => {
    if (data.error) {
      console.log(`${name}: ❌ ${data.error}`);
    } else {
      console.log(`${name}:`);
      if (data.jsMemory) {
        console.log(`  JS Heap Used: ${(data.jsMemory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
        console.log(`  JS Heap Total: ${(data.jsMemory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }
      if (data.browserMemory) {
        console.log(`  Browser Memory: ${(data.browserMemory.JSHeapUsedSize / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  });
  console.log('');
  
  // Network Performance Report
  console.log('🌐 NETWORK PERFORMANCE');
  console.log('----------------------');
  Object.entries(benchmarkResults.networkPerformance).forEach(([name, data]) => {
    if (data.error) {
      console.log(`${name}: ❌ ${data.error}`);
    } else {
      console.log(`${name}:`);
      console.log(`  Load Time: ${data.loadTime.toFixed(2)}ms`);
      console.log(`  Request Count: ${data.requestCount}`);
      console.log(`  Total Size: ${(data.totalSize / 1024).toFixed(2)}KB`);
      console.log(`  Avg Request Time: ${data.avgRequestTime.toFixed(2)}ms`);
    }
  });
  console.log('');
  
  // Performance Recommendations
  console.log('💡 PERFORMANCE RECOMMENDATIONS');
  console.log('-------------------------------');
  
  // Check for slow page loads
  Object.entries(benchmarkResults.pageLoad).forEach(([name, data]) => {
    if (data.loadTime > 3000) {
      console.log(`⚠️ ${name} page load time is slow (${data.loadTime.toFixed(2)}ms). Consider optimization.`);
    }
  });
  
  // Check for slow interactions
  Object.entries(benchmarkResults.userInteractions).forEach(([name, data]) => {
    if (data.responseTime > 1000) {
      console.log(`⚠️ ${name} interaction is slow (${data.responseTime.toFixed(2)}ms). Consider optimization.`);
    }
  });
  
  // Check for low Lighthouse scores
  Object.entries(benchmarkResults.lighthouse).forEach(([name, data]) => {
    if (data.performance < 80) {
      console.log(`⚠️ ${name} Lighthouse performance score is low (${data.performance.toFixed(1)}/100). Consider optimization.`);
    }
  });
  
  console.log('✅ Frontend benchmark completed successfully!');
}

// Run benchmarks if this file is executed directly
if (require.main === module) {
  runFrontendBenchmarks().catch(console.error);
}

module.exports = {
  runFrontendBenchmarks,
  benchmarkResults,
};
