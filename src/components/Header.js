// frontend/src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <Link to="/" className="header-logo">RoleBasedApp</Link>
      <nav>
        <ul className="nav-list">
          {!user ? (
            <>
              <li><Link to="/login" className="nav-link">Login</Link></li>
              <li><Link to="/register" className="nav-link">Register</Link></li>
            </>
          ) : (
            <>
              {user.role === 'admin' && (
                <>
                  <li><Link to="/admin/dashboard" className="nav-link">Dashboard</Link></li> {/* NEW LINK */}
                  <li><Link to="/admin/users" className="nav-link">Users</Link></li>
                  <li><Link to="/admin/orders" className="nav-link">All Orders</Link></li>
                </>
              )}
              {user.role === 'enterprise' && user.enterpriseStatus === 'approved' && (
                <>
                  <li><Link to="/enterprise/products" className="nav-link">My Products</Link></li>
                  <li><Link to="/enterprise/orders" className="nav-link">Product Orders</Link></li>
                </>
              )}
              {user.role === 'buyer' && (
                <>
                  <li><Link to="/buyer/products" className="nav-link">Browse Products</Link></li>
                  <li><Link to="/buyer/orders" className="nav-link">My Orders</Link></li>
                </>
              )}
              <li>
                <span className="header-user-info">Hello, {user.name} ({user.role})</span>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="btn btn-danger btn-sm"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;