import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const EnterpriseDashboard = () => {
    const { user } = useAuth();
    return (
        <div className="page-container dashboard-page">
            <h2>Welcome, {user?.name} (Enterprise)</h2>
            <p>This is your enterprise dashboard.</p>
            {/* Add enterprise-specific functionalities here */}
        </div>
    );
};

export default EnterpriseDashboard;