// frontend/src/pages/AdminUsersPage.js
import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser, updateUserInContext } = useAuth(); // Get current logged-in user

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users'); // Fetches all users (including admin)
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      toast.error(err.response?.data?.message || 'Failed to fetch users');
      setLoading(false);
    }
  };

  const handleUpdateEnterpriseStatus = async (userId, status) => {
    try {
      // CORRECTED URL: Now explicitly uses /users/ in the path
      const res = await api.put(`/admin/users/${userId}/status`, { enterpriseStatus: status });
      toast.success(res.data.message);
      fetchUsers(); // Refresh list
      // If the current user is the one being updated (and is an enterprise), update context
      if (currentUser && currentUser._id === userId && currentUser.role === 'enterprise') {
          updateUserInContext({ enterpriseStatus: status });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update enterprise status');
      console.error(err);
    }
  };

  const handleToggleBlock = async (userId, currentIsBlocked) => {
    if (currentUser && currentUser._id === userId) {
        toast.error("You cannot block/unblock your own account.");
        return;
    }

    try {
      // CORRECTED URL: Now explicitly uses /users/ in the path
      const res = await api.put(`/admin/users/${userId}/status`, { isBlocked: !currentIsBlocked });
      toast.success(res.data.message);
      fetchUsers(); // Refresh list
      // No need to update current user context for block status as they can't block themselves
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle block status');
      console.error(err);
    }
  };

  if (loading) return <div className="text-center text-xl" style={{marginTop: '5rem', color: 'var(--text-color-medium)'}}>Loading users...</div>;
  if (error) return <div className="p-3 danger-light text-red-700 rounded-md mt-4">{error}</div>;

  return (
    <div className="card container">
      <h2 className="section-title">Manage Users</h2>
      {users.length === 0 ? (
        <p className="text-center text-lg" style={{color: 'var(--text-color-light)'}}>No users found.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Role</th>
                <th className="table-header">Enterprise Status</th>
                <th className="table-header">Blocked</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="table-cell">{user.name}</td>
                  <td className="table-cell">{user.email}</td>
                  <td className="table-cell">{user.role}</td>
                  <td className="table-cell">
                    {user.role === 'enterprise' ? (
                      <span className={`status-badge status-${user.enterpriseStatus}`}>
                        {user.enterpriseStatus}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="table-cell">
                    {user.isBlocked ? (
                      <span className="status-badge status-blocked">Yes</span>
                    ) : (
                      'No'
                    )}
                  </td>
                  <td className="table-cell action-buttons">
                    {user.role === 'enterprise' && user.enterpriseStatus === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateEnterpriseStatus(user._id, 'approved')} className="btn btn-success btn-sm mr-2">Approve</button>
                        <button onClick={() => handleUpdateEnterpriseStatus(user._id, 'rejected')} className="btn btn-danger btn-sm mr-2">Reject</button>
                      </>
                    )}
                     {user.role === 'enterprise' && user.enterpriseStatus === 'approved' && (
                      <button onClick={() => handleUpdateEnterpriseStatus(user._id, 'pending')} className="btn btn-warning btn-sm mr-2">Set Pending</button>
                    )}
                    {user.role !== 'admin' && ( // Admin cannot block/unblock other admins or themselves
                      <button onClick={() => handleToggleBlock(user._id, user.isBlocked)} className={`btn btn-sm ${user.isBlocked ? 'btn-indigo' : 'btn-secondary'}`}>
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;