import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiDollarSign,
  FiUpload,
  FiLogOut,
  FiChevronDown,
  FiEye,
} from "react-icons/fi";
import Modal from '../common/Modal';
import ExpenseSubmissionForm from '../expense/ExpenseSubmissionForm';
import ReceiptUpload from '../expense/ReceiptUpload';
import { useAuth } from "../../hooks/useAuth";
import expenseService from "../../api/expenseService";

const EmployeeDashboard = ({ user }) => {
  const { logout } = useAuth();
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [receiptImageSrc, setReceiptImageSrc] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const myExpenses = await expenseService.getUserExpenses({ limit: 50 });

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

  // Calculate stats from recent expenses (kept for potential future use)
  // const calculateStats = () => {
  //   if (!recentExpenses || recentExpenses.length === 0) {
  //     return { pending: 0, approved: 0, rejected: 0, processing: 0, total: 0 };
  //   }
  //   const stats = recentExpenses.reduce(
  //     (acc, expense) => {
  //       acc.total += 1;
  //       switch (expense.status) {
  //         case "pending":
  //           acc.pending += 1;
  //           break;
  //         case "approved":
  //           acc.approved += 1;
  //           break;
  //         case "rejected":
  //           acc.rejected += 1;
  //           break;
  //         case "processing":
  //           acc.processing += 1;
  //           break;
  //         default:
  //           break;
  //       }
  //       return acc;
  //     },
  //     { pending: 0, approved: 0, rejected: 0, processing: 0, total: 0 }
  //   );
  //   return stats;
  // };
  // const stats = calculateStats();

  // Filter expenses based on selected status
  const getFilteredExpenses = () => {
    if (statusFilter === "all") {
      return recentExpenses;
    }
    return recentExpenses.filter((expense) => expense.status === statusFilter);
  };

  const filteredExpenses = getFilteredExpenses();
  const selectedReceipt = selectedExpenseId
    ? filteredExpenses.find((e) => e._id === selectedExpenseId) || null
    : null;
  const currentCount = filteredExpenses.length;
  const currentCountLabel = statusFilter === 'all'
    ? 'Total'
    : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  // Handle receipt view
  const handleViewReceipt = (expense) => {
    setSelectedExpenseId(expense?._id);
    setShowReceiptViewer(true);
  };

  // Format submission date properly
  const formatSubmissionDate = (date) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

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
      const pick = (obj, path) => path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);

      const contentType =
        pick(selectedReceipt, 'receiptImage.contentType') ||
        pick(selectedReceipt, 'receipt.image.contentType') ||
        'image/png';

      let raw =
        pick(selectedReceipt, 'receiptImage.data') ??
        pick(selectedReceipt, 'receipt.image.data');

      // Support multiple shapes: {type:'Buffer', data:[...]}, Array, ArrayBuffer, Uint8Array, base64 string
      let uint8 = null;
      if (!raw) {
        setReceiptImageSrc(null);
        return;
      }
      if (typeof raw === 'string') {
        // Assume base64 string
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

    // Cleanup on unmount or change
    return () => {
      if (receiptImageSrc) {
        URL.revokeObjectURL(receiptImageSrc);
      }
    };
  }, [showReceiptViewer, selectedReceipt]);

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
            onReceiptData={() => {
              setShowReceiptModal(false);
              setShowExpenseModal(true);
              // TODO: Pre-fill expense form with OCR data
            }}
            onClose={() => setShowReceiptModal(false)}
          />
        </Modal>

        {/* Receipt Viewer Modal */}
        <Modal
          isOpen={showReceiptViewer}
          onClose={() => setShowReceiptViewer(false)}
          title="Receipt Image"
        >
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="text-sm text-gray-600">
                  <p className="text-lg"><strong>Expense:</strong> {selectedReceipt.title}</p>
                  <p className="text-lg">
                    <strong>Amount:</strong>{" "}
                    {expenseService.formatCurrency(
                      selectedReceipt.convertedAmount,
                      selectedReceipt.company?.baseCurrency?.code
                    )}
                  </p>
                  <p className="text-lg"><strong>Category:</strong> {selectedReceipt.category}</p>
                  <p className="text-lg"><strong>Submitted:</strong> {formatSubmissionDate(selectedReceipt.submissionDateTime)}</p>
                </div>

                {receiptImageSrc ? (
                  <img
                    src={receiptImageSrc}
                    alt="Receipt"
                    className="max-w-full h-auto rounded-lg shadow-sm"
                    style={{ maxHeight: '500px' }}
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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-col-1 gap-8">
        {/* Recent Expenses */}
        <div className="w-full bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Expenses
              </h3>
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                  {currentCountLabel}: {currentCount}
                </span>
                {/* Status Filter Dropdown */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="appearance-none text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
          <div className="rounded-b-lg">
            {filteredExpenses.length > 0 ? (
              <div className="rounded-b-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.slice(0, 50).map((expense) => (
                      <tr key={expense._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{expense.title}</div>
                          <div className="text-sm text-gray-500">{expense.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{expense.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatSubmissionDate(expense.submissionDateTime)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expenseService.getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                          {expenseService.formatCurrency(
                            expense.convertedAmount,
                            expense.company?.baseCurrency?.code || 'USD'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          {expense.receipt && (
                            <button
                              onClick={() => handleViewReceipt(expense)}
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
      </div>
    </div>
  );
};

export default EmployeeDashboard;
