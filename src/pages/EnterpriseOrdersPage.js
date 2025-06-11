// frontend/src/pages/EnterpriseOrdersPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Correct path assuming api.js is in src/
import './EnterpriseOrdersPage.css'; // Optional: for basic styling

const EnterpriseOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // To view/edit a specific order
  const [itemWarehouses, setItemWarehouses] = useState({}); // Stores { itemId: warehouseName }
  const navigate = useNavigate();

  // Assuming userInfo is stored in localStorage after login
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    // Redirect if not logged in or not an enterprise/admin
    if (!userInfo || (userInfo.role !== 'enterprise' && userInfo.role !== 'admin')) {
      navigate('/login');
      return;
    }
    fetchEnterpriseOrders();
  }, [userInfo, navigate]); // Added userInfo and navigate to dependency array

  const fetchEnterpriseOrders = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      let url = '/api/orders/enterprise-orders'; // Default for enterprise user
      if (userInfo.role === 'admin') {
          url = '/api/orders/all'; // Admin fetches all orders
      }
      
      const { data } = await api.get(url, config);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    // Initialize itemWarehouses state with existing assigned warehouses if any
    const initialWarehouses = {};
    order.items.forEach(item => {
      initialWarehouses[item._id] = item.assignedWarehouse || '';
    });
    setItemWarehouses(initialWarehouses);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setItemWarehouses({}); // Clear warehouses when closing
  };

  const handleWarehouseChange = (itemId, warehouseName) => {
    setItemWarehouses(prev => ({
      ...prev,
      [itemId]: warehouseName,
    }));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!userInfo) return;

    let payload = { status: newStatus };

    if (newStatus === 'approved') {
      // Validate that all items have an assigned warehouse if status is 'approved'
      const itemsWithWarehouses = selectedOrder.items.map(item => ({
        _id: item._id,
        // Include productId as it might be useful for backend logic or logging,
        // even though it's not strictly required by the backend PUT route for status update
        productId: item.productId,
        assignedWarehouse: itemWarehouses[item._id] || '',
      }));

      // Corrected typo here
      const missingWarehouse = itemsWithWarehouses.some(item => !item.assignedWarehouse || item.assignedWarehouse.trim() === '');

      if (missingWarehouse) {
        alert('Please assign a warehouse to ALL items before approving the order.');
        return; // Stop function execution
      }
      payload.items = itemsWithWarehouses;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await api.put(`/api/orders/${orderId}/status`, payload, config);
      alert(data.message); // Show success message from backend
      fetchEnterpriseOrders(); // Refresh orders list
      handleCloseDetails(); // Close the details view
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.message || 'Failed to update order status.');
      alert(err.response?.data?.message || 'Failed to update order status.'); // Show error message to user
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // Determine if the current user can assign warehouses (only enterprise and pending status)
  const canAssignWarehouse = userInfo.role === 'enterprise';

  return (
    <div className="enterprise-orders-page">
      <h2>{userInfo.role === 'admin' ? 'All System Orders' : 'Your Enterprise Orders'}</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <h3>Order ID: {order._id}</h3>
              {userInfo.role === 'admin' && <p>Enterprise: {order.enterprise ? order.enterprise.name : 'N/A'}</p>}
              <p>Buyer: {order.buyer ? order.buyer.name : 'N/A'}</p>
              <p>Total: ${order.totalAmount.toFixed(2)}</p>
              <p>Status: <span className={`status-${order.status}`}>{order.status}</span></p>
              <p>Order Date: {new Date(order.orderDate).toLocaleDateString()}</p>
              <button onClick={() => handleViewDetails(order)}>View Details</button>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-content">
            <h3>Order Details - {selectedOrder._id}</h3>
            {userInfo.role === 'admin' && <p>Enterprise: {selectedOrder.enterprise ? selectedOrder.enterprise.name : 'N/A'}</p>}
            <p>Buyer: {selectedOrder.buyer ? selectedOrder.buyer.name : 'N/A'} ({selectedOrder.buyer ? selectedOrder.buyer.email : 'N/A'})</p>
            <p>Total: ${selectedOrder.totalAmount.toFixed(2)}</p>
            <p>Current Status: <span className={`status-${selectedOrder.status}`}>{selectedOrder.status}</span></p>
            <p>Order Date: {new Date(selectedOrder.orderDate).toLocaleString()}</p>

            <h4>Items:</h4>
            <ul className="order-items-list">
              {selectedOrder.items.map(item => (
                <li key={item._id}>
                  {item.name} (Qty: {item.quantity}) - Price: ${item.priceAtOrder.toFixed(2)}
                  {/* Show warehouse assignment input for pending orders if enterprise user */}
                  {selectedOrder.status === 'pending' && canAssignWarehouse && (
                    <div className="warehouse-input">
                      <label htmlFor={`warehouse-${item._id}`}>Assign Warehouse:</label>
                      <input
                        id={`warehouse-${item._id}`}
                        type="text"
                        value={itemWarehouses[item._id] || ''}
                        onChange={(e) => handleWarehouseChange(item._id, e.target.value)}
                        placeholder="e.g., Main Warehouse"
                      />
                    </div>
                  )}
                  {/* Always show assigned warehouse if it exists and not pending (or if admin) */}
                  {item.assignedWarehouse && (selectedOrder.status !== 'pending' || userInfo.role === 'admin') && (
                      <p>Assigned Warehouse: {item.assignedWarehouse}</p>
                  )}
                </li>
              ))}
            </ul>

            <div className="order-actions">
              {selectedOrder.status === 'pending' && userInfo.role === 'enterprise' && (
                <>
                  <button
                    className="btn btn-approve"
                    onClick={() => handleStatusChange(selectedOrder._id, 'approved')}
                  >
                    Approve Order
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => handleStatusChange(selectedOrder._id, 'rejected')}
                  >
                    Reject Order
                  </button>
                </>
              )}
              {/* Admin can see and potentially change certain statuses (add logic here if needed for shipped/delivered/cancelled) */}
              {/* For simplicity, enterprise handles pending, admin would have separate controls */}
               {userInfo.role === 'admin' && selectedOrder.status === 'approved' && (
                    <button
                        className="btn btn-primary" // Use a different style for admin buttons
                        onClick={() => handleStatusChange(selectedOrder._id, 'shipped')}
                    >
                        Mark as Shipped
                    </button>
               )}
               {userInfo.role === 'admin' && selectedOrder.status === 'shipped' && (
                    <button
                        className="btn btn-primary"
                        onClick={() => handleStatusChange(selectedOrder._id, 'delivered')}
                    >
                        Mark as Delivered
                    </button>
               )}
               {/* Admin can cancel any order, or enterprise can cancel if allowed by business logic */}
               {(userInfo.role === 'admin' || (userInfo.role === 'enterprise' && selectedOrder.status === 'pending')) &&
                selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => handleStatusChange(selectedOrder._id, 'cancelled')}
                    >
                        Cancel Order
                    </button>
                )}


              <button className="btn btn-close" onClick={handleCloseDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseOrdersPage;