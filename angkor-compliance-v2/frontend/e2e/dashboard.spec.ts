import { test, expect } from '@playwright/test';
import { AuthHelpers } from './utils/auth-helpers';
import { PageHelpers } from './utils/page-helpers';

test.describe('Dashboard', () => {
  let authHelpers: AuthHelpers;
  let pageHelpers: PageHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    pageHelpers = new PageHelpers(page);
  });

  test.describe('Super Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.loginAs('super_admin');
    });

    test('should display dashboard overview', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Check for dashboard title
      await pageHelpers.waitForElement('[data-testid="dashboard-title"]');
      const title = await pageHelpers.getElementText('[data-testid="dashboard-title"]');
      expect(title).toContain('Dashboard');
      
      // Check for key metrics cards
      const metricsCards = [
        '[data-testid="total-factories-card"]',
        '[data-testid="total-users-card"]',
        '[data-testid="active-audits-card"]',
        '[data-testid="pending-grievances-card"]'
      ];

      for (const card of metricsCards) {
        await pageHelpers.waitForElement(card);
        expect(await pageHelpers.elementIsVisible(card)).toBe(true);
      }
    });

    test('should display system overview charts', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Check for charts
      const charts = [
        '[data-testid="compliance-chart"]',
        '[data-testid="audit-timeline-chart"]',
        '[data-testid="grievance-trends-chart"]'
      ];

      for (const chart of charts) {
        await pageHelpers.waitForElement(chart);
        expect(await pageHelpers.elementIsVisible(chart)).toBe(true);
      }
    });

    test('should display recent activities', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Check for recent activities section
      await pageHelpers.waitForElement('[data-testid="recent-activities"]');
      
      // Check for activity items
      const activityItems = page.locator('[data-testid="activity-item"]');
      const count = await activityItems.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display quick actions', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Check for quick actions
      const quickActions = [
        '[data-testid="create-factory-action"]',
        '[data-testid="schedule-audit-action"]',
        '[data-testid="view-reports-action"]',
        '[data-testid="manage-users-action"]'
      ];

      for (const action of quickActions) {
        await pageHelpers.waitForElement(action);
        expect(await pageHelpers.elementIsVisible(action)).toBe(true);
      }
    });

    test('should navigate to different sections from dashboard', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Test navigation to factories
      await page.click('[data-testid="view-factories-link"]');
      expect(page.url()).toContain('/factories');
      
      // Go back to dashboard
      await pageHelpers.navigateTo('/dashboard');
      
      // Test navigation to audits
      await page.click('[data-testid="view-audits-link"]');
      expect(page.url()).toContain('/audits');
    });
  });

  test.describe('Factory Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.loginAs('factory_admin');
    });

    test('should display factory-specific dashboard', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Check for factory-specific content
      await pageHelpers.waitForElement('[data-testid="factory-dashboard"]');
      
      // Check for factory metrics
      const factoryMetrics = [
        '[data-testid="factory-compliance-score"]',
        '[data-testid="pending-caps-card"]',
        '[data-testid="upcoming-audits-card"]',
        '[data-testid="worker-count-card"]'
      ];

      for (const metric of factoryMetrics) {
        await pageHelpers.waitForElement(metric);
        expect(await pageHelpers.elementIsVisible(metric)).toBe(true);
      }
    });

    test('should display factory-specific charts', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Check for factory-specific charts
      const charts = [
        '[data-testid="factory-compliance-trend"]',
        '[data-testid="worker-satisfaction-chart"]',
        '[data-testid="safety-incidents-chart"]'
      ];

      for (const chart of charts) {
        await pageHelpers.waitForElement(chart);
        expect(await pageHelpers.elementIsVisible(chart)).toBe(true);
      }
    });

    test('should display factory-specific quick actions', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Check for factory-specific actions
      const actions = [
        '[data-testid="upload-document-action"]',
        '[data-testid="schedule-training-action"]',
        '[data-testid="create-cap-action"]',
        '[data-testid="view-grievances-action"]'
      ];

      for (const action of actions) {
        await pageHelpers.waitForElement(action);
        expect(await pageHelpers.elementIsVisible(action)).toBe(true);
      }
    });
  });

  test.describe('Worker Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.loginAs('worker');
    });

    test('should display worker-specific dashboard', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Check for worker-specific content
      await pageHelpers.waitForElement('[data-testid="worker-dashboard"]');
      
      // Check for worker metrics
      const workerMetrics = [
        '[data-testid="training-progress-card"]',
        '[data-testid="safety-score-card"]',
        '[data-testid="grievances-submitted-card"]'
      ];

      for (const metric of workerMetrics) {
        await pageHelpers.waitForElement(metric);
        expect(await pageHelpers.elementIsVisible(metric)).toBe(true);
      }
    });

    test('should display worker-specific actions', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Check for worker-specific actions
      const actions = [
        '[data-testid="submit-grievance-action"]',
        '[data-testid="view-trainings-action"]',
        '[data-testid="view-safety-info-action"]'
      ];

      for (const action of actions) {
        await pageHelpers.waitForElement(action);
        expect(await pageHelpers.elementIsVisible(action)).toBe(true);
      }
    });

    test('should display worker announcements', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Check for announcements section
      await pageHelpers.waitForElement('[data-testid="announcements"]');
      
      // Check for announcement items
      const announcements = page.locator('[data-testid="announcement-item"]');
      const count = await announcements.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Auditor Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.loginAs('auditor');
    });

    test('should display auditor-specific dashboard', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Check for auditor-specific content
      await pageHelpers.waitForElement('[data-testid="auditor-dashboard"]');
      
      // Check for auditor metrics
      const auditorMetrics = [
        '[data-testid="assigned-audits-card"]',
        '[data-testid="completed-audits-card"]',
        '[data-testid="pending-reports-card"]'
      ];

      for (const metric of auditorMetrics) {
        await pageHelpers.waitForElement(metric);
        expect(await pageHelpers.elementIsVisible(metric)).toBe(true);
      }
    });

    test('should display audit schedule', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Check for audit schedule
      await pageHelpers.waitForElement('[data-testid="audit-schedule"]');
      
      // Check for upcoming audits
      const upcomingAudits = page.locator('[data-testid="upcoming-audit"]');
      const count = await upcomingAudits.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Dashboard Responsiveness', () => {
    test('should be responsive on mobile devices', async ({ page }) => {
      await authHelpers.loginAs('super_admin');
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await pageHelpers.navigateTo('/dashboard');
      
      // Check that dashboard is still functional on mobile
      await pageHelpers.waitForElement('[data-testid="dashboard-title"]');
      
      // Check that metrics cards are visible
      const metricsCard = page.locator('[data-testid="total-factories-card"]');
      expect(await metricsCard.isVisible()).toBe(true);
    });

    test('should be responsive on tablet devices', async ({ page }) => {
      await authHelpers.loginAs('factory_admin');
      
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await pageHelpers.navigateTo('/dashboard');
      
      // Check that dashboard is still functional on tablet
      await pageHelpers.waitForElement('[data-testid="factory-dashboard"]');
      
      // Check that charts are visible
      const chart = page.locator('[data-testid="factory-compliance-trend"]');
      expect(await chart.isVisible()).toBe(true);
    });
  });

  test.describe('Dashboard Performance', () => {
    test('should load dashboard within acceptable time', async ({ page }) => {
      await authHelpers.loginAs('super_admin');
      
      const startTime = Date.now();
      await pageHelpers.navigateTo('/dashboard');
      await pageHelpers.waitForElement('[data-testid="dashboard-title"]');
      const loadTime = Date.now() - startTime;
      
      // Dashboard should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle dashboard refresh gracefully', async ({ page }) => {
      await authHelpers.loginAs('worker');
      
      await pageHelpers.navigateTo('/dashboard');
      await pageHelpers.waitForElement('[data-testid="worker-dashboard"]');
      
      // Refresh the page
      await page.reload();
      await pageHelpers.waitForPageLoad();
      
      // Dashboard should still be functional
      await pageHelpers.waitForElement('[data-testid="worker-dashboard"]');
      expect(await pageHelpers.elementIsVisible('[data-testid="worker-dashboard"]')).toBe(true);
    });
  });
});
