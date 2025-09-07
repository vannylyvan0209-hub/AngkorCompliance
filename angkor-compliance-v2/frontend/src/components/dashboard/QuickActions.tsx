import React from 'react';
import { 
  Plus, 
  FileText, 
  Users, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  BarChart3,
  Settings,
  Upload,
  Download,
  Bell
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  href: string;
  category: 'create' | 'view' | 'manage' | 'export';
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  actions = [
    {
      id: '1',
      title: 'New Audit',
      description: 'Create a new compliance audit',
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/audits/new',
      category: 'create'
    },
    {
      id: '2',
      title: 'Submit Grievance',
      description: 'Submit a new worker grievance',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/grievances/new',
      category: 'create'
    },
    {
      id: '3',
      title: 'Schedule Training',
      description: 'Schedule a new training session',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/training/new',
      category: 'create'
    },
    {
      id: '4',
      title: 'Upload Document',
      description: 'Upload a new document',
      icon: Upload,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/documents/upload',
      category: 'create'
    },
    {
      id: '5',
      title: 'View Analytics',
      description: 'View compliance analytics',
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      href: '/analytics',
      category: 'view'
    },
    {
      id: '6',
      title: 'Manage Users',
      description: 'Manage user accounts',
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      href: '/users',
      category: 'manage'
    },
    {
      id: '7',
      title: 'Export Data',
      description: 'Export compliance data',
      icon: Download,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      href: '/exports',
      category: 'export'
    },
    {
      id: '8',
      title: 'Calendar View',
      description: 'View compliance calendar',
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      href: '/calendar',
      category: 'view'
    }
  ]
}) => {
  const categories = {
    create: { title: 'Create New', color: 'text-green-600' },
    view: { title: 'View & Analyze', color: 'text-blue-600' },
    manage: { title: 'Manage', color: 'text-purple-600' },
    export: { title: 'Export & Reports', color: 'text-gray-600' }
  };

  const groupedActions = actions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
          Quick Actions
        </h3>
        
        <div className="space-y-6">
          {Object.entries(groupedActions).map(([category, categoryActions]) => (
            <div key={category}>
              <h4 className={`text-sm font-medium ${categories[category as keyof typeof categories].color} mb-3`}>
                {categories[category as keyof typeof categories].title}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {categoryActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={action.id}
                      href={action.href}
                      className="group relative bg-white p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 w-10 h-10 ${action.bgColor} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${action.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                            {action.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
