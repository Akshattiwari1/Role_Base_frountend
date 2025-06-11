// frontend/src/pages/AdminDashboardStatsPage.js
import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

function AdminDashboardStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard-stats');
        setStats(res.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
        toast.error(err.response?.data?.message || 'Failed to fetch dashboard stats');
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center text-xl" style={{marginTop: '5rem', color: 'var(--text-color-medium)'}}>Loading dashboard stats...</div>;
  if (error) return <div className="p-3 danger-light text-red-700 rounded-md mt-4">{error}</div>;
  if (!stats) return <div className="text-center text-xl" style={{marginTop: '5rem', color: 'var(--text-color-medium)'}}>No stats available.</div>;

  return (
    <div className="card container">
      <h2 className="section-title">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-6 mb-8">
        <div className="card shadow-sm" style={{padding: '1.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-light)'}}>
          <h3 className="font-semibold text-lg mb-2" style={{color: 'var(--text-color-dark)'}}>Total Products</h3>
          <p className="text-4xl font-bold link-blue">{stats.totalProducts}</p>
        </div>
        <div className="card shadow-sm" style={{padding: '1.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-light)'}}>
          <h3 className="font-semibold text-lg mb-2" style={{color: 'var(--text-color-dark)'}}>Total Orders</h3>
          <p className="text-4xl font-bold link-blue">{stats.totalOrders}</p>
        </div>
      </div>

      <h3 className="subsection-title">Orders Per Enterprise</h3>
      {stats.ordersPerEnterprise.length === 0 ? (
        <p className="text-center text-md" style={{color: 'var(--text-color-light)'}}>No enterprise orders yet.</p>
      ) : (
        <div className="table-container mb-8">
          <table className="data-table">
            <thead>
              <tr>
                <th className="table-header">Enterprise Name</th>
                <th className="table-header">Total Orders</th>
                <th className="table-header">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {stats.ordersPerEnterprise.map((entry, index) => (
                <tr key={index}>
                  <td className="table-cell">{entry.enterpriseName || 'N/A'}</td>
                  <td className="table-cell">{entry.totalOrders}</td>
                  <td className="table-cell">${entry.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="subsection-title">Buyer Activity</h3>
      {stats.buyerActivity.length === 0 ? (
        <p className="text-center text-md" style={{color: 'var(--text-color-light)'}}>No buyer activity yet.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="table-header">Buyer Name</th>
                <th className="table-header">Total Purchases</th>
                <th className="table-header">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {stats.buyerActivity.map((entry, index) => (
                <tr key={index}>
                  <td className="table-cell">{entry.buyerName || 'N/A'}</td>
                  <td className="table-cell">{entry.totalPurchases}</td>
                  <td className="table-cell">${entry.totalSpent.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardStatsPage;