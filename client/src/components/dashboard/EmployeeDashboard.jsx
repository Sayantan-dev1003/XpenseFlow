import React, { useState, useEffect } from 'react';
import { FiPlus, FiDollarSign, FiUpload, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import expenseService from '../../api/expenseService';
import companyService from '../../api/companyService';

const EmployeeDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyBaseCurrency, setCompanyBaseCurrency] = useState('USD');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [myExpenses, companyData] = await Promise.all([
        expenseService.getUserExpenses({ limit: 10 }),
        companyService.getCompany()
      ]);

      setRecentExpenses(myExpenses.data.expenses);
      
      // Set company base currency for expense display
      if (companyData.data.company?.baseCurrency?.code) {
        setCompanyBaseCurrency(companyData.data.company.baseCurrency.code);
      }
    } catch (error) {
      console.error('Failed to load employee dashboard data:', error);
      
      // Set user-friendly error message
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_RESET') {
        setError('Unable to connect to server. Please ensure the server is running and try again.');
      } else {
        setError('Failed to load dashboard data. Please try refreshing the page.');
      }
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.firstName}! Track and submit your expenses.</p>
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

      {/* Quick Action */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/expenses/submit')}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Submit New Expense
        </button>
      </div>


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Expenses */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
              <button 
                onClick={() => navigate('/expenses')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div key={expense._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{expense.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{expense.description}</p>
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
                          {expenseService.formatCurrency(expense.amount, expense.currency?.code)}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${expenseService.getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                        {expense.status === 'pending' && (
                          <div className="mt-1">
                            <button 
                              onClick={() => navigate(`/expenses/${expense._id}/edit`)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiDollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No expenses yet</p>
                <p className="text-sm text-gray-400">Submit your first expense to get started</p>
                <button
                  onClick={() => navigate('/expenses/submit')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  Submit Expense
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/expenses/submit')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  New Expense
                </button>
                <button
                  onClick={() => navigate('/expenses?status=pending')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiClock className="w-4 h-4 mr-2" />
                  View Pending
                </button>
                <button
                  onClick={() => navigate('/expenses')}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiDollarSign className="w-4 h-4 mr-2" />
                  All Expenses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
