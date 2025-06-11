import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="page-container unauthorized-page">
            <h2>Access Denied</h2>
            <p>You do not have permission to view this page.</p>
            <Link to="/"><button>Go to Home</button></Link>
        </div>
    );
};

export default Unauthorized;