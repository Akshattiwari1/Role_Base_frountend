import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-center text-xl" style={{marginTop: '5rem', color: 'var(--text-color-medium)'}}>Loading...</div>;
  }

  if (!user) {
    toast.error('You must be logged in to view this page.');
    return <Navigate to="/login" replace />;
  }

  if (user.isBlocked) {
      toast.error('Your account has been blocked. Please contact an administrator.');
      return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    toast.error('You do not have permission to view this page.');
    return <Navigate to="/" replace />;
  }

  if (user.role === 'enterprise' && user.enterpriseStatus !== 'approved' &&
      (window.location.pathname.startsWith('/enterprise/products') || window.location.pathname.startsWith('/enterprise/orders'))) {
    toast.warn('Your enterprise account is pending approval or is not approved.');
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;