const { performance } = require('perf_hooks');
const os = require('os');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Performance monitoring configuration
const config = {
  interval: 5000, // 5 seconds
  logFile: path.join(__dirname, '../logs/performance.log'),
  metricsFile: path.join(__dirname, '../logs/metrics.json'),
  alertThresholds: {
    cpu: 80, // CPU usage percentage
    memory: 80, // Memory usage percentage
    responseTime: 1000, // Response time in milliseconds
    errorRate: 5, // Error rate percentage
  },
  endpoints: [
    { url: 'http://localhost:3001/health', name: 'API Health' },
    { url: 'http://localhost:5173', name: 'Frontend' },
  ],
};

// Performance metrics storage
let metrics = {
  system: [],
  application: [],
  alerts: [],
  startTime: Date.now(),
};

// Initialize monitoring
function initializeMonitoring() {
  console.log('🚀 Starting Performance Monitoring...');
  
  // Create logs directory if it doesn't exist
  const logsDir = path.dirname(config.logFile);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Start monitoring tasks
  startSystemMonitoring();
  startApplicationMonitoring();
  startAlerting();
  startLogging();
  
  console.log('✅ Performance monitoring initialized');
}

// System monitoring
function startSystemMonitoring() {
  setInterval(() => {
    const systemMetrics = collectSystemMetrics();
    metrics.system.push(systemMetrics);
    
    // Keep only last 1000 entries
    if (metrics.system.length > 1000) {
      metrics.system = metrics.system.slice(-1000);
    }
    
    // Check for system alerts
    checkSystemAlerts(systemMetrics);
    
  }, config.interval);
}

// Application monitoring
function startApplicationMonitoring() {
  setInterval(async () => {
    const applicationMetrics = await collectApplicationMetrics();
    metrics.application.push(applicationMetrics);
    
    // Keep only last 1000 entries
    if (metrics.application.length > 1000) {
      metrics.application = metrics.application.slice(-1000);
    }
    
    // Check for application alerts
    checkApplicationAlerts(applicationMetrics);
    
  }, config.interval);
}

// Collect system metrics
function collectSystemMetrics() {
  const timestamp = Date.now();
  
  // CPU usage
  const cpuUsage = process.cpuUsage();
  const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds
  
  // Memory usage
  const memoryUsage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  
  // System load
  const loadAverage = os.loadavg();
  
  return {
    timestamp,
    cpu: {
      usage: cpuPercent,
      loadAverage: loadAverage[0], // 1-minute load average
    },
    memory: {
      used: usedMemory,
      free: freeMemory,
      total: totalMemory,
      percentage: (usedMemory / totalMemory) * 100,
      process: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
      },
    },
    uptime: process.uptime(),
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
  };
}

// Collect application metrics
async function collectApplicationMetrics() {
  const timestamp = Date.now();
  const applicationMetrics = {
    timestamp,
    endpoints: [],
    errors: 0,
    totalRequests: 0,
    averageResponseTime: 0,
  };
  
  // Test each endpoint
  for (const endpoint of config.endpoints) {
    try {
      const startTime = performance.now();
      
      const response = await fetch(endpoint.url, {
        method: 'GET',
        timeout: 5000,
      });
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      applicationMetrics.endpoints.push({
        name: endpoint.name,
        url: endpoint.url,
        status: response.status,
        responseTime,
        success: response.ok,
      });
      
      applicationMetrics.totalRequests++;
      if (!response.ok) {
        applicationMetrics.errors++;
      }
      
    } catch (error) {
      applicationMetrics.endpoints.push({
        name: endpoint.name,
        url: endpoint.url,
        status: 0,
        responseTime: 0,
        success: false,
        error: error.message,
      });
      
      applicationMetrics.totalRequests++;
      applicationMetrics.errors++;
    }
  }
  
  // Calculate average response time
  const successfulEndpoints = applicationMetrics.endpoints.filter(e => e.success);
  if (successfulEndpoints.length > 0) {
    applicationMetrics.averageResponseTime = successfulEndpoints.reduce((sum, e) => sum + e.responseTime, 0) / successfulEndpoints.length;
  }
  
  return applicationMetrics;
}

