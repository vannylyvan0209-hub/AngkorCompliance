import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock auth store
const mockAuthStore = {
  user: {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'factory_admin',
    factoryId: '1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  token: 'mock-token',
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  updateProfile: vi.fn(),
  refreshToken: vi.fn()
};

// Mock factory store
const mockFactoryStore = {
  factories: [],
  currentFactory: null,
  isLoading: false,
  error: null,
  fetchFactories: vi.fn(),
  setCurrentFactory: vi.fn(),
  createFactory: vi.fn(),
  updateFactory: vi.fn(),
  deleteFactory: vi.fn()
};

// Mock notification store
const mockNotificationStore = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  fetchNotifications: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteNotification: vi.fn(),
  addNotification: vi.fn()
};

// Mock UI store
const mockUIStore = {
  sidebarOpen: false,
  theme: 'light',
  language: 'en',
  setSidebarOpen: vi.fn(),
  setTheme: vi.fn(),
  setLanguage: vi.fn(),
  toggleSidebar: vi.fn()
};

// Mock all stores
vi.mock('../stores/authStore', () => ({
  useAuthStore: () => mockAuthStore
}));

vi.mock('../stores/factoryStore', () => ({
  useFactoryStore: () => mockFactoryStore
}));

vi.mock('../stores/notificationStore', () => ({
  useNotificationStore: () => mockNotificationStore
}));

vi.mock('../stores/uiStore', () => ({
  useUIStore: () => mockUIStore
}));

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Export mock stores for use in tests
export {
  mockAuthStore,
  mockFactoryStore,
  mockNotificationStore,
  mockUIStore
};
