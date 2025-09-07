import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { RecentActivities } from '../components/dashboard/RecentActivities';
import { QuickActions } from '../components/dashboard/QuickActions';
import { ComplianceOverview } from '../components/dashboard/ComplianceOverview';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'SUPER_ADMIN': 'Super Administrator',
      'FACTORY_ADMIN': 'Factory Administrator',
      'HR_STAFF': 'HR Staff',
      'GRIEVANCE_COMMITTEE': 'Grievance Committee',
      'AUDITOR': 'Auditor',
      'ANALYTICS_USER': 'Analytics User',
    };
    return roleMap[role] || role;
  };

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-amber-100">
            You're logged in as {getRoleDisplayName(user?.role || '')}
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="mb-8">
        <DashboardStats />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Compliance Overview */}
        <div className="lg:col-span-2">
          <ComplianceOverview />
        </div>

        {/* Right Column - Recent Activities */}
        <div className="lg:col-span-1">
          <RecentActivities />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <QuickActions />
      </div>
    </DashboardLayout>
  );
};
