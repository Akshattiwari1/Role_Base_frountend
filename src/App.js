// frontend/src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminDashboardStatsPage from './pages/AdminDashboardStatsPage'; // Import the new page
import EnterpriseProductsPage from './pages/EnterpriseProductsPage';
import EnterpriseOrdersPage from './pages/EnterpriseOrdersPage';
import BuyerProductsPage from './pages/BuyerProductsPage';
import BuyerOrdersPage from './pages/BuyerOrdersPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <div id="root">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboardStatsPage /></PrivateRoute>} /> {/* NEW ROUTE */}
          <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsersPage /></PrivateRoute>} />
          <Route path="/admin/orders" element={<PrivateRoute roles={['admin']}><EnterpriseOrdersPage isAdmin={true} /></PrivateRoute>} />

          {/* Enterprise Routes */}
          <Route path="/enterprise/products" element={<PrivateRoute roles={['enterprise']}><EnterpriseProductsPage /></PrivateRoute>} />
          <Route path="/enterprise/orders" element={<PrivateRoute roles={['enterprise']}><EnterpriseOrdersPage isAdmin={false} /></PrivateRoute>} />

          {/* Buyer Routes */}
          <Route path="/buyer/products" element={<PrivateRoute roles={['buyer']}><BuyerProductsPage /></PrivateRoute>} />
          <Route path="/buyer/orders" element={<PrivateRoute roles={['buyer']}><BuyerOrdersPage /></PrivateRoute>} />

          <Route path="*" element={<h1 className="section-title" style={{marginTop: '5rem'}}>404 - Page Not Found or Unauthorized</h1>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;