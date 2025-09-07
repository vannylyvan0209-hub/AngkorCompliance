import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  FileText, 
  Shield, 
  AlertTriangle, 
  Calendar, 
  Settings, 
  LogOut,
  Building2,
  ClipboardList,
  GraduationCap,
  FileCheck,
  BarChart3,
  Bell,
  User,
  HelpCircle,
  X
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles: string[];
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    roles: ['super_admin', 'factory_admin', 'hr_staff', 'grievance_committee', 'auditor', 'analytics_user']
  },
  {
    id: 'factories',
    label: 'Factories',
    icon: Building2,
    path: '/factories',
    roles: ['super_admin', 'factory_admin']
  },
  {
    id: 'workers',
    label: 'Workers',
    icon: Users,
    path: '/workers',
    roles: ['super_admin', 'factory_admin', 'hr_staff']
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    path: '/documents',
    roles: ['super_admin', 'factory_admin', 'hr_staff', 'auditor']
  },
  {
    id: 'audits',
    label: 'Audits',
    icon: Shield,
    path: '/audits',
    roles: ['super_admin', 'factory_admin', 'auditor']
  },
  {
    id: 'grievances',
    label: 'Grievances',
    icon: AlertTriangle,
    path: '/grievances',
    roles: ['super_admin', 'factory_admin', 'grievance_committee'],
    badge: 3
  },
  {
    id: 'training',
    label: 'Training',
    icon: GraduationCap,
    path: '/training',
    roles: ['super_admin', 'factory_admin', 'hr_staff']
  },
  {
    id: 'permits',
    label: 'Permits',
    icon: FileCheck,
    path: '/permits',
    roles: ['super_admin', 'factory_admin', 'hr_staff']
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: ClipboardList,
    path: '/compliance',
    roles: ['super_admin', 'factory_admin', 'auditor']
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    path: '/analytics',
    roles: ['super_admin', 'analytics_user']
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    path: '/calendar',
    roles: ['super_admin', 'factory_admin', 'hr_staff', 'auditor']
  }
];

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const filteredNavigationItems = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    onClose();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl z-50 lg:hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AC</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Angkor</h1>
                  <p className="text-xs text-gray-500">Compliance</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    isActive ? 'text-yellow-600' : 'text-gray-500'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Link
              to="/notifications"
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Notifications</span>
            </Link>

            <Link
              to="/help"
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Help</span>
            </Link>

            <Link
              to="/settings"
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Settings</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
