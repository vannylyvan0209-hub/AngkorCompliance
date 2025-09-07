import React from 'react';
import { 
  CheckCircle, 
  FileText, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Users, 
  Shield, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  bgColor 
}) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${bgColor} rounded-md flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {change.type === 'increase' ? (
                      <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="self-center flex-shrink-0 h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {change.type === 'increase' ? 'Increased' : 'Decreased'} by
                    </span>
                    {Math.abs(change.value)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DashboardStatsProps {
  stats?: {
    compliance: number;
    activeAudits: number;
    openGrievances: number;
    pendingActions: number;
    totalUsers: number;
    completedTrainings: number;
    upcomingDeadlines: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  stats = {
    compliance: 95,
    activeAudits: 12,
    openGrievances: 8,
    pendingActions: 24,
    totalUsers: 156,
    completedTrainings: 89,
    upcomingDeadlines: 5,
    riskLevel: 'low'
  }
}) => {
  const statCards = [
    {
      title: 'Compliance Status',
      value: `${stats.compliance}%`,
      change: { value: 5, type: 'increase' as const },
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Active Audits',
      value: stats.activeAudits,
      change: { value: 2, type: 'increase' as const },
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Open Grievances',
      value: stats.openGrievances,
      change: { value: 3, type: 'decrease' as const },
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Pending Actions',
      value: stats.pendingActions,
      change: { value: 1, type: 'increase' as const },
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: { value: 8, type: 'increase' as const },
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Completed Trainings',
      value: stats.completedTrainings,
      change: { value: 12, type: 'increase' as const },
      icon: FileText,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100'
    },
    {
      title: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines,
      change: { value: 2, type: 'decrease' as const },
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Risk Level',
      value: stats.riskLevel.charAt(0).toUpperCase() + stats.riskLevel.slice(1),
      icon: TrendingUp,
      color: stats.riskLevel === 'low' ? 'text-green-600' : 
             stats.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600',
      bgColor: stats.riskLevel === 'low' ? 'bg-green-100' : 
               stats.riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-red-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
          bgColor={stat.bgColor}
        />
      ))}
    </div>
  );
};
