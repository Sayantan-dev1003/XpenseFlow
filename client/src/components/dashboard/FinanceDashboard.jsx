// sayantan-dev1003/xpenseflow/XpenseFlow-cc6b85c477e1f12a15323e90201ce75bd1711fdb/client/src/components/dashboard/FinanceDashboard.jsx

import React, { useState, useEffect } from "react";
import {
  FiDollarSign,
  FiTrendingUp,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiLogOut,
  FiClock,
  FiEye,
  FiUpload,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import expenseService from "../../api/expenseService";
import companyService from "../../api/companyService";
import { toast } from "react-toastify";
import Modal from "../common/Modal";

// A simple bar chart component for graphical representation
const BudgetChart = ({ spent, remaining, allocated }) => {
  const total = allocated > 0 ? allocated : spent + remaining;
  const spentPercentage = total > 0 ? (spent / total) * 100 : 0;
  const remainingPercentage = 100 - spentPercentage;

  return (
    <div>
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="font-medium text-gray-700">
          Spent: {expenseService.formatCurrency(spent)}
        </span>
        <span className="font-medium text-gray-500">
          Allocated: {expenseService.formatCurrency(allocated)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-purple-600 h-4 rounded-full"
          style={{ width: `${spentPercentage}%` }}
        ></div>
      </div>
      <p className="text-right text-sm text-green-600 mt-2 font-semibold">
        {expenseService.formatCurrency(remaining)} Remaining (
        {remainingPercentage.toFixed(1)}%)
      </p>
    </div>
  );
};

const FinanceDashboard = ({ user }) => {
  const { logout, handleAuthFailure } = useAuth();
  const [stats, setStats] = useState({
    expenses: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalAmount: 0,
      totalApprovedAmount: 0,
    },
    budget: { allocated: 0, spent: 0, remaining: 0 },
  });
  const [allExpenses, setAllExpenses] = useState([]);
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [expenseFilter, setExpenseFilter] = useState("all");
  const [showReceiptViewer, setShowReceiptViewer] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [receiptImageSrc, setReceiptImageSrc] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [expenseStatsRes, budgetRes, allExpensesRes] = await Promise.all([
        expenseService.getExpenseStats({ period: "month" }),
        companyService.getCompanyBudget(),
        expenseService.getAllExpenses({
          status: expenseFilter !== "all" ? expenseFilter : undefined,
        }),
      ]);

      setStats({
        expenses: expenseStatsRes.data.stats.summary,
        budget: budgetRes.data.budget,
      });

      const expenses = allExpensesRes.data.expenses || [];
      setAllExpenses(expenses);
      setPendingExpenses(
        expenses.filter(
          (exp) => exp.status === "pending" || exp.status === "processing"
        )
      );
    } catch (error) {
      console.error("Failed to load finance dashboard data:", error);
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [expenseFilter]);

  const handleApprove = async (expenseId) => {
    try {
      await expenseService.processExpense(
        expenseId,
        "approved",
        "Approved by Finance"
      );
      toast.success("Expense approved successfully!");
      loadDashboardData(); // Refresh data
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to approve expense."
      );
    }
  };

  const handleReject = async (expenseId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason) {
      try {
        await expenseService.processExpense(expenseId, "rejected", reason);
        toast.success("Expense rejected successfully!");
        loadDashboardData();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to reject expense."
        );
      }
    }
  };

  const handleViewReceipt = (expense) => {
    setSelectedExpense(expense);
    setShowReceiptViewer(true);
  };

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
      if (receiptImageSrc) URL.revokeObjectURL(receiptImageSrc);
      setReceiptImageSrc(null);
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
      if (receiptImageSrc) URL.revokeObjectURL(receiptImageSrc);
    };
  }, [showReceiptViewer, selectedExpense]);

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

  const capitalizedRole =
    user.role.charAt(0).toUpperCase() + user.role.slice(1);

  if (loading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Finance Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user.firstName}! Manage company finances.
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
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FiLogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("approvals")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "approvals"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-500"
            }`}
          >
            Approvals
          </button>
        </nav>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Approved Expenses"
              value={stats.expenses?.approved || 0}
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
              title="Monthly Spend"
              value={expenseService.formatCurrency(
                stats.expenses?.totalApprovedAmount || 0
              )}
              icon={FiDollarSign}
              color="bg-green-500"
              subtitle="Approved expenses"
            />
            <StatCard
              title="Budget Remaining"
              value={expenseService.formatCurrency(
                stats.budget?.remaining || 0
              )}
              icon={FiTrendingUp}
              color="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Budget Overview
                </h3>
              </div>
              <div className="p-6">
                <BudgetChart
                  spent={stats.budget.spent}
                  remaining={stats.budget.remaining}
                  allocated={stats.budget.allocated}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Pending Approvals
                </h3>
              </div>
              <div className="p-6">
                {pendingExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {pendingExpenses.slice(0, 5).map((expense) => (
                      <div
                        key={expense._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {expense.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            by {expense.user?.firstName}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900">
                          {expenseService.formatCurrency(
                            expense.amount,
                            expense.currency?.code
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No pending approvals.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "approvals" && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              All Company Expenses
            </h3>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                Total: {allExpenses.length}
              </span>
              <select
                value={expenseFilter}
                onChange={(e) => setExpenseFilter(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allExpenses.map((expense) => (
                  <tr key={expense._id}>
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
                        {expense.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatSubmissionDate(expense.submissionDateTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${expenseService.getStatusColor(
                          expense.status
                        )}`}
                      >
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                      {expenseService.formatCurrency(
                        expense.convertedAmount,
                        expense.company?.baseCurrency?.code
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleViewReceipt(expense)}
                          className="text-purple-600 hover:text-purple-900"
                          title="View"
                        >
                          <FiEye />
                        </button>
                        {(expense.status === "pending" ||
                          expense.status === "processing") && (
                          <>
                            <button
                              onClick={() => handleApprove(expense._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <FiCheckCircle />
                            </button>
                            <button
                              onClick={() => handleReject(expense._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject"
                            >
                              <FiXCircle />
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
        </div>
      )}

      <Modal
        isOpen={showReceiptViewer}
        onClose={() => setShowReceiptViewer(false)}
        title="Receipt Image"
      >
        {selectedExpense && (
          <div className="flex justify-between items-start">
            <div>
              <p>
                <strong>Expense:</strong> {selectedExpense.title}
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                {expenseService.formatCurrency(
                  selectedExpense.convertedAmount,
                  selectedExpense.company?.baseCurrency?.code
                )}
              </p>
              <p>
                <strong>Category:</strong> {selectedExpense.category}
              </p>
            </div>
            {receiptImageSrc ? (
              <img
                src={receiptImageSrc}
                alt="Receipt"
                className="max-w-md h-auto"
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

export default FinanceDashboard;