// Check for system alerts
function checkSystemAlerts(systemMetrics) {
  const alerts = [];
  
  // CPU usage alert
  if (systemMetrics.cpu.usage > config.alertThresholds.cpu) {
    alerts.push({
      type: 'cpu',
      level: 'warning',
      message: `High CPU usage: ${systemMetrics.cpu.usage.toFixed(2)}%`,
      value: systemMetrics.cpu.usage,
      threshold: config.alertThresholds.cpu,
      timestamp: systemMetrics.timestamp,
    });
  }
  
  // Memory usage alert
  if (systemMetrics.memory.percentage > config.alertThresholds.memory) {
    alerts.push({
      type: 'memory',
      level: 'warning',
      message: `High memory usage: ${systemMetrics.memory.percentage.toFixed(2)}%`,
      value: systemMetrics.memory.percentage,
      threshold: config.alertThresholds.memory,
      timestamp: systemMetrics.timestamp,
    });
  }
  
  // Add alerts to metrics
  if (alerts.length > 0) {
    metrics.alerts.push(...alerts);
    
    // Keep only last 100 alerts
    if (metrics.alerts.length > 100) {
      metrics.alerts = metrics.alerts.slice(-100);
    }
    
    // Log alerts
    alerts.forEach(alert => {
      console.log(`⚠️ ${alert.level.toUpperCase()}: ${alert.message}`);
    });
  }
}

// Check for application alerts
function checkApplicationAlerts(applicationMetrics) {
  const alerts = [];
  
  // Response time alert
  if (applicationMetrics.averageResponseTime > config.alertThresholds.responseTime) {
    alerts.push({
      type: 'response_time',
      level: 'warning',
      message: `High response time: ${applicationMetrics.averageResponseTime.toFixed(2)}ms`,
      value: applicationMetrics.averageResponseTime,
      threshold: config.alertThresholds.responseTime,
      timestamp: applicationMetrics.timestamp,
    });
  }
  
  // Error rate alert
  if (applicationMetrics.totalRequests > 0) {
    const errorRate = (applicationMetrics.errors / applicationMetrics.totalRequests) * 100;
    if (errorRate > config.alertThresholds.errorRate) {
      alerts.push({
        type: 'error_rate',
        level: 'error',
        message: `High error rate: ${errorRate.toFixed(2)}%`,
        value: errorRate,
        threshold: config.alertThresholds.errorRate,
        timestamp: applicationMetrics.timestamp,
      });
    }
  }
  
  // Add alerts to metrics
  if (alerts.length > 0) {
    metrics.alerts.push(...alerts);
    
    // Keep only last 100 alerts
    if (metrics.alerts.length > 100) {
      metrics.alerts = metrics.alerts.slice(-100);
    }
    
    // Log alerts
    alerts.forEach(alert => {
      console.log(`⚠️ ${alert.level.toUpperCase()}: ${alert.message}`);
    });
  }
}

// Start alerting system
function startAlerting() {
  // Check for critical alerts every minute
  cron.schedule('* * * * *', () => {
    const recentAlerts = metrics.alerts.filter(alert => 
      Date.now() - alert.timestamp < 60000 // Last minute
    );
    
    if (recentAlerts.length > 0) {
      console.log(`🚨 ${recentAlerts.length} alerts in the last minute`);
    }
  });
}

// Start logging
function startLogging() {
  // Log metrics every minute
  cron.schedule('* * * * *', () => {
    logMetrics();
  });
  
  // Save metrics to file every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    saveMetrics();
  });
}

