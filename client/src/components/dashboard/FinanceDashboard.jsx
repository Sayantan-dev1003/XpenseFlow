import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiFileText, FiCheckCircle, FiXCircle, FiDownload, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import expenseService from '../../api/expenseService';

const FinanceDashboard = ({ user }) => {
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    expenses: { total: 0, pending: 0, approved: 0, rejected: 0, totalAmount: 0 },
    budget: { allocated: 0, spent: 0, remaining: 0 },
    reports: []
  });
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [expenseStats, pending, allExpenses] = await Promise.all([
        expenseService.getExpenseStats({ period: 'month' }),
        expenseService.getPendingExpenses({ limit: 10 }),
        expenseService.getAllExpenses({ limit: 5 })
      ]);

      setStats({
        expenses: expenseStats.data.stats.summary,
        budget: {
          allocated: 100000, // This would come from company settings
          spent: expenseStats.data.stats.summary.totalAmount || 0,
          remaining: 100000 - (expenseStats.data.stats.summary.totalAmount || 0)
        }
      });

      setPendingExpenses(pending.data.expenses);
      setRecentActivity(allExpenses.data.expenses);
    } catch (error) {
      console.error('Failed to load finance dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveExpense = async (expenseId) => {
    try {
      const result = await expenseService.processExpense(expenseId, 'approved', 'Approved by finance team');
      
      // Show success message based on approval status
      if (result.data.expense.status === 'approved') {
        alert('✅ Expense fully approved! Both manager and finance have approved.');
      } else if (result.data.expense.status === 'processing') {
        alert('✅ Expense approved by finance. Waiting for manager approval.');
      }
      
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to approve expense:', error);
      const errorMessage = error.response?.data?.message || 'Failed to approve expense';
      alert(`❌ ${errorMessage}`);
    }
  };

  const handleRejectExpense = async (expenseId) => {
    const comment = prompt('Please provide a reason for rejection:');
    if (!comment || comment.trim() === '') {
      if (comment !== null) {
        alert('Please provide a reason for rejection.');
      }
      return;
    }

    try {
      await expenseService.processExpense(expenseId, 'rejected', comment);
      alert('✅ Expense rejected successfully.');
      loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to reject expense:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject expense';
      alert(`❌ ${errorMessage}`);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-1">
              <span className={`text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}
              </span>
            </div>
          )}
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.firstName}! Manage company finances and expense approvals.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <FiLogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'approvals'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Approvals
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reports
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Expenses"
              value={stats.expenses?.total || 0}
              icon={FiFileText}
              color="bg-blue-500"
              subtitle="This month"
            />
            <StatCard
              title="Pending Approval"
              value={stats.expenses?.pending || 0}
              icon={FiClock}
              color="bg-yellow-500"
              subtitle="Awaiting review"
            />
            <StatCard
              title="Monthly Total"
              value={expenseService.formatCurrency(stats.expenses?.totalAmount || 0)}
              icon={FiDollarSign}
              color="bg-green-500"
              subtitle="Approved expenses"
            />
            <StatCard
              title="Budget Remaining"
              value={expenseService.formatCurrency(stats.budget?.remaining || 0)}
              icon={FiTrendingUp}
              color="bg-purple-500"
              subtitle={`of ${expenseService.formatCurrency(stats.budget?.allocated || 0)} allocated`}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Budget Overview */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Budget Overview</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Total Budget</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {expenseService.formatCurrency(stats.budget?.allocated || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Amount Spent</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {expenseService.formatCurrency(stats.budget?.spent || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Remaining</span>
                    <span className="text-sm font-semibold text-green-600">
                      {expenseService.formatCurrency(stats.budget?.remaining || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, ((stats.budget?.spent || 0) / (stats.budget?.allocated || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((expense) => (
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
                            {expenseService.formatCurrency(expense.amount, expense.currency?.code)}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expenseService.getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'approvals' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
          </div>
          <div className="p-6">
            {pendingExpenses.length > 0 ? (
              <div className="space-y-4">
                {pendingExpenses.map((expense) => (
                  <div key={expense._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{expense.title}</p>
                      <p className="text-sm text-gray-500">
                        by {expense.submittedBy.firstName} {expense.submittedBy.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {expenseService.formatDate(expense.createdAt)}
                      </p>
                      {expense.description && (
                        <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {expenseService.formatCurrency(expense.amount, expense.currency?.code)}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expenseService.getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveExpense(expense._id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <FiCheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectExpense(expense._id)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FiXCircle className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No pending approvals</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Financial Reports</h3>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                <FiDownload className="h-4 w-4 mr-2" />
                Generate Report
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-gray-900 mb-2">Monthly Expense Report</h4>
                <p className="text-sm text-gray-500 mb-4">Detailed breakdown of all expenses for the current month</p>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Download →
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-gray-900 mb-2">Department Analysis</h4>
                <p className="text-sm text-gray-500 mb-4">Expense analysis by department and category</p>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Download →
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-gray-900 mb-2">Budget Variance Report</h4>
                <p className="text-sm text-gray-500 mb-4">Comparison of actual vs budgeted expenses</p>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Download →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceDashboard;
