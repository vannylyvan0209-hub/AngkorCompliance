import { Page, expect } from '@playwright/test';
import { TestUser, getTestUser } from '../fixtures/test-data';

export class AuthHelpers {
  constructor(private page: Page) {}

  /**
   * Login with a specific user role
   */
  async loginAs(role: string): Promise<void> {
    const user = getTestUser(role);
    if (!user) {
      throw new Error(`Test user with role ${role} not found`);
    }

    await this.login(user.email, user.password);
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<void> {
    // Navigate to login page
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');

    // Fill in login form
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);

    // Submit form
    await this.page.click('[data-testid="login-button"]');

    // Wait for successful login (redirect to dashboard)
    await this.page.waitForURL('/dashboard', { timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Logout from the application
   */
  async logout(): Promise<void> {
    // Click on user menu
    await this.page.click('[data-testid="user-menu"]');
    
    // Click logout button
    await this.page.click('[data-testid="logout-button"]');

    // Wait for redirect to login page
    await this.page.waitForURL('/login', { timeout: 10000 });
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user has specific role
   */
  async hasRole(role: string): Promise<boolean> {
    try {
      // Check if role-specific navigation items are visible
      const roleSelectors = {
        super_admin: '[data-testid="admin-menu"]',
        factory_admin: '[data-testid="factory-admin-menu"]',
        worker: '[data-testid="worker-menu"]',
        auditor: '[data-testid="auditor-menu"]',
        hr_staff: '[data-testid="hr-menu"]',
        grievance_committee: '[data-testid="grievance-menu"]'
      };

      const selector = roleSelectors[role as keyof typeof roleSelectors];
      if (selector) {
        await this.page.waitForSelector(selector, { timeout: 5000 });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Register a new user
   */
  async register(userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
  }): Promise<void> {
    // Navigate to register page
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');

    // Fill in registration form
    await this.page.fill('[data-testid="name-input"]', userData.name);
    await this.page.fill('[data-testid="email-input"]', userData.email);
    await this.page.fill('[data-testid="password-input"]', userData.password);
    await this.page.fill('[data-testid="confirm-password-input"]', userData.confirmPassword);
    
    // Select role if role selector exists
    if (await this.page.locator('[data-testid="role-select"]').isVisible()) {
      await this.page.selectOption('[data-testid="role-select"]', userData.role);
    }

    // Submit form
    await this.page.click('[data-testid="register-button"]');

    // Wait for success message or redirect
    await this.page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 });
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    // Navigate to forgot password page
    await this.page.goto('/forgot-password');
    await this.page.waitForLoadState('networkidle');

    // Fill in email
    await this.page.fill('[data-testid="email-input"]', email);

    // Submit form
    await this.page.click('[data-testid="reset-password-button"]');

    // Wait for success message
    await this.page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 });
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    // Navigate to change password page
    await this.page.goto('/change-password');
    await this.page.waitForLoadState('networkidle');

    // Fill in form
    await this.page.fill('[data-testid="current-password-input"]', currentPassword);
    await this.page.fill('[data-testid="new-password-input"]', newPassword);
    await this.page.fill('[data-testid="confirm-password-input"]', newPassword);

    // Submit form
    await this.page.click('[data-testid="change-password-button"]');

    // Wait for success message
    await this.page.waitForSelector('[data-testid="success-message"]', { timeout: 10000 });
  }

  /**
   * Verify email
   */
  async verifyEmail(email: string): Promise<void> {
    // This would typically involve checking email or using a test email service
    // For E2E tests, we might mock this or use a test email service
    console.log(`Email verification sent to: ${email}`);
  }

  /**
   * Check if user can access a specific route
   */
  async canAccessRoute(route: string): Promise<boolean> {
    try {
      await this.page.goto(route);
      await this.page.waitForLoadState('networkidle');
      
      // Check if we're redirected to login or if there's an access denied message
      const currentUrl = this.page.url();
      if (currentUrl.includes('/login') || currentUrl.includes('/access-denied')) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for authentication state to be ready
   */
  async waitForAuthReady(): Promise<void> {
    // Wait for auth state to be initialized
    await this.page.waitForFunction(() => {
      return window.localStorage.getItem('auth-token') !== null || 
             window.localStorage.getItem('auth-state') !== null;
    }, { timeout: 10000 });
  }

  /**
   * Get current user info from localStorage
   */
  async getCurrentUser(): Promise<any> {
    return await this.page.evaluate(() => {
      const userData = localStorage.getItem('user-data');
      return userData ? JSON.parse(userData) : null;
    });
  }

  /**
   * Set auth token in localStorage (for testing purposes)
   */
  async setAuthToken(token: string): Promise<void> {
    await this.page.evaluate((authToken) => {
      localStorage.setItem('auth-token', authToken);
    }, token);
  }

  /**
   * Clear auth data from localStorage
   */
  async clearAuthData(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user-data');
      localStorage.removeItem('auth-state');
    });
  }
}
