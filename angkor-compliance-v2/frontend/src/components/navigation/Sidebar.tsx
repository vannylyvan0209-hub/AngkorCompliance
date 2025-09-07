import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Building2,
  ClipboardList,
  GraduationCap,
  FileCheck,
  BarChart3,
  Bell,
  User,
  HelpCircle
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles: string[];
  badge?: number;
  children?: NavigationItem[];
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

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const filteredNavigationItems = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Angkor</h1>
                <p className="text-xs text-gray-500">Compliance</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${
                isActive ? 'text-yellow-600' : 'text-gray-500 group-hover:text-gray-700'
              }`} />
              {!isCollapsed && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="mb-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Link
            to="/notifications"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <Bell className="w-5 h-5 text-gray-500" />
            {!isCollapsed && <span className="font-medium">Notifications</span>}
          </Link>

          <Link
            to="/help"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <HelpCircle className="w-5 h-5 text-gray-500" />
            {!isCollapsed && <span className="font-medium">Help</span>}
          </Link>

          <Link
            to="/settings"
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <Settings className="w-5 h-5 text-gray-500" />
            {!isCollapsed && <span className="font-medium">Settings</span>}
          </Link>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