// Log current metrics
function logMetrics() {
  const timestamp = new Date().toISOString();
  
  // Get latest system metrics
  const latestSystem = metrics.system[metrics.system.length - 1];
  const latestApplication = metrics.application[metrics.application.length - 1];
  
  if (latestSystem && latestApplication) {
    const logEntry = {
      timestamp,
      system: {
        cpu: latestSystem.cpu.usage.toFixed(2),
        memory: latestSystem.memory.percentage.toFixed(2),
        uptime: latestSystem.uptime.toFixed(2),
      },
      application: {
        averageResponseTime: latestApplication.averageResponseTime.toFixed(2),
        errorRate: latestApplication.totalRequests > 0 ? 
          ((latestApplication.errors / latestApplication.totalRequests) * 100).toFixed(2) : '0.00',
        totalRequests: latestApplication.totalRequests,
      },
    };
    
    // Write to log file
    fs.appendFileSync(config.logFile, JSON.stringify(logEntry) + '\n');
  }
}

// Save metrics to file
function saveMetrics() {
  try {
    const metricsData = {
      timestamp: Date.now(),
      system: metrics.system,
      application: metrics.application,
      alerts: metrics.alerts,
      uptime: Date.now() - metrics.startTime,
    };
    
    fs.writeFileSync(config.metricsFile, JSON.stringify(metricsData, null, 2));
    console.log('📊 Metrics saved to file');
  } catch (error) {
    console.error('❌ Failed to save metrics:', error.message);
  }
}

// Get current metrics
function getCurrentMetrics() {
  const latestSystem = metrics.system[metrics.system.length - 1];
  const latestApplication = metrics.application[metrics.application.length - 1];
  const recentAlerts = metrics.alerts.filter(alert => 
    Date.now() - alert.timestamp < 300000 // Last 5 minutes
  );
  
  return {
    system: latestSystem,
    application: latestApplication,
    alerts: recentAlerts,
    uptime: Date.now() - metrics.startTime,
  };
}

// Get metrics summary
function getMetricsSummary() {
  const systemMetrics = metrics.system;
  const applicationMetrics = metrics.application;
  
  if (systemMetrics.length === 0 || applicationMetrics.length === 0) {
    return { message: 'No metrics available yet' };
  }
  
  // Calculate averages
  const avgCpu = systemMetrics.reduce((sum, m) => sum + m.cpu.usage, 0) / systemMetrics.length;
  const avgMemory = systemMetrics.reduce((sum, m) => sum + m.memory.percentage, 0) / systemMetrics.length;
  const avgResponseTime = applicationMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / applicationMetrics.length;
  
  // Calculate error rate
  const totalRequests = applicationMetrics.reduce((sum, m) => sum + m.totalRequests, 0);
  const totalErrors = applicationMetrics.reduce((sum, m) => sum + m.errors, 0);
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
  
  return {
    system: {
      averageCpu: avgCpu.toFixed(2),
      averageMemory: avgMemory.toFixed(2),
      currentCpu: systemMetrics[systemMetrics.length - 1].cpu.usage.toFixed(2),
      currentMemory: systemMetrics[systemMetrics.length - 1].memory.percentage.toFixed(2),
    },
    application: {
      averageResponseTime: avgResponseTime.toFixed(2),
      errorRate: errorRate.toFixed(2),
      totalRequests,
      totalErrors,
    },
    alerts: {
      total: metrics.alerts.length,
      recent: metrics.alerts.filter(alert => Date.now() - alert.timestamp < 300000).length,
    },
    uptime: Date.now() - metrics.startTime,
  };
}

// Export functions
module.exports = {
  initializeMonitoring,
  getCurrentMetrics,
  getMetricsSummary,
  config,
  metrics,
};

// Start monitoring if this file is executed directly
if (require.main === module) {
  initializeMonitoring();
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping performance monitoring...');
    saveMetrics();
    process.exit(0);
  });
  
  // Log summary every 5 minutes
  setInterval(() => {
    const summary = getMetricsSummary();
    console.log('📊 Performance Summary:', summary);
  }, 300000);
}
