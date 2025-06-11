// frontend/src/pages/EnterpriseOrdersPage.js
import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

function EnterpriseOrdersPage({ isAdmin = false }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editedItems, setEditedItems] = useState([]);

  // Filter states for admin
  const [filterBuyer, setFilterBuyer] = useState('');
  const [filterEnterprise, setFilterEnterprise] = useState('');
  const [allUsers, setAllUsers] = useState([]); // To populate buyer/enterprise dropdowns

  useEffect(() => {
    fetchOrders();
    if (isAdmin) {
      fetchAllUsers(); // Fetch users for filter dropdowns
    }
  }, [user, isAdmin, filterBuyer, filterEnterprise]); // Re-fetch orders when filters change

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let res;
      if (isAdmin) {
        // Construct query parameters for filtering
        const queryParams = new URLSearchParams();
        if (filterBuyer) queryParams.append('buyerId', filterBuyer);
        if (filterEnterprise) queryParams.append('enterpriseId', filterEnterprise);

        res = await api.get(`/orders/all?${queryParams.toString()}`);
      } else {
        res = await api.get('/orders/enterprise-orders');
      }
      setOrders(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      toast.error(err.response?.data?.message || 'Failed to fetch orders');
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await api.get('/admin/users'); // Use the existing endpoint to get all users
      setAllUsers(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch users for filters');
      console.error(err);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      let payload = { status: newStatus };

      if (user.role === 'enterprise' && newStatus === 'approved' && selectedOrder && selectedOrder._id === orderId) {
          if (editedItems.some(item => !item.assignedWarehouse || item.assignedWarehouse === '')) {
              toast.error('All items must have an assigned warehouse before approving the order.');
              return;
          }
          payload.items = editedItems.map(item => ({
              _id: item._id,
              assignedWarehouse: item.assignedWarehouse
          }));
      }

      const res = await api.put(`/orders/${orderId}/status`, payload);
      toast.success(res.data.message);
      fetchOrders();
      setSelectedOrder(null);
      setEditedItems([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
      console.error(err.response?.data || err);
    }
  };

  const handleOpenModal = (order) => {
      setSelectedOrder(order);
      setEditedItems(order.items.map(item => ({ ...item, assignedWarehouse: item.assignedWarehouse || '' })));
  };

  const handleItemWarehouseChange = (itemId, newWarehouse) => {
      setEditedItems(prevItems =>
          prevItems.map(item =>
              item._id === itemId ? { ...item, assignedWarehouse: newWarehouse } : item
          )
      );
  };

  if (loading) return <div className="text-center text-xl" style={{marginTop: '5rem', color: 'var(--text-color-medium)'}}>Loading orders...</div>;
  if (error) return <div className="p-3 danger-light text-red-700 rounded-md mt-4">{error}</div>;

  const pageTitle = isAdmin ? 'All System Orders (Admin View)' : 'My Enterprise Product Orders';

  return (
    <div className="card container" style={{maxWidth: '1000px'}}>
      <h2 className="section-title">{pageTitle}</h2>

      {isAdmin && (
        <div className="flex flex-col md-flex-row gap-4 mb-6">
          <div className="form-group flex-grow">
            <label htmlFor="filterBuyer" className="form-label">Filter by Buyer:</label>
            <select
              id="filterBuyer"
              value={filterBuyer}
              onChange={(e) => setFilterBuyer(e.target.value)}
              className="form-select"
            >
              <option value="">All Buyers</option>
              {allUsers.filter(u => u.role === 'buyer').map(buyer => (
                <option key={buyer._id} value={buyer._id}>{buyer.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group flex-grow">
            <label htmlFor="filterEnterprise" className="form-label">Filter by Enterprise:</label>
            <select
              id="filterEnterprise"
              value={filterEnterprise}
              onChange={(e) => setFilterEnterprise(e.target.value)}
              className="form-select"
            >
              <option value="">All Enterprises</option>
              {allUsers.filter(u => u.role === 'enterprise' && u.enterpriseStatus === 'approved').map(enterprise => (
                <option key={enterprise._id} value={enterprise._id}>{enterprise.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-center text-lg" style={{color: 'var(--text-color-light)'}}>No orders found.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="table-header">Order ID</th>
                <th className="table-header">Buyer</th>
                {isAdmin && <th className="table-header">Enterprise</th>}
                <th className="table-header">Total Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Order Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="table-cell">{order._id.substring(0, 8)}...</td>
                  <td className="table-cell">{order.buyer?.name || 'N/A'}</td>
                  {isAdmin && <td className="table-cell">{order.enterprise?.name || 'N/A'}</td>}
                  <td className="table-cell">${order.totalAmount.toFixed(2)}</td>
                  <td className="table-cell">
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-cell">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="table-cell">
                    <button onClick={() => handleOpenModal(order)} className="btn btn-secondary btn-sm mr-2">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="subsection-title" style={{marginTop: 0, fontSize: '1.5rem', marginBottom: '1rem'}}>Order Details (ID: {selectedOrder._id.substring(0, 8)}...)</h3>
            <div className="grid grid-cols-1 md-grid-cols-2 gap-4 mb-4" style={{color: 'var(--text-color-medium)'}}>
                <p><strong>Buyer:</strong> {selectedOrder.buyer?.name}</p>
                <p><strong>Enterprise:</strong> {selectedOrder.enterprise?.name}</p>
                <p><strong>Total Amount:</strong> <span className="font-semibold text-lg link-blue">${selectedOrder.totalAmount.toFixed(2)}</span></p>
                <p>
                  <strong>Status:</strong>
                  <span className={`status-badge ml-2 status-${selectedOrder.status}`}>
                    {selectedOrder.status}
                  </span>
                </p>
                <p className="md-col-span-2"><strong>Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
            </div>

            <h4 className="font-semibold text-xl" style={{marginTop: '1.5rem', marginBottom: '0.75rem', color: 'var(--text-color-dark)'}}>Items:</h4>
            <div className="space-y-4 max-h-60 overflow-y-auto" style={{paddingRight: '0.5rem'}}>
              {editedItems.map((item, idx) => (
                <div key={idx} className="card" style={{padding: '1rem', backgroundColor: 'var(--bg-light)', border: '1px solid var(--border-color)', boxShadow: 'none'}}>
                  <p className="font-medium" style={{color: 'var(--text-color-dark)'}}><strong>Product:</strong> {item.name}</p>
                  <p className="text-sm" style={{color: 'var(--text-color-light)'}}><strong>Quantity:</strong> {item.quantity}</p>
                  <p className="text-sm" style={{color: 'var(--text-color-light)'}}><strong>Price at Order:</strong> ${item.priceAtOrder.toFixed(2)}</p>
                  {user.role === 'enterprise' && selectedOrder.status === 'pending' ? (
                      <div className="form-group" style={{marginTop: '0.75rem'}}>
                          <label htmlFor={`warehouse-${item._id}`} className="form-label" style={{marginBottom: '0.25rem'}}>Assign Warehouse:</label>
                          <input
                              type="text"
                              id={`warehouse-${item._id}`}
                              value={item.assignedWarehouse}
                              onChange={(e) => handleItemWarehouseChange(item._id, e.target.value)}
                              placeholder="e.g., Main Warehouse"
                              className="form-input"
                              required
                          />
                      </div>
                  ) : (
                      <p className="text-sm" style={{color: 'var(--text-color-light)'}}><strong>Assigned Warehouse:</strong> {item.assignedWarehouse || 'N/A'}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3" style={{marginTop: '2rem'}}>
              <button onClick={() => { setSelectedOrder(null); setEditedItems([]); }} className="btn btn-secondary">Close</button>

              {user.role === 'enterprise' && selectedOrder.status === 'pending' && (
                  <>
                      <button onClick={() => handleUpdateStatus(selectedOrder._id, 'approved')} className="btn btn-success">Approve Order</button>
                      <button onClick={() => handleUpdateStatus(selectedOrder._id, 'rejected')} className="btn btn-danger">Reject Order</button>
                  </>
              )}
               {isAdmin && selectedOrder.status === 'approved' && (
                    <button onClick={() => handleUpdateStatus(selectedOrder._id, 'shipped')} className="btn btn-indigo">Ship Order</button>
                )}
                {isAdmin && selectedOrder.status === 'shipped' && (
                    <button onClick={() => handleUpdateStatus(selectedOrder._id, 'delivered')} className="btn btn-success">Mark Delivered</button>
                )}
                {isAdmin && selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <button onClick={() => handleUpdateStatus(selectedOrder._id, 'cancelled')} className="btn btn-danger">Cancel Order</button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnterpriseOrdersPage;