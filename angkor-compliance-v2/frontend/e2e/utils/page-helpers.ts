import { Page, expect, Locator } from '@playwright/test';

export class PageHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Navigate to a page and wait for it to load
   */
  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout: number = 10000): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(selector: string, timeout: number = 10000): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click element and wait for navigation
   */
  async clickAndWaitForNavigation(selector: string, expectedUrl?: string): Promise<void> {
    if (expectedUrl) {
      await Promise.all([
        this.page.waitForURL(expectedUrl),
        this.page.click(selector)
      ]);
    } else {
      await Promise.all([
        this.page.waitForNavigation(),
        this.page.click(selector)
      ]);
    }
  }

  /**
   * Fill form field
   */
  async fillField(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.selectOption(selector, value);
  }

  /**
   * Upload file
   */
  async uploadFile(selector: string, filePath: string): Promise<void> {
    await this.page.setInputFiles(selector, filePath);
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element is visible
   */
  async elementIsVisible(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get element text
   */
  async getElementText(selector: string): Promise<string> {
    const element = this.page.locator(selector);
    return await element.textContent() || '';
  }

  /**
   * Get element attribute
   */
  async getElementAttribute(selector: string, attribute: string): Promise<string | null> {
    const element = this.page.locator(selector);
    return await element.getAttribute(attribute);
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp, timeout: number = 10000): Promise<any> {
    const response = await this.page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        } else {
          return urlPattern.test(url);
        }
      },
      { timeout }
    );
    return response;
  }

  /**
   * Mock API response
   */
  async mockApiResponse(urlPattern: string | RegExp, responseData: any, status: number = 200): Promise<void> {
    await this.page.route(urlPattern, async route => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(responseData)
      });
    });
  }

  /**
   * Clear all mocks
   */
  async clearMocks(): Promise<void> {
    await this.page.unrouteAll();
  }

  /**
   * Wait for loading spinner to disappear
   */
  async waitForLoadingToComplete(): Promise<void> {
    // Wait for loading spinner to disappear
    await this.page.waitForSelector('[data-testid="loading-spinner"]', { 
      state: 'hidden', 
      timeout: 30000 
    });
  }

  /**
   * Wait for success message
   */
  async waitForSuccessMessage(): Promise<void> {
    await this.page.waitForSelector('[data-testid="success-message"]', { 
      state: 'visible', 
      timeout: 10000 
    });
  }

  /**
   * Wait for error message
   */
  async waitForErrorMessage(): Promise<void> {
    await this.page.waitForSelector('[data-testid="error-message"]', { 
      state: 'visible', 
      timeout: 10000 
    });
  }

  /**
   * Dismiss modal
   */
  async dismissModal(): Promise<void> {
    // Try different ways to dismiss modal
    const closeSelectors = [
      '[data-testid="modal-close"]',
      '[data-testid="close-button"]',
      '.modal-close',
      '[aria-label="Close"]',
      'button[aria-label="Close"]'
    ];

    for (const selector of closeSelectors) {
      if (await this.elementExists(selector)) {
        await this.page.click(selector);
        break;
      }
    }

    // If modal is still open, try pressing Escape
    if (await this.elementExists('[data-testid="modal"]')) {
      await this.page.keyboard.press('Escape');
    }
  }

  /**
   * Confirm dialog
   */
  async confirmDialog(): Promise<void> {
    const confirmSelectors = [
      '[data-testid="confirm-button"]',
      '[data-testid="yes-button"]',
      'button:has-text("Yes")',
      'button:has-text("Confirm")',
      'button:has-text("OK")'
    ];

    for (const selector of confirmSelectors) {
      if (await this.elementExists(selector)) {
        await this.page.click(selector);
        break;
      }
    }
  }

  /**
   * Cancel dialog
   */
  async cancelDialog(): Promise<void> {
    const cancelSelectors = [
      '[data-testid="cancel-button"]',
      '[data-testid="no-button"]',
      'button:has-text("No")',
      'button:has-text("Cancel")'
    ];

    for (const selector of cancelSelectors) {
      if (await this.elementExists(selector)) {
        await this.page.click(selector);
        break;
      }
    }
  }

  /**
   * Wait for table to load data
   */
  async waitForTableData(tableSelector: string = '[data-testid="data-table"]'): Promise<void> {
    // Wait for table to be visible
    await this.waitForElement(tableSelector);
    
    // Wait for table rows to load (not just loading state)
    await this.page.waitForFunction(
      (selector) => {
        const table = document.querySelector(selector);
        if (!table) return false;
        
        const rows = table.querySelectorAll('tbody tr');
        return rows.length > 0 && !table.querySelector('[data-testid="loading"]');
      },
      tableSelector,
      { timeout: 30000 }
    );
  }

  /**
   * Get table row count
   */
  async getTableRowCount(tableSelector: string = '[data-testid="data-table"]'): Promise<number> {
    const rows = this.page.locator(`${tableSelector} tbody tr`);
    return await rows.count();
  }

  /**
   * Search in table
   */
  async searchInTable(searchTerm: string, searchSelector: string = '[data-testid="search-input"]'): Promise<void> {
    await this.page.fill(searchSelector, searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForTableData();
  }

  /**
   * Sort table by column
   */
  async sortTableByColumn(columnName: string, tableSelector: string = '[data-testid="data-table"]'): Promise<void> {
    const columnHeader = this.page.locator(`${tableSelector} th:has-text("${columnName}")`);
    await columnHeader.click();
    await this.waitForTableData();
  }

  /**
   * Paginate table
   */
  async paginateTable(direction: 'next' | 'previous', tableSelector: string = '[data-testid="data-table"]'): Promise<void> {
    const buttonSelector = direction === 'next' 
      ? '[data-testid="next-page"]' 
      : '[data-testid="previous-page"]';
    
    await this.page.click(buttonSelector);
    await this.waitForTableData();
  }
}
