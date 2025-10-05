import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiDollarSign,
  FiUpload,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";
import Modal from '../common/Modal';
import ExpenseSubmissionForm from '../expense/ExpenseSubmissionForm';
import ReceiptUpload from '../expense/ReceiptUpload';
import { IoReceipt } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import expenseService from "../../api/expenseService";

const EmployeeDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const myExpenses = await expenseService.getUserExpenses({ limit: 50 }); // Get more expenses for better stats

      setRecentExpenses(myExpenses.data.expenses);
    } catch (error) {
      console.error("Failed to load employee dashboard data:", error);

      // Set user-friendly error message
      if (
        error.code === "ERR_NETWORK" ||
        error.code === "ERR_CONNECTION_RESET"
      ) {
        setError(
          "Unable to connect to server. Please ensure the server is running and try again."
        );
      } else {
        setError(
          "Failed to load dashboard data. Please try refreshing the page."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats from recent expenses
  const calculateStats = () => {
    if (!recentExpenses || recentExpenses.length === 0) {
      return { pending: 0, approved: 0, rejected: 0, processing: 0, total: 0 };
    }

    const stats = recentExpenses.reduce(
      (acc, expense) => {
        acc.total += 1;
        switch (expense.status) {
          case "pending":
            acc.pending += 1;
            break;
          case "approved":
            acc.approved += 1;
            break;
          case "rejected":
            acc.rejected += 1;
            break;
          case "processing":
            acc.processing += 1;
            break;
          default:
            break;
        }
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0, processing: 0, total: 0 }
    );

    return stats;
  };

  const stats = calculateStats();

  // Filter expenses based on selected status
  const getFilteredExpenses = () => {
    if (statusFilter === "all") {
      return recentExpenses;
    }
    return recentExpenses.filter((expense) => expense.status === statusFilter);
  };

  const filteredExpenses = getFilteredExpenses();

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-16 rounded-lg mb-6"></div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <FiDollarSign className="mx-auto h-12 w-12 mb-2" />
            <h3 className="text-lg font-medium">Connection Error</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
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
              Employee Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.firstName} {user.lastName}! Here's your company overview.
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

      {/* Quick Action */}
      <div className="mb-8 space-x-4">
        <button
          onClick={() => setShowExpenseModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Submit New Expense
        </button>

        <button
          onClick={() => setShowReceiptModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
        >
          <FiUpload className="w-5 h-5 mr-2" />
          Upload Receipt
        </button>

        {/* Expense Submission Modal */}
        <Modal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          title="Submit New Expense"
        >
          <ExpenseSubmissionForm
            onClose={() => setShowExpenseModal(false)}
            onSubmitSuccess={() => {
              setShowExpenseModal(false);
              loadDashboardData();
            }}
          />
        </Modal>

        {/* Receipt Upload Modal */}
        <Modal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          title="Upload Receipt"
        >
          <ReceiptUpload
            onReceiptData={(data) => {
              setShowReceiptModal(false);
              setShowExpenseModal(true);
              // TODO: Pre-fill expense form with OCR data
            }}
            onClose={() => setShowReceiptModal(false)}
          />
        </Modal>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Expenses */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Expenses
              </h3>
              <div className="flex items-center space-x-3">
                {/* Status Filter Dropdown */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="appearance-none text-gray-500 bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            {filteredExpenses.length > 0 ? (
              <div className="space-y-4">
                {filteredExpenses.slice(0, 10).map((expense) => (
                  <div
                    key={expense._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {expense.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {expense.description}
                        </p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          <span>{expense.category}</span>
                          <span>•</span>
                          <span>{expenseService.formatDate(expense.date)}</span>
                          {expense.receipt && (
                            <>
                              <span>•</span>
                              <span className="flex items-center">
                                <FiUpload className="w-3 h-3 mr-1" />
                                Receipt attached
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-semibold text-gray-900">
                          {expenseService.formatCurrency(
                            expense.amount,
                            expense.currency?.code
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">
                  {statusFilter === "all"
                    ? "No expenses yet"
                    : `No ${statusFilter} expenses`}
                </p>
                <p className="text-sm text-gray-400">
                  {statusFilter === "all"
                    ? "Submit your first expense to get started"
                    : "Try selecting a different status filter"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Status Breakdown */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Status Breakdown
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Approved</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.approved}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.pending}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Processing</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.processing}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Rejected</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.rejected}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Total Expenses
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {stats.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
