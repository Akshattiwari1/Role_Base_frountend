import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

function BuyerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your orders');
      toast.error(err.response?.data?.message || 'Failed to fetch your orders');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center text-xl" style={{marginTop: '5rem', color: 'var(--text-color-medium)'}}>Loading your orders...</div>;
  if (error) return <div className="p-3 danger-light text-red-700 rounded-md mt-4">{error}</div>;

  return (
    <div className="card container" style={{maxWidth: '900px'}}>
      <h2 className="section-title">My Orders</h2>
      {orders.length === 0 ? (
        <p className="text-center text-lg" style={{color: 'var(--text-color-light)'}}>You have no orders yet. Go to "Browse Products" to place one!</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="table-header">Order ID</th>
                <th className="table-header">Enterprise</th>
                <th className="table-header">Total Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Order Date</th>
                <th className="table-header">Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="table-cell">{order._id.substring(0, 8)}...</td>
                  <td className="table-cell">{order.enterprise?.name || 'N/A'}</td>
                  <td className="table-cell">${order.totalAmount.toFixed(2)}</td>
                  <td className="table-cell">
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-cell">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="table-cell">
                    <ul>
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm" style={{color: 'var(--text-color-medium)', marginBottom: '0.25rem'}}>
                          {item.name} x {item.quantity} @ ${item.priceAtOrder.toFixed(2)} (Warehouse: {item.assignedWarehouse || 'N/A'})
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BuyerOrdersPage;