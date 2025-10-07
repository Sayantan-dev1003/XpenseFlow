import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import {
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiSettings,
  FiPlus,
  FiEye,
  FiLogOut,
  FiUpload,
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
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [receiptImageSrc, setReceiptImageSrc] = useState(null);
  const [expenseFilter, setExpenseFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showUserCreationForm, setShowUserCreationForm] = useState(false);
  const [userFilter, setUserFilter] = useState("All");

  // Format submission date for table
  const formatSubmissionDate = (date) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Find selected receipt for modal
  const selectedReceipt = selectedExpenseId
    ? recentExpenses.find((e) => e._id === selectedExpenseId) || null
    : null;

  // Build a displayable image URL from binary data when viewer opens
  useEffect(() => {
    if (!showReceiptViewer || !selectedReceipt) {
      if (receiptImageSrc) {
        URL.revokeObjectURL(receiptImageSrc);
        setReceiptImageSrc(null);
      }
      return;
    }
    try {
      const pick = (obj, path) =>
        path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
      const contentType =
        pick(selectedReceipt, "receiptImage.contentType") ||
        pick(selectedReceipt, "receipt.image.contentType") ||
        "image/png";
      let raw =
        pick(selectedReceipt, "receiptImage.data") ??
        pick(selectedReceipt, "receipt.image.data");
      let uint8 = null;
      if (!raw) {
        setReceiptImageSrc(null);
        return;
      }
      if (typeof raw === "string") {
        setReceiptImageSrc(`data:${contentType};base64,${raw}`);
        return;
      }
      if (raw && Array.isArray(raw.data)) {
        uint8 = new Uint8Array(raw.data);
      } else if (Array.isArray(raw)) {
        uint8 = new Uint8Array(raw);
      } else if (raw instanceof ArrayBuffer) {
        uint8 = new Uint8Array(raw);
      } else if (raw instanceof Uint8Array) {
        uint8 = raw;
      }
      if (uint8) {
        const blob = new Blob([uint8], { type: contentType });
        const url = URL.createObjectURL(blob);
        setReceiptImageSrc(url);
      } else {
        setReceiptImageSrc(null);
      }
    } catch {
      setReceiptImageSrc(null);
    }
    return () => {
      if (receiptImageSrc) {
        URL.revokeObjectURL(receiptImageSrc);
      }
    };
  }, [showReceiptViewer, selectedReceipt]);

  useEffect(() => {
    loadDashboardData();
  }, [expenseFilter]);

  const currentCount = recentExpenses.length;
  const currentCountLabel =
    expenseFilter === "all"
      ? "Total"
      : expenseFilter.charAt(0).toUpperCase() + expenseFilter.slice(1);

  const loadDashboardData = async (retryCount = 0) => {
    try {
      setLoading(true);

      const results = await Promise.allSettled([
        expenseService.getExpenseStats({ period: "month" }),
        companyService.getCompanyStats(),
        workflowService.getWorkflows({ limit: 5 }),
        expenseService.getAllExpenses({
          status: expenseFilter !== "all" ? expenseFilter : undefined,
        }),
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

      // Update expenses list with proper error handling and data validation
      if (
        pendingExpensesResult.status === "fulfilled" &&
        pendingExpensesResult.value?.data?.expenses
      ) {
        const expenses = pendingExpensesResult.value.data.expenses;
        setRecentExpenses(
          expenses.map((expense) => ({
            ...expense,
            user: expense.user || expense.userId || {},
            userId:
              expense.userId || (expense.user?._id ? expense.user._id : null),
            submissionDateTime:
              expense.submissionDateTime || new Date().toISOString(),
            status: expense.status || "pending",
            amount: expense.amount || 0,
          }))
        );
      } else {
        console.warn("No expense data available or request failed");
        setRecentExpenses([]);
      }

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
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      All Expenses
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                      {currentCountLabel}: {currentCount}
                    </span>
                    <div className="relative">
                      <select
                        value={expenseFilter}
                        onChange={(e) => setExpenseFilter(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="all">All</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="processing">Processing</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-b-lg">
                {recentExpenses.length > 0 ? (
                  <div className="rounded-b-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Submitted
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentExpenses.slice(0, 50).map((expense) => (
                          <tr key={expense._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {expense.user?.firstName}{" "}
                                {expense.user?.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {expense.user?.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {expense.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {expense.description}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {expense.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {formatSubmissionDate(
                                expense.submissionDateTime || expense.createdAt
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expenseService.getStatusColor(
                                  expense.status
                                )}`}
                              >
                                {expense.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                              {expenseService.formatCurrency(
                                expense.convertedAmount,
                                expense.company?.baseCurrency?.code || "USD"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              {expense.receipt && (
                                <button
                                  onClick={() => {
                                    setSelectedExpenseId(expense._id);
                                    setShowReceiptViewer(true);
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 hover:text-white bg-purple-50 hover:bg-purple-600 border border-purple-200 rounded-md transition-colors"
                                  title="View Receipt"
                                >
                                  <FiEye className="w-3 h-3 mr-1" />
                                  View
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">No recent expenses</p>
                    <p className="text-sm text-gray-400">
                      Submit your first expense to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Receipt Viewer Modal - Placed outside the table structure */}
          <Modal
            isOpen={showReceiptViewer}
            onClose={() => setShowReceiptViewer(false)}
            title="Receipt Image"
          >
            {selectedReceipt && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-sm text-gray-600">
                    <p className="text-lg">
                      <strong>Expense:</strong> {selectedReceipt.title}
                    </p>
                    <p className="text-lg">
                      <strong>Amount:</strong>{" "}
                      {expenseService.formatCurrency(
                        selectedReceipt.convertedAmount,
                        selectedReceipt.company?.baseCurrency?.code
                      )}
                    </p>
                    <p className="text-lg">
                      <strong>Category:</strong> {selectedReceipt.category}
                    </p>
                    <p className="text-lg">
                      <strong>Submitted:</strong>{" "}
                      {formatSubmissionDate(
                        selectedReceipt.submissionDateTime ||
                          selectedReceipt.createdAt
                      )}
                    </p>
                  </div>
                  {receiptImageSrc ? (
                    <img
                      src={receiptImageSrc}
                      alt="Receipt"
                      className="max-w-full h-auto rounded-lg shadow-sm"
                      style={{ maxHeight: "500px" }}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FiUpload className="mx-auto h-12 w-12 mb-2" />
                      <p>Receipt image not available</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowReceiptViewer(false)}
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          {/* User Management Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
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
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="All">All Users</option>
                <option value="Manager">Managers</option>
                <option value="Employee">Employees</option>
                <option value="Finance">Finance Team</option>
              </select>
              <button
                onClick={() => setShowUserCreationForm(true)}
                className="inline-flex items-center px-4 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors"
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
