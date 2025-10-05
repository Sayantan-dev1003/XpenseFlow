import React, { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiShield, FiUser, FiMoreVertical, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import userService from '../../api/userService.js';
import { toast } from 'react-toastify';

const UserList = ({ filter = 'All' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    // Filter users whenever the filter prop or users array changes
    const filterUsers = () => {
      if (filter === 'All') {
        setFilteredUsers(users);
        return;
      }

      const roleMap = {
        'Manager': 'manager',
        'Employee': 'employee',
        'Finance': 'finance'
      };

      const filtered = users.filter(user => user.role === roleMap[filter]);
      setFilteredUsers(filtered);
    };

    filterUsers();
  }, [filter, users]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getCompanyUsers();
      if (response.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FiShield className="w-4 h-4 text-red-600" />;
      case 'manager':
        return <FiUsers className="w-4 h-4 text-blue-600" />;
      case 'employee':
        return <FiUser className="w-4 h-4 text-green-600" />;
      case 'finance':
        return <FiShield className="w-4 h-4 text-purple-600" />;
      default:
        return <FiUser className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      manager: 'bg-blue-100 text-blue-800 border-blue-200',
      employee: 'bg-green-100 text-green-800 border-green-200',
      finance: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    
    return badges[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleActions = (userId) => {
    setShowActions(showActions === userId ? null : userId);
  };

  const handleEditUser = (user) => {
    // TODO: Implement edit user functionality
    toast.info('Edit user functionality coming soon');
  };

  const handleDeleteUser = (user) => {
    // TODO: Implement delete user functionality
    toast.info('Delete user functionality coming soon');
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-[calc(100vh-285px)]">
      {/* User Count */}
      <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <p className="text-sm text-gray-600">
          Showing {filteredUsers.length} {filter === 'All' ? 'total' : filter} users
        </p>
      </div>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
              <p className="text-sm text-gray-500">{users.length} users in your company</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {users.length === 0 ? 'No users found' : `No ${filter} users found`}
            </h3>
            <p className="text-gray-500">
              {users.length === 0 ? 'Start by creating your first team member.' : `Try selecting a different filter option.`}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user._id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {(user.firstName || '').charAt(0)}{(user.lastName || '').charAt(0)}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {user.firstName || ''} {user.lastName || ''}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FiMail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                      
                      {user.manager && (
                        <div className="flex items-center space-x-1">
                          <FiUsers className="w-3 h-3" />
                          <span>Reports to {user.manager.firstName || ''} {user.manager.lastName || ''}</span>
                        </div>
                      )}
                      
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="relative">
                  <button
                    onClick={() => toggleActions(user._id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiMoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  {showActions === user._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            handleViewUser(user);
                            setShowActions(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FiEye className="w-4 h-4 mr-3" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            handleEditUser(user);
                            setShowActions(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FiEdit className="w-4 h-4 mr-3" />
                          Edit User
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => {
                              handleDeleteUser(user);
                              setShowActions(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 className="w-4 h-4 mr-3" />
                            Delete User
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;
