import React, { useState, useEffect } from "react";
import Modal from "../common/Modal";
import {
  FiUsers,
  FiDollarSign,
  FiEye,
  FiLogOut,
  FiUpload,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import expenseService from "../../api/expenseService";
import companyService from "../../api/companyService";
import { toast } from "react-toastify";

const ManagerDashboard = ({ user }) => {
  const { handleAuthFailure, logout } = useAuth();
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [company, setCompany] = useState(null);
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [receiptImageSrc, setReceiptImageSrc] = useState(null);
  const [expenseFilter, setExpenseFilter] = useState("all");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!showReceiptViewer || !selectedExpense) {
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
        pick(selectedExpense, "receiptImage.contentType") ||
        pick(selectedExpense, "receipt.image.contentType") ||
        "image/png";
      let raw =
        pick(selectedExpense, "receiptImage.data") ??
        pick(selectedExpense, "receipt.image.data");
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
  }, [showReceiptViewer, selectedExpense]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [expenseResponse, companyResponse] = await Promise.all([
        expenseService.getAllExpenses({
          status: expenseFilter !== "all" ? expenseFilter : undefined,
        }),
        companyService.getCompany(),
      ]);

      if (expenseResponse.data?.expenses) {
        setRecentExpenses(expenseResponse.data.expenses);
      }
      if (companyResponse.data?.company) {
        setCompany(companyResponse.data.company);
      }
    } catch (error) {
      console.error("Failed to load manager dashboard data:", error);
      if (error.response?.status === 401) {
        handleAuthFailure();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [expenseFilter]);

  const currentCount = recentExpenses.length;
  const currentCountLabel =
    expenseFilter === "all"
      ? "Total"
      : expenseFilter.charAt(0).toUpperCase() + expenseFilter.slice(1);

  const handleApprove = async (expenseId) => {
    try {
      await expenseService.processExpense(
        expenseId,
        "approved",
      );
      toast.success("Expense approved successfully!");
      loadDashboardData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to approve expense."
      );
    }
  };

  const handleReject = async (expenseId) => {
    try {
      await expenseService.processExpense(expenseId, "rejected");
      toast.success("Expense rejected successfully!");
      loadDashboardData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to reject expense."
      );
    }
  };

  const handleViewReceipt = (expense) => {
    setSelectedExpense(expense);
    setShowReceiptViewer(true);
  };

  const role = user.role;
  const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);

  const baseCurrencyCode = company?.baseCurrency?.code;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manager Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.firstName}! Here's your team's overview.
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

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Team Expenses
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
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentExpenses.slice(0, 50).map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.user?.firstName} {expense.user?.lastName}
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
                          baseCurrencyCode
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <div className="flex items-center justify-center space-x-2">
                          {expense.receipt && (
                            <button
                              onClick={() => handleViewReceipt(expense)}
                              className="text-purple-600 hover:text-purple-900"
                              title="View Receipt"
                            >
                              <FiEye className="w-5 h-5" />
                            </button>
                          )}
                          {(expense.status === "pending" ||
                            expense.status === "processing") && (
                              <>
                                <button
                                  onClick={() => handleApprove(expense._id)}

                                  className="text-green-600 hover:text-green-900"
                                  title="Approve"
                                >
                                  <FiCheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleReject(expense._id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Reject"
                                >
                                  <FiXCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                        </div>
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
                No expenses found for your team.
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showReceiptViewer}
        onClose={() => setShowReceiptViewer(false)}
        title="Receipt Image"
      >
        {selectedExpense && (
          <div className="flex justify-between items-start gap-6 text-gray-500">
            <div>
              <p>
                <strong>Submitted By:</strong> {selectedExpense.user?.firstName}{" "}
                {selectedExpense.user?.lastName}
              </p>
              <p>
                <strong>Email:</strong> {selectedExpense.user?.email}
              </p>
              <p>
                <strong>Status:</strong> {selectedExpense.status}
              </p>
              <p>
                <strong>Title:</strong> {selectedExpense.title}
              </p>
              <p>
                <strong>Expense:</strong>{" "}
                {expenseService.formatCurrency(
                  selectedExpense.convertedAmount,
                  baseCurrencyCode
                )}
              </p>
              <p>
                <strong>Category:</strong> {selectedExpense.category}
              </p>
              <p>
                <strong>Description:</strong> {selectedExpense.description}
              </p>
              <p>
                <strong>Expense Date and Time:</strong>{" "}
                {formatSubmissionDate(selectedExpense.expenseDateTime)}
              </p>
              <p>
                <strong>Submission Date and Time:</strong>{" "}
                {formatSubmissionDate(selectedExpense.submissionDateTime)}
              </p>
              {(selectedExpense.status === "pending" ||
                selectedExpense.status === "processing") && (
                  <div className="mt-4 flex items-center space-x-4">
                    <button
                      onClick={() => {
                        handleApprove(selectedExpense._id);
                        setShowReceiptViewer(false);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedExpense._id);
                        setShowReceiptViewer(false);
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                      Reject
                    </button>
                  </div>
                )}
            </div>
            {receiptImageSrc ? (
              <img
                src={receiptImageSrc}
                alt="Receipt"
                className="max-w-md h-auto rounded-lg shadow-md"
              />
            ) : (
              <p>No receipt available</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerDashboard;