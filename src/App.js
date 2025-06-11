// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; // Your main app CSS
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminDashboardStatsPage from './pages/AdminDashboardStatsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminOrdersPage from './pages/AdminOrdersPage'; // Import the new component

// Enterprise Pages
import EnterpriseProductsPage from './pages/EnterpriseProductsPage';
import EnterpriseOrdersPage from './pages/EnterpriseOrdersPage';

// Buyer Pages
import BuyerProductsPage from './pages/BuyerProductsPage';
import BuyerOrdersPage from './pages/BuyerOrdersPage';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={<PrivateRoute roles={['admin']}><AdminDashboardStatsPage /></PrivateRoute>}
            />
            <Route
              path="/admin/users"
              element={<PrivateRoute roles={['admin']}><AdminUsersPage /></PrivateRoute>}
            />
            <Route
              path="/admin/orders"
              element={<PrivateRoute roles={['admin']}><AdminOrdersPage /></PrivateRoute>} // New Admin Orders Route
            />

            {/* Enterprise Routes */}
            <Route
              path="/enterprise/products"
              element={<PrivateRoute roles={['enterprise']}><EnterpriseProductsPage /></PrivateRoute>}
            />
            <Route
              path="/enterprise/orders"
              element={<PrivateRoute roles={['enterprise']}><EnterpriseOrdersPage /></PrivateRoute>}
            />

            {/* Buyer Routes */}
            <Route
              path="/buyer/products"
              element={<PrivateRoute roles={['buyer']}><BuyerProductsPage /></PrivateRoute>}
            />
            <Route
              path="/buyer/orders"
              element={<PrivateRoute roles={['buyer']}><BuyerOrdersPage /></PrivateRoute>}
            />

            {/* Catch-all for undefined routes */}
            <Route path="*" element={<h1 className="text-center text-3xl mt-20" style={{color: 'var(--text-color-dark)'}}>404 - Page Not Found</h1>} />

          </Routes>
        </main>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      </AuthProvider>
    </Router>
  );
}

export default App;