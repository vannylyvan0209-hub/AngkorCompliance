import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface ComplianceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface ComplianceOverviewProps {
  metrics?: ComplianceMetric[];
}

export const ComplianceOverview: React.FC<ComplianceOverviewProps> = ({ 
  metrics = [
    {
      id: '1',
      name: 'Overall Compliance',
      value: 95,
      target: 90,
      status: 'excellent',
      trend: 'up',
      change: 5
    },
    {
      id: '2',
      name: 'Safety Standards',
      value: 88,
      target: 85,
      status: 'good',
      trend: 'up',
      change: 3
    },
    {
      id: '3',
      name: 'Labor Standards',
      value: 92,
      target: 90,
      status: 'excellent',
      trend: 'stable',
      change: 0
    },
    {
      id: '4',
      name: 'Environmental',
      value: 78,
      target: 80,
      status: 'warning',
      trend: 'down',
      change: -2
    },
    {
      id: '5',
      name: 'Quality Management',
      value: 96,
      target: 95,
      status: 'excellent',
      trend: 'up',
      change: 1
    },
    {
      id: '6',
      name: 'Documentation',
      value: 85,
      target: 90,
      status: 'warning',
      trend: 'up',
      change: 2
    }
  ]
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return CheckCircle;
      case 'good':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      case 'stable':
        return Minus;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressColor = (value: number, target: number) => {
    if (value >= target) return 'bg-green-500';
    if (value >= target * 0.9) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Compliance Overview
          </h3>
          <button className="text-sm text-amber-600 hover:text-amber-500 font-medium">
            View Details
          </button>
        </div>
        
        <div className="space-y-6">
          {metrics.map((metric) => {
            const StatusIcon = getStatusIcon(metric.status);
            const TrendIcon = getTrendIcon(metric.trend);
            const progressPercentage = Math.min((metric.value / metric.target) * 100, 100);
            
            return (
              <div key={metric.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`w-5 h-5 ${getStatusColor(metric.status).split(' ')[0]}`} />
                    <span className="text-sm font-medium text-gray-900">
                      {metric.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {metric.value}%
                    </span>
                    <div className={`flex items-center ${getTrendColor(metric.trend)}`}>
                      <TrendIcon className="w-4 h-4" />
                      <span className="text-sm font-medium ml-1">
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">
                    Target: {metric.target}%
                  </span>
                  <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                    {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metric.value, metric.target)}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {metrics.filter(m => m.status === 'excellent').length}
              </div>
              <div className="text-sm text-gray-500">Excellent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.filter(m => m.status === 'warning').length}
              </div>
              <div className="text-sm text-gray-500">Warning</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {metrics.filter(m => m.status === 'critical').length}
              </div>
              <div className="text-sm text-gray-500">Critical</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
