import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, Factory, Notification } from '../types';

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        
        login: async (email: string, password: string) => {
          set({ isLoading: true });
          try {
            // TODO: Implement actual login API call
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            });
            
            if (!response.ok) {
              throw new Error('Login failed');
            }
            
            const { user, token } = await response.json();
            set({ user, token, isAuthenticated: true, isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },
        
        logout: () => {
          set({ user: null, token: null, isAuthenticated: false });
          // Clear any stored data
          localStorage.removeItem('auth-storage');
        },
        
        updateUser: (userData: Partial<User>) => {
          const currentUser = get().user;
          if (currentUser) {
            set({ user: { ...currentUser, ...userData } });
          }
        },
        
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// Factory Store
interface FactoryState {
  factories: Factory[];
  currentFactory: Factory | null;
  isLoading: boolean;
  setFactories: (factories: Factory[]) => void;
  setCurrentFactory: (factory: Factory | null) => void;
  addFactory: (factory: Factory) => void;
  updateFactory: (id: string, updates: Partial<Factory>) => void;
  deleteFactory: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useFactoryStore = create<FactoryState>()(
  devtools((set, get) => ({
    factories: [],
    currentFactory: null,
    isLoading: false,
    
    setFactories: (factories: Factory[]) => {
      set({ factories });
    },
    
    setCurrentFactory: (factory: Factory | null) => {
      set({ currentFactory: factory });
    },
    
    addFactory: (factory: Factory) => {
      const currentFactories = get().factories;
      set({ factories: [...currentFactories, factory] });
    },
    
    updateFactory: (id: string, updates: Partial<Factory>) => {
      const currentFactories = get().factories;
      const updatedFactories = currentFactories.map(factory =>
        factory.id === id ? { ...factory, ...updates } : factory
      );
      set({ factories: updatedFactories });
      
      // Update current factory if it's the one being updated
      const currentFactory = get().currentFactory;
      if (currentFactory?.id === id) {
        set({ currentFactory: { ...currentFactory, ...updates } });
      }
    },
    
    deleteFactory: (id: string) => {
      const currentFactories = get().factories;
      const filteredFactories = currentFactories.filter(factory => factory.id !== id);
      set({ factories: filteredFactories });
      
      // Clear current factory if it's the one being deleted
      const currentFactory = get().currentFactory;
      if (currentFactory?.id === id) {
        set({ currentFactory: null });
      }
    },
    
    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },
  }))
);

// Notification Store
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools((set, get) => ({
    notifications: [],
    unreadCount: 0,
    
    addNotification: (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
      const notification: Notification = {
        ...notificationData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      
      const currentNotifications = get().notifications;
      const updatedNotifications = [notification, ...currentNotifications];
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      
      set({ notifications: updatedNotifications, unreadCount });
    },
    
    markAsRead: (id: string) => {
      const currentNotifications = get().notifications;
      const updatedNotifications = currentNotifications.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      );
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      
      set({ notifications: updatedNotifications, unreadCount });
    },
    
    markAllAsRead: () => {
      const currentNotifications = get().notifications;
      const updatedNotifications = currentNotifications.map(notification =>
        ({ ...notification, isRead: true })
      );
      
      set({ notifications: updatedNotifications, unreadCount: 0 });
    },
    
    removeNotification: (id: string) => {
      const currentNotifications = get().notifications;
      const filteredNotifications = currentNotifications.filter(n => n.id !== id);
      const unreadCount = filteredNotifications.filter(n => !n.isRead).length;
      
      set({ notifications: filteredNotifications, unreadCount });
    },
    
    clearAll: () => {
      set({ notifications: [], unreadCount: 0 });
    },
  }))
);

// UI Store
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'km';
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'en' | 'km') => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        theme: 'system',
        language: 'en',
        
        toggleSidebar: () => {
          set((state) => ({ sidebarOpen: !state.sidebarOpen }));
        },
        
        setSidebarOpen: (open: boolean) => {
          set({ sidebarOpen: open });
        },
        
        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set({ theme });
        },
        
        setLanguage: (language: 'en' | 'km') => {
          set({ language });
        },
      }),
      {
        name: 'ui-storage',
      }
    )
  )
);

// Role-based access control helper
export const usePermissions = () => {
  const { user } = useAuthStore();
  
  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'super-admin') return true;
    
    // Check user permissions
    return user.permissions.some(
      permission => 
        permission.resource === resource && 
        permission.action === action
    );
  };
  
  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };
  
  const canAccessFactory = (factoryId: string): boolean => {
    if (!user) return false;
    
    // Super admin can access all factories
    if (user.role === 'super-admin') return true;
    
    // Factory admin can only access their factory
    if (user.role === 'factory-admin') {
      return user.factoryId === factoryId;
    }
    
    // Other roles have specific factory access
    return user.factoryId === factoryId;
  };
  
  return {
    hasPermission,
    hasRole,
    canAccessFactory,
    user,
  };
};
