import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Truck, DollarSign, AlertCircle, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const StatCard = ({ title, value, icon: Icon, color, testId }) => (
  <Card data-testid={testId}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardAPI.getStats().then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Overview</h1>
        <p className="text-slate-600">Monitor your fleet operations in real-time</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Active Projects"
          value={stats?.active_projects || 0}
          icon={Activity}
          color="text-blue-600"
          testId="stat-active-projects"
        />
        <StatCard
          title="Running Campaigns"
          value={stats?.running_campaigns || 0}
          icon={Users}
          color="text-green-600"
          testId="stat-running-campaigns"
        />
        <StatCard
          title="Vehicles on Ground"
          value={stats?.vehicles_on_ground || 0}
          icon={Truck}
          color="text-purple-600"
          testId="stat-vehicles-on-ground"
        />
        <StatCard
          title="Today's Expense"
          value={formatCurrency(stats?.todays_expense || 0)}
          icon={DollarSign}
          color="text-amber-600"
          testId="stat-todays-expense"
        />
        <StatCard
          title="Pending Expenses"
          value={stats?.pending_expenses || 0}
          icon={Clock}
          color="text-orange-600"
          testId="stat-pending-expenses"
        />
        <StatCard
          title="Pending Payments"
          value={stats?.pending_payments || 0}
          icon={AlertCircle}
          color="text-red-600"
          testId="stat-pending-payments"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              data-testid="quick-action-new-campaign"
              className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
              onClick={() => window.location.href = '/campaigns/new'}
            >
              <Activity className="h-8 w-8 text-slate-400 group-hover:text-indigo-600 mb-2" />
              <h3 className="font-semibold">Create Campaign</h3>
              <p className="text-sm text-slate-500">Start a new campaign</p>
            </button>
            <button
              data-testid="quick-action-add-expense"
              className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all group"
            >
              <DollarSign className="h-8 w-8 text-slate-400 group-hover:text-purple-600 mb-2" />
              <h3 className="font-semibold">Submit Expense</h3>
              <p className="text-sm text-slate-500">Add new expense</p>
            </button>
            <button
              data-testid="quick-action-generate-report"
              className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all group"
              onClick={() => window.location.href = '/reports/new'}
            >
              <AlertCircle className="h-8 w-8 text-slate-400 group-hover:text-green-600 mb-2" />
              <h3 className="font-semibold">Generate Report</h3>
              <p className="text-sm text-slate-500">Create execution report</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
