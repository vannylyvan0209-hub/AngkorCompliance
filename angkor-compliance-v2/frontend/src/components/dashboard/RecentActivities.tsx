import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Users, 
  Shield, 
  Clock,
  ArrowRight
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'audit' | 'grievance' | 'training' | 'document' | 'user' | 'compliance';
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'in-progress' | 'overdue';
  user: string;
}

interface RecentActivitiesProps {
  activities?: Activity[];
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ 
  activities = [
    {
      id: '1',
      type: 'audit',
      title: 'SMETA Audit Completed',
      description: 'Factory A SMETA audit has been completed successfully',
      timestamp: '2 hours ago',
      status: 'completed',
      user: 'John Smith'
    },
    {
      id: '2',
      type: 'grievance',
      title: 'New Grievance Submitted',
      description: 'Worker safety concern submitted by anonymous user',
      timestamp: '4 hours ago',
      status: 'pending',
      user: 'Anonymous'
    },
    {
      id: '3',
      type: 'training',
      title: 'Safety Training Completed',
      description: '25 workers completed safety training module',
      timestamp: '6 hours ago',
      status: 'completed',
      user: 'HR Team'
    },
    {
      id: '4',
      type: 'document',
      title: 'Policy Document Updated',
      description: 'Workplace safety policy has been updated',
      timestamp: '1 day ago',
      status: 'completed',
      user: 'Admin User'
    },
    {
      id: '5',
      type: 'compliance',
      title: 'Compliance Check Due',
      description: 'Monthly compliance check is due in 3 days',
      timestamp: '2 days ago',
      status: 'overdue',
      user: 'System'
    }
  ]
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'audit':
        return Shield;
      case 'grievance':
        return AlertTriangle;
      case 'training':
        return CheckCircle;
      case 'document':
        return FileText;
      case 'user':
        return Users;
      case 'compliance':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'audit':
        return 'text-blue-600 bg-blue-100';
      case 'grievance':
        return 'text-orange-600 bg-orange-100';
      case 'training':
        return 'text-green-600 bg-green-100';
      case 'document':
        return 'text-purple-600 bg-purple-100';
      case 'user':
        return 'text-indigo-600 bg-indigo-100';
      case 'compliance':
        return 'text-emerald-600 bg-emerald-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Activities
          </h3>
          <button className="text-sm text-amber-600 hover:text-amber-500 font-medium flex items-center">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
        
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIdx) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(activity.type)}`}>
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-900 font-medium">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.description}
                          </p>
                          <div className="mt-2 flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                              {getStatusText(activity.status)}
                            </span>
                            <span className="text-xs text-gray-500">
                              by {activity.user}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
