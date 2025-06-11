import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const BuyerDashboard = () => {
    const { user } = useAuth();
    return (
        <div className="page-container dashboard-page">
            <h2>Welcome, {user?.name} (Buyer)</h2>
            <p>This is your buyer dashboard.</p>
            {/* Add buyer-specific functionalities here */}
        </div>
    );
};

export default BuyerDashboard;