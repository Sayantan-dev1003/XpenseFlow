import React, { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiTrendingUp, FiSettings, FiPlus, FiEye } from 'react-icons/fi';
import expenseService from '../../api/expenseService';
import companyService from '../../api/companyService';
import workflowService from '../../api/workflowService';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    expenses: { total: 0, pending: 0, approved: 0, rejected: 0, totalAmount: 0 },
    company: { users: { total: 0, admin: 0, manager: 0, employee: 0 } },
    workflows: []
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [expenseStats, companyStats, workflows, pendingExpenses] = await Promise.all([
        expenseService.getExpenseStats({ period: 'month' }),
        companyService.getCompanyStats(),
        workflowService.getWorkflows({ limit: 5 }),
        expenseService.getPendingExpenses({ limit: 5 })
      ]);

      setStats({
        expenses: expenseStats.data.stats.summary,
        company: companyStats.data.stats,
        workflows: workflows.data.workflows
      });

      setRecentExpenses(pendingExpenses.data.expenses);
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.firstName}! Here's your company overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.company.users.total}
          icon={FiUsers}
          color="bg-blue-500"
          subtitle={`${stats.company.users.employee} employees`}
        />
        <StatCard
          title="Pending Expenses"
          value={stats.expenses.pending}
          icon={FiDollarSign}
          color="bg-yellow-500"
          subtitle="Awaiting approval"
        />
        <StatCard
          title="Monthly Total"
          value={expenseService.formatCurrency(stats.expenses.totalAmount)}
          icon={FiTrendingUp}
          color="bg-green-500"
          subtitle="This month"
        />
        <StatCard
          title="Active Workflows"
          value={stats.workflows.filter(w => w.isActive).length}
          icon={FiSettings}
          color="bg-purple-500"
          subtitle={`${stats.workflows.length} total`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Expenses */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div key={expense._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{expense.title}</p>
                      <p className="text-sm text-gray-500">
                        by {expense.submittedBy.firstName} {expense.submittedBy.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {expenseService.formatDate(expense.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {expenseService.formatCurrency(expense.convertedAmount)}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expenseService.getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent expenses</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FiPlus className="h-5 w-5 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Create Workflow</p>
                  <p className="text-sm text-gray-500">Set up new approval workflow</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FiUsers className="h-5 w-5 text-green-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-500">Add or edit user accounts</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FiSettings className="h-5 w-5 text-purple-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Company Settings</p>
                  <p className="text-sm text-gray-500">Configure company preferences</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FiEye className="h-5 w-5 text-orange-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">View Reports</p>
                  <p className="text-sm text-gray-500">Generate expense reports</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Overview Chart Placeholder */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Expense Overview</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.expenses.approved}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.expenses.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.expenses.rejected}</div>
              <div className="text-sm text-gray-500">Rejected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
