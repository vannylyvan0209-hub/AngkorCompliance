import { test, expect } from '@playwright/test';
import { AuthHelpers } from './utils/auth-helpers';
import { PageHelpers } from './utils/page-helpers';
import { testUsers, generateRandomEmail, generateRandomName } from './fixtures/test-data';

test.describe('Authentication', () => {
  let authHelpers: AuthHelpers;
  let pageHelpers: PageHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    pageHelpers = new PageHelpers(page);
  });

  test.describe('Login', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      const user = testUsers.find(u => u.role === 'super_admin')!;
      
      await authHelpers.login(user.email, user.password);
      
      // Verify user is logged in
      expect(await authHelpers.isLoggedIn()).toBe(true);
      expect(await authHelpers.hasRole('super_admin')).toBe(true);
      
      // Verify redirect to dashboard
      expect(page.url()).toContain('/dashboard');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await pageHelpers.navigateTo('/login');
      
      await pageHelpers.fillField('[data-testid="email-input"]', 'invalid@test.com');
      await pageHelpers.fillField('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      // Wait for error message
      await pageHelpers.waitForErrorMessage();
      
      // Verify error message is displayed
      const errorMessage = await pageHelpers.getElementText('[data-testid="error-message"]');
      expect(errorMessage).toContain('Invalid credentials');
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await pageHelpers.navigateTo('/login');
      
      // Try to submit empty form
      await page.click('[data-testid="login-button"]');
      
      // Check for validation errors
      const emailError = await pageHelpers.getElementText('[data-testid="email-error"]');
      const passwordError = await pageHelpers.getElementText('[data-testid="password-error"]');
      
      expect(emailError).toContain('Email is required');
      expect(passwordError).toContain('Password is required');
    });

    test('should redirect to login when accessing protected route without auth', async ({ page }) => {
      await pageHelpers.navigateTo('/dashboard');
      
      // Should be redirected to login
      expect(page.url()).toContain('/login');
    });

    test('should remember login state after page refresh', async ({ page }) => {
      const user = testUsers.find(u => u.role === 'factory_admin')!;
      
      await authHelpers.login(user.email, user.password);
      
      // Refresh page
      await page.reload();
      await pageHelpers.waitForPageLoad();
      
      // Should still be logged in
      expect(await authHelpers.isLoggedIn()).toBe(true);
      expect(page.url()).toContain('/dashboard');
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      const user = testUsers.find(u => u.role === 'worker')!;
      
      await authHelpers.login(user.email, user.password);
      await authHelpers.logout();
      
      // Should be redirected to login
      expect(page.url()).toContain('/login');
      expect(await authHelpers.isLoggedIn()).toBe(false);
    });
  });

  test.describe('Registration', () => {
    test('should register new user successfully', async ({ page }) => {
      const userData = {
        name: generateRandomName(),
        email: generateRandomEmail(),
        password: 'Test123!',
        confirmPassword: 'Test123!',
        role: 'worker'
      };

      await authHelpers.register(userData);
      
      // Should show success message
      await pageHelpers.waitForSuccessMessage();
      
      // Should be redirected to login or dashboard
      expect(page.url()).toMatch(/\/(login|dashboard)/);
    });

    test('should show error for existing email', async ({ page }) => {
      const existingUser = testUsers[0];
      
      const userData = {
        name: generateRandomName(),
        email: existingUser.email,
        password: 'Test123!',
        confirmPassword: 'Test123!',
        role: 'worker'
      };

      await authHelpers.register(userData);
      
      // Should show error message
      await pageHelpers.waitForErrorMessage();
      
      const errorMessage = await pageHelpers.getElementText('[data-testid="error-message"]');
      expect(errorMessage).toContain('Email already exists');
    });

    test('should show validation errors for invalid data', async ({ page }) => {
      await pageHelpers.navigateTo('/register');
      
      // Fill invalid data
      await pageHelpers.fillField('[data-testid="name-input"]', '');
      await pageHelpers.fillField('[data-testid="email-input"]', 'invalid-email');
      await pageHelpers.fillField('[data-testid="password-input"]', '123');
      await pageHelpers.fillField('[data-testid="confirm-password-input"]', '456');
      
      await page.click('[data-testid="register-button"]');
      
      // Check for validation errors
      const nameError = await pageHelpers.getElementText('[data-testid="name-error"]');
      const emailError = await pageHelpers.getElementText('[data-testid="email-error"]');
      const passwordError = await pageHelpers.getElementText('[data-testid="password-error"]');
      const confirmPasswordError = await pageHelpers.getElementText('[data-testid="confirm-password-error"]');
      
      expect(nameError).toContain('Name is required');
      expect(emailError).toContain('Invalid email');
      expect(passwordError).toContain('Password too weak');
      expect(confirmPasswordError).toContain('Passwords do not match');
    });
  });

  test.describe('Password Reset', () => {
    test('should send password reset email', async ({ page }) => {
      const user = testUsers[0];
      
      await authHelpers.resetPassword(user.email);
      
      // Should show success message
      await pageHelpers.waitForSuccessMessage();
      
      const successMessage = await pageHelpers.getElementText('[data-testid="success-message"]');
      expect(successMessage).toContain('Password reset email sent');
    });

    test('should show error for non-existent email', async ({ page }) => {
      await authHelpers.resetPassword('nonexistent@test.com');
      
      // Should show error message
      await pageHelpers.waitForErrorMessage();
      
      const errorMessage = await pageHelpers.getElementText('[data-testid="error-message"]');
      expect(errorMessage).toContain('Email not found');
    });
  });

  test.describe('Role-based Access', () => {
    test('should allow super admin to access all routes', async ({ page }) => {
      await authHelpers.loginAs('super_admin');
      
      const protectedRoutes = [
        '/dashboard',
        '/users',
        '/factories',
        '/audits',
        '/grievances',
        '/reports',
        '/settings'
      ];

      for (const route of protectedRoutes) {
        expect(await authHelpers.canAccessRoute(route)).toBe(true);
      }
    });

    test('should restrict worker access to limited routes', async ({ page }) => {
      await authHelpers.loginAs('worker');
      
      const allowedRoutes = ['/dashboard', '/grievances'];
      const restrictedRoutes = ['/users', '/factories', '/audits', '/reports', '/settings'];

      for (const route of allowedRoutes) {
        expect(await authHelpers.canAccessRoute(route)).toBe(true);
      }

      for (const route of restrictedRoutes) {
        expect(await authHelpers.canAccessRoute(route)).toBe(false);
      }
    });

    test('should restrict factory admin access appropriately', async ({ page }) => {
      await authHelpers.loginAs('factory_admin');
      
      const allowedRoutes = ['/dashboard', '/factories', '/audits', '/grievances'];
      const restrictedRoutes = ['/users', '/reports', '/settings'];

      for (const route of allowedRoutes) {
        expect(await authHelpers.canAccessRoute(route)).toBe(true);
      }

      for (const route of restrictedRoutes) {
        expect(await authHelpers.canAccessRoute(route)).toBe(false);
      }
    });
  });

  test.describe('Session Management', () => {
    test('should handle session expiration', async ({ page }) => {
      const user = testUsers.find(u => u.role === 'auditor')!;
      
      await authHelpers.login(user.email, user.password);
      
      // Simulate session expiration by clearing auth data
      await authHelpers.clearAuthData();
      
      // Try to access protected route
      await pageHelpers.navigateTo('/dashboard');
      
      // Should be redirected to login
      expect(page.url()).toContain('/login');
    });

    test('should refresh token automatically', async ({ page }) => {
      const user = testUsers.find(u => u.role === 'hr_staff')!;
      
      await authHelpers.login(user.email, user.password);
      
      // Wait for token refresh (if implemented)
      await page.waitForTimeout(5000);
      
      // Should still be logged in
      expect(await authHelpers.isLoggedIn()).toBe(true);
    });
  });
});
