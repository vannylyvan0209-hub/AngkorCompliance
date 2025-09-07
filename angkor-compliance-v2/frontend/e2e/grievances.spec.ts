import { test, expect } from '@playwright/test';
import { AuthHelpers } from './utils/auth-helpers';
import { PageHelpers } from './utils/page-helpers';
import { testGrievances, generateRandomName } from './fixtures/test-data';

test.describe('Grievance Management', () => {
  let authHelpers: AuthHelpers;
  let pageHelpers: PageHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    pageHelpers = new PageHelpers(page);
  });

  test.describe('Worker Grievance Submission', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.loginAs('worker');
    });

    test('should submit a new grievance successfully', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Click on submit grievance button
      await page.click('[data-testid="submit-grievance-button"]');
      
      // Fill grievance form
      await pageHelpers.fillField('[data-testid="grievance-title"]', 'Test Safety Issue');
      await pageHelpers.fillField('[data-testid="grievance-description"]', 'This is a test grievance about safety issues in the workplace.');
      await pageHelpers.selectOption('[data-testid="grievance-category"]', 'safety');
      await pageHelpers.selectOption('[data-testid="grievance-priority"]', 'high');
      
      // Submit the grievance
      await page.click('[data-testid="submit-button"]');
      
      // Wait for success message
      await pageHelpers.waitForSuccessMessage();
      
      // Verify grievance was created
      const successMessage = await pageHelpers.getElementText('[data-testid="success-message"]');
      expect(successMessage).toContain('Grievance submitted successfully');
    });

    test('should show validation errors for incomplete form', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Click on submit grievance button
      await page.click('[data-testid="submit-grievance-button"]');
      
      // Try to submit empty form
      await page.click('[data-testid="submit-button"]');
      
      // Check for validation errors
      const titleError = await pageHelpers.getElementText('[data-testid="title-error"]');
      const descriptionError = await pageHelpers.getElementText('[data-testid="description-error"]');
      
      expect(titleError).toContain('Title is required');
      expect(descriptionError).toContain('Description is required');
    });

    test('should allow anonymous grievance submission', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Click on submit grievance button
      await page.click('[data-testid="submit-grievance-button"]');
      
      // Check anonymous option
      await page.check('[data-testid="anonymous-checkbox"]');
      
      // Fill grievance form
      await pageHelpers.fillField('[data-testid="grievance-title"]', 'Anonymous Test Grievance');
      await pageHelpers.fillField('[data-testid="grievance-description"]', 'This is an anonymous test grievance.');
      await pageHelpers.selectOption('[data-testid="grievance-category"]', 'harassment');
      await pageHelpers.selectOption('[data-testid="grievance-priority"]', 'medium');
      
      // Submit the grievance
      await page.click('[data-testid="submit-button"]');
      
      // Wait for success message
      await pageHelpers.waitForSuccessMessage();
      
      // Verify anonymous grievance was created
      const successMessage = await pageHelpers.getElementText('[data-testid="success-message"]');
      expect(successMessage).toContain('Anonymous grievance submitted successfully');
    });
  });

  test.describe('Grievance List View', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.loginAs('factory_admin');
    });

    test('should display grievances list', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Wait for grievances table to load
      await pageHelpers.waitForTableData('[data-testid="grievances-table"]');
      
      // Check for table headers
      const headers = [
        'Title',
        'Category',
        'Priority',
        'Status',
        'Date Submitted',
        'Actions'
      ];

      for (const header of headers) {
        const headerElement = page.locator(`th:has-text("${header}")`);
        expect(await headerElement.isVisible()).toBe(true);
      }
    });

    test('should filter grievances by status', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Wait for table to load
      await pageHelpers.waitForTableData('[data-testid="grievances-table"]');
      
      // Filter by open status
      await pageHelpers.selectOption('[data-testid="status-filter"]', 'open');
      
      // Wait for filtered results
      await pageHelpers.waitForTableData('[data-testid="grievances-table"]');
      
      // Verify all visible grievances have open status
      const statusCells = page.locator('[data-testid="grievances-table"] tbody tr td:nth-child(4)');
      const count = await statusCells.count();
      
      for (let i = 0; i < count; i++) {
        const status = await statusCells.nth(i).textContent();
        expect(status).toContain('Open');
      }
    });

    test('should search grievances by title', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Wait for table to load
      await pageHelpers.waitForTableData('[data-testid="grievances-table"]');
      
      // Search for specific grievance
      await pageHelpers.searchInTable('Safety Issue', '[data-testid="search-input"]');
      
      // Verify search results
      const titleCells = page.locator('[data-testid="grievances-table"] tbody tr td:nth-child(1)');
      const count = await titleCells.count();
      
      for (let i = 0; i < count; i++) {
        const title = await titleCells.nth(i).textContent();
        expect(title?.toLowerCase()).toContain('safety issue');
      }
    });

    test('should sort grievances by date', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Wait for table to load
      await pageHelpers.waitForTableData('[data-testid="grievances-table"]');
      
      // Sort by date submitted
      await pageHelpers.sortTableByColumn('Date Submitted', '[data-testid="grievances-table"]');
      
      // Verify sorting (newest first)
      const dateCells = page.locator('[data-testid="grievances-table"] tbody tr td:nth-child(5)');
      const firstDate = await dateCells.first().textContent();
      const lastDate = await dateCells.last().textContent();
      
      // First date should be more recent than last date
      expect(new Date(firstDate!).getTime()).toBeGreaterThanOrEqual(new Date(lastDate!).getTime());
    });
  });

  test.describe('Grievance Details', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.loginAs('factory_admin');
    });

    test('should display grievance details', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Wait for table to load
      await pageHelpers.waitForTableData('[data-testid="grievances-table"]');
      
      // Click on first grievance
      await page.click('[data-testid="grievances-table"] tbody tr:first-child [data-testid="view-button"]');
      
      // Wait for grievance details page
      await pageHelpers.waitForElement('[data-testid="grievance-details"]');
      
      // Check for grievance details
      const details = [
        '[data-testid="grievance-title"]',
        '[data-testid="grievance-description"]',
        '[data-testid="grievance-category"]',
        '[data-testid="grievance-priority"]',
        '[data-testid="grievance-status"]',
        '[data-testid="grievance-date-submitted"]'
      ];

      for (const detail of details) {
        await pageHelpers.waitForElement(detail);
        expect(await pageHelpers.elementIsVisible(detail)).toBe(true);
      }
    });

    test('should update grievance status', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Wait for table to load
      await pageHelpers.waitForTableData('[data-testid="grievances-table"]');
      
      // Click on first grievance
      await page.click('[data-testid="grievances-table"] tbody tr:first-child [data-testid="view-button"]');
      
      // Wait for grievance details page
      await pageHelpers.waitForElement('[data-testid="grievance-details"]');
      
      // Update status to in progress
      await pageHelpers.selectOption('[data-testid="status-select"]', 'in_progress');
      await page.click('[data-testid="update-status-button"]');
      
      // Wait for success message
      await pageHelpers.waitForSuccessMessage();
      
      // Verify status was updated
      const status = await pageHelpers.getElementText('[data-testid="grievance-status"]');
      expect(status).toContain('In Progress');
    });

    test('should add comments to grievance', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Wait for table to load
      await pageHelpers.waitForTableData('[data-testid="grievances-table"]');
      
      // Click on first grievance
      await page.click('[data-testid="grievances-table"] tbody tr:first-child [data-testid="view-button"]');
      
      // Wait for grievance details page
      await pageHelpers.waitForElement('[data-testid="grievance-details"]');
      
      // Add comment
      await pageHelpers.fillField('[data-testid="comment-input"]', 'This is a test comment on the grievance.');
      await page.click('[data-testid="add-comment-button"]');
      
      // Wait for success message
      await pageHelpers.waitForSuccessMessage();
      
      // Verify comment was added
      await pageHelpers.waitForElement('[data-testid="comment-item"]');
      const comment = await pageHelpers.getElementText('[data-testid="comment-item"]');
      expect(comment).toContain('This is a test comment on the grievance.');
    });
  });

  test.describe('Grievance Committee Actions', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.loginAs('grievance_committee');
    });

    test('should assign grievance to committee member', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Wait for table to load
      await pageHelpers.waitForTableData('[data-testid="grievances-table"]');
      
      // Click on first grievance
      await page.click('[data-testid="grievances-table"] tbody tr:first-child [data-testid="view-button"]');
      
      // Wait for grievance details page
      await pageHelpers.waitForElement('[data-testid="grievance-details"]');
      
      // Assign to committee member
      await pageHelpers.selectOption('[data-testid="assignee-select"]', 'committee-member-1');
      await page.click('[data-testid="assign-button"]');
      
      // Wait for success message
      await pageHelpers.waitForSuccessMessage();
      
      // Verify assignment
      const assignee = await pageHelpers.getElementText('[data-testid="grievance-assignee"]');
      expect(assignee).toContain('Committee Member 1');
    });

    test('should escalate grievance', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Wait for table to load
      await pageHelpers.waitForTableData('[data-testid="grievances-table"]');
      
      // Click on first grievance
      await page.click('[data-testid="grievances-table"] tbody tr:first-child [data-testid="view-button"]');
      
      // Wait for grievance details page
      await pageHelpers.waitForElement('[data-testid="grievance-details"]');
      
      // Escalate grievance
      await page.click('[data-testid="escalate-button"]');
      
      // Confirm escalation
      await pageHelpers.confirmDialog();
      
      // Wait for success message
      await pageHelpers.waitForSuccessMessage();
      
      // Verify escalation
      const status = await pageHelpers.getElementText('[data-testid="grievance-status"]');
      expect(status).toContain('Escalated');
    });
  });

  test.describe('Grievance Reports', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.loginAs('factory_admin');
    });

    test('should generate grievance report', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Click on generate report button
      await page.click('[data-testid="generate-report-button"]');
      
      // Select report parameters
      await pageHelpers.selectOption('[data-testid="report-type"]', 'summary');
      await pageHelpers.selectOption('[data-testid="date-range"]', 'last_month');
      
      // Generate report
      await page.click('[data-testid="generate-button"]');
      
      // Wait for report to be generated
      await pageHelpers.waitForElement('[data-testid="report-content"]');
      
      // Verify report content
      const reportContent = await pageHelpers.getElementText('[data-testid="report-content"]');
      expect(reportContent).toContain('Grievance Report');
    });

    test('should export grievance data', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances');
      
      // Wait for table to load
      await pageHelpers.waitForTableData('[data-testid="grievances-table"]');
      
      // Click on export button
      await page.click('[data-testid="export-button"]');
      
      // Select export format
      await pageHelpers.selectOption('[data-testid="export-format"]', 'csv');
      
      // Export data
      await page.click('[data-testid="export-data-button"]');
      
      // Wait for download to start
      const downloadPromise = page.waitForEvent('download');
      await downloadPromise;
    });
  });

  test.describe('Grievance Analytics', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.loginAs('super_admin');
    });

    test('should display grievance analytics dashboard', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances/analytics');
      
      // Check for analytics charts
      const charts = [
        '[data-testid="grievance-trends-chart"]',
        '[data-testid="category-distribution-chart"]',
        '[data-testid="resolution-time-chart"]',
        '[data-testid="satisfaction-rating-chart"]'
      ];

      for (const chart of charts) {
        await pageHelpers.waitForElement(chart);
        expect(await pageHelpers.elementIsVisible(chart)).toBe(true);
      }
    });

    test('should filter analytics by date range', async ({ page }) => {
      await pageHelpers.navigateTo('/grievances/analytics');
      
      // Select date range
      await pageHelpers.selectOption('[data-testid="date-range-filter"]', 'last_quarter');
      
      // Wait for charts to update
      await page.waitForTimeout(2000);
      
      // Verify charts are still visible
      const chart = page.locator('[data-testid="grievance-trends-chart"]');
      expect(await chart.isVisible()).toBe(true);
    });
  });
});
