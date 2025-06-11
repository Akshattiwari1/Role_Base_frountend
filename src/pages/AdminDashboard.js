import React, { useEffect, useState } from 'react';
import { getAllUsers, updateEnterpriseStatus, toggleUserBlock } from '../api/admin';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState(''); // For success messages

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            setMessage('');
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    const handleEnterpriseStatusChange = async (userId, status) => {
        try {
            const res = await updateEnterpriseStatus(userId, status);
            setMessage(res.message);
            fetchUsers(); // Refresh the user list
        } catch (err) {
            setError(err.message || `Failed to update enterprise status.`);
        }
    };

    const handleToggleBlock = async (userId) => {
        try {
            const res = await toggleUserBlock(userId);
            setMessage(res.message);
            fetchUsers(); // Refresh the user list
        } catch (err) {
            setError(err.message || `Failed to toggle block status.`);
        }
    };

    if (loading) return <div className="loading-message">Loading users...</div>;
    if (error) return <div className="message error">Error: {error}</div>;

    return (
        <div className="page-container admin-dashboard">
            <h2>Admin Dashboard</h2>
            <h3>All Users</h3>
            {message && <p className="message success">{message}</p>}
            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status (Enterprise)</th>
                            <th>Blocked</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    {user.role === 'enterprise' ? (
                                        <div className="button-group-small">
                                            <span>{user.enterpriseStatus}</span>
                                            <button
                                                className="action-btn approve-btn"
                                                onClick={() => handleEnterpriseStatusChange(user._id, 'approved')}
                                                disabled={user.enterpriseStatus === 'approved'}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="action-btn reject-btn"
                                                onClick={() => handleEnterpriseStatusChange(user._id, 'rejected')}
                                                disabled={user.enterpriseStatus === 'rejected'}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : 'N/A'}
                                </td>
                                <td>{user.isBlocked ? 'Yes' : 'No'}</td>
                                <td>
                                    <button
                                        className={`action-btn ${user.isBlocked ? 'unblock-btn' : 'block-btn'}`}
                                        onClick={() => handleToggleBlock(user._id)}
                                    >
                                        {user.isBlocked ? 'Unblock' : 'Block'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminDashboard;