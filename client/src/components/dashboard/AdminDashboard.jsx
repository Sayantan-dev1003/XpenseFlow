import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiSettings,
  FiPlus,
  FiEye,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import expenseService from "../../api/expenseService";
import companyService from "../../api/companyService";
import workflowService from "../../api/workflowService";
import UserCreationForm from "./UserCreationForm";
import UserList from "./UserList";

const AdminDashboard = ({ user }) => {
  const { handleAuthFailure, logout } = useAuth();
  const [stats, setStats] = useState({
    expenses: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalAmount: 0,
    },
    company: { users: { total: 0, admin: 0, manager: 0, employee: 0 } },
    workflows: [],
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showUserCreationForm, setShowUserCreationForm] = useState(false);
  const [userFilter, setUserFilter] = useState("All");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (retryCount = 0) => {
    try {
      setLoading(true);

      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled([
        expenseService.getExpenseStats({ period: "month" }),
        companyService.getCompanyStats(),
        workflowService.getWorkflows({ limit: 5 }),
        expenseService.getPendingExpenses({ limit: 5 }),
      ]);

      // Check if any requests failed with 401
      const authErrors = results.filter(
        (result) =>
          result.status === "rejected" &&
          result.reason?.response?.status === 401
      );

      if (authErrors.length > 0) {
        console.warn("Authentication failed while loading dashboard data");
        handleAuthFailure();
        return;
      }

      // Process successful results
      const [
        expenseStatsResult,
        companyStatsResult,
        workflowsResult,
        pendingExpensesResult,
      ] = results;

      setStats({
        expenses:
          expenseStatsResult.status === "fulfilled"
            ? expenseStatsResult.value.data.stats.summary
            : {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                totalAmount: 0,
              },
        company:
          companyStatsResult.status === "fulfilled"
            ? companyStatsResult.value.data.stats
            : { users: { total: 0, admin: 0, manager: 0, employee: 0 } },
        workflows:
          workflowsResult.status === "fulfilled"
            ? workflowsResult.value.data.workflows
            : [],
      });

      setRecentExpenses(
        pendingExpensesResult.status === "fulfilled"
          ? pendingExpensesResult.value.data.expenses
          : []
      );

      // Log any non-auth errors
      results.forEach((result, index) => {
        if (
          result.status === "rejected" &&
          result.reason?.response?.status !== 401
        ) {
          console.warn(
            `Failed to load dashboard data for index ${index}:`,
            result.reason.message
          );
        }
      });
    } catch (error) {
      console.error("Failed to load admin dashboard data:", error);

      // Handle authentication failures
      if (error.response?.status === 401) {
        console.warn("Authentication failed while loading dashboard data");
        handleAuthFailure();
        return;
      }

      // For other errors, retry once if this is the first attempt
      if (retryCount === 0 && error.code !== "ERR_NETWORK") {
        console.log("Retrying dashboard data load...");
        setTimeout(() => loadDashboardData(1), 2000);
        return;
      }

      // Show empty state for failed loads
      console.warn("Dashboard data could not be loaded - showing empty state");
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = () => {
    loadDashboardData(); // Refresh stats
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

  const role = user.role;
  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.firstName}! Here's your company overview.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-gray-500 text-sm ">{user.email}</p>
              <p className="text-gray-500 text-sm font-semibold">
                {capitalizedRole}
              </p>
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
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              User Management
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-1">
            {/* Recent Expenses */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recent Expenses
                  </h3>
                </div>
              </div>
              <div className="p-6">
                {recentExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {recentExpenses.map((expense) => (
                      <div
                        key={expense._id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {expense.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            by {expense.submittedBy.firstName}{" "}
                            {expense.submittedBy.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {expenseService.formatDate(expense.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {expenseService.formatCurrency(
                              expense.convertedAmount || expense.amount || 0
                            )}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expenseService.getStatusColor(
                              expense.status
                            )}`}
                          >
                            {expense.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No recent expenses
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          {/* User Management Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                User Management
              </h2>
              <p className="text-gray-600">
                Manage your team members and their roles
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="All">All Users</option>
                <option value="Manager">Managers</option>
                <option value="Employee">Employees</option>
                <option value="Finance">Finance Team</option>
              </select>
              <button
                onClick={() => setShowUserCreationForm(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors"
              >
                <FiPlus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
          </div>

          {/* User List */}
          <UserList filter={userFilter} />
        </div>
      )}

      {/* User Creation Form Modal */}
      {showUserCreationForm && (
        <UserCreationForm
          onClose={() => setShowUserCreationForm(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
