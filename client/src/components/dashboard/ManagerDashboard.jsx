import React, { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiClock, FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import expenseService from '../../api/expenseService';

const ManagerDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    team: { total: 0, pending: 0, approved: 0, rejected: 0, totalAmount: 0 }
  });
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [teamStats, pending, myExpenses] = await Promise.all([
        expenseService.getExpenseStats({ period: 'month' }),
        expenseService.getPendingExpenses({ limit: 10 }),
        expenseService.getUserExpenses({ limit: 5 })
      ]);

      setStats({
        team: teamStats.data.stats.summary
      });

      setPendingExpenses(pending.data.expenses);
      setRecentActivity(myExpenses.data.expenses);
    } catch (error) {
      console.error('Failed to load manager dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveExpense = async (expenseId) => {
    try {
      await expenseService.processExpense(expenseId, 'approved', 'Approved by manager');
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to approve expense:', error);
      alert('Failed to approve expense');
    }
  };

  const handleRejectExpense = async (expenseId) => {
    const comment = prompt('Please provide a reason for rejection:');
    if (!comment) return;

    try {
      await expenseService.processExpense(expenseId, 'rejected', comment);
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to reject expense:', error);
      alert('Failed to reject expense');
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
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.firstName}! Manage your team's expenses.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Pending Approvals"
          value={pendingExpenses.length}
          icon={FiClock}
          color="bg-yellow-500"
          subtitle="Awaiting your approval"
        />
        <StatCard
          title="Team Expenses"
          value={stats.team.total}
          icon={FiUsers}
          color="bg-blue-500"
          subtitle="This month"
        />
        <StatCard
          title="Total Amount"
          value={expenseService.formatCurrency(stats.team.totalAmount)}
          icon={FiDollarSign}
          color="bg-green-500"
          subtitle="Team spending"
        />
        <StatCard
          title="Approved"
          value={stats.team.approved}
          icon={FiCheckCircle}
          color="bg-emerald-500"
          subtitle={`${stats.team.rejected} rejected`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Approvals */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {pendingExpenses.length} pending
              </span>
            </div>
          </div>
          <div className="p-6">
            {pendingExpenses.length > 0 ? (
              <div className="space-y-4">
                {pendingExpenses.map((expense) => (
                  <div key={expense._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{expense.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          <span>by {expense.submittedBy.firstName} {expense.submittedBy.lastName}</span>
                          <span>•</span>
                          <span>{expense.category}</span>
                          <span>•</span>
                          <span>{expenseService.formatDate(expense.date)}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-semibold text-gray-900">
                          {expenseService.formatCurrency(expense.convertedAmount)}
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleApproveExpense(expense._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                          >
                            <FiCheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectExpense(expense._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                          >
                            <FiXCircle className="w-3 h-3 mr-1" />
                            Reject
                          </button>
                          <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                            <FiEye className="w-3 h-3 mr-1" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiCheckCircle className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No pending approvals</p>
                <p className="text-sm text-gray-400">All caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">My Recent Expenses</h3>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((expense) => (
                  <div key={expense._id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{expense.title}</p>
                      <p className="text-xs text-gray-500">{expense.category}</p>
                      <p className="text-xs text-gray-400">
                        {expenseService.formatDate(expense.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {expenseService.formatCurrency(expense.convertedAmount)}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${expenseService.getStatusColor(expense.status)}`}>
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
      </div>

      {/* Team Performance Overview */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Team Performance</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.team.approved}</div>
              <div className="text-sm text-gray-500">Approved This Month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.team.pending}</div>
              <div className="text-sm text-gray-500">Pending Review</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.team.total > 0 ? Math.round((stats.team.approved / stats.team.total) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-500">Approval Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
