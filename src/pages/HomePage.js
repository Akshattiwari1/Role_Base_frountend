// frontend/src/pages/HomePage.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center text-xl" style={{ marginTop: '5rem', color: 'var(--text-color-medium)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="card container">
      <h1 className="section-title">Welcome to the Role-Based Application</h1>

      {user ? (
        <div className="text-center">
          <h2 className="subsection-title">Hello, {user.name}!</h2>
          <p className="text-lg" style={{ color: 'var(--text-color-medium)' }}>
            Your role: <span className="font-semibold link-blue">{user.role}</span>
          </p>

          {user.role === 'enterprise' && (
            <p className="text-md" style={{ color: 'var(--text-color-medium)' }}>
              Enterprise Status:
              <span className={`status-badge ml-2 status-${user.enterpriseStatus}`}>
                {user.enterpriseStatus}
              </span>
            </p>
          )}

          {user.isBlocked && (
            <p className="text-md font-bold" style={{ color: 'var(--danger-color)', marginTop: '0.5rem' }}>
              Account Status: <span className="status-badge status-blocked">BLOCKED</span>
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4" style={{ marginTop: '2rem' }}>
            {user.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="btn btn-primary btn-lg">View Dashboard</Link>
                <Link to="/admin/users" className="btn btn-primary btn-lg">Manage Users</Link>
                <Link to="/admin/orders" className="btn btn-primary btn-lg">View All Orders</Link>
              </>
            )}

            {user.role === 'enterprise' && user.enterpriseStatus === 'approved' && (
              <>
                <Link to="/enterprise/products" className="btn btn-success btn-lg">Manage My Products</Link>
                <Link to="/enterprise/orders" className="btn btn-success btn-lg">View Product Orders</Link>
              </>
            )}

            {user.role === 'enterprise' && user.enterpriseStatus !== 'approved' && (
              <p className="text-lg" style={{ color: 'var(--warning-color)', marginTop: '1rem' }}>
                Your enterprise account is pending or not approved. Access to enterprise features is limited.
              </p>
            )}

            {user.role === 'buyer' && (
              <>
                <Link to="/buyer/products" className="btn btn-info btn-lg">Browse Products</Link>
                <Link to="/buyer/orders" className="btn btn-info btn-lg">View My Orders</Link>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center" style={{ marginTop: '2rem' }}>
          <p className="text-lg" style={{ color: 'var(--text-color-medium)' }}>
            Please <Link to="/login" className="link-blue font-semibold">Login</Link> or <Link to="/register" className="link-blue font-semibold">Register</Link> to access the application features.
          </p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
