import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css'; // Import the new CSS file

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-links">
                <Link to="/" className="navbar-link">Home</Link>
                {!user && (
                    <>
                        <Link to="/register" className="navbar-link">Register</Link>
                        <Link to="/login" className="navbar-link">Login</Link>
                    </>
                )}
                {user && user.role === 'admin' && (
                    <Link to="/admin-dashboard" className="navbar-link">Admin Dashboard</Link>
                )}
                {user && user.role === 'enterprise' && (
                    <Link to="/enterprise-dashboard" className="navbar-link">Enterprise Dashboard</Link>
                )}
                {user && user.role === 'buyer' && (
                    <Link to="/buyer-dashboard" className="navbar-link">Buyer Dashboard</Link>
                )}
            </div>
            {user && (
                <div className="navbar-user-info">
                    <span>Welcome, {user.name} ({user.role})</span>
                    <button onClick={logout} className="navbar-logout-btn">Logout</button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;