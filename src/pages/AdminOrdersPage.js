// frontend/src/pages/AdminOrdersPage.js
import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import './EnterpriseOrdersPage.css'; // Reusing some styles for consistency

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemWarehouses, setItemWarehouses] = useState({});

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      // Admin fetches all orders from /api/orders/all
      const { data } = await api.get('/orders/all'); // Corrected endpoint for Admin
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch all orders');
      toast.error(err.response?.data?.message || 'Failed to fetch all orders');
      setLoading(false);
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    // Initialize itemWarehouses for the selected order
    const initialWarehouses = {};
    order.items.forEach(item => {
      initialWarehouses[item._id] = item.assignedWarehouse || '';
    });
    setItemWarehouses(initialWarehouses);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setItemWarehouses({});
  };

  const handleWarehouseChange = (itemId, warehouseName) => {
    setItemWarehouses(prev => ({
      ...prev,
      [itemId]: warehouseName
    }));
  };

  const handleUpdateOrderStatus = async (status) => {
    if (!selectedOrder) return;

    try {
      setLoading(true);
      const updatedItems = selectedOrder.items.map(item => ({
        _id: item._id, // IMPORTANT: Send the _id of the order item
        productId: item.productId._id, // If productId is populated, send its _id
        name: item.name,
        quantity: item.quantity,
        priceAtOrder: item.priceAtOrder,
        assignedWarehouse: itemWarehouses[item._id] || null // Assign warehouse from state
      }));

      const res = await api.put(`/orders/${selectedOrder._id}/status`, {
        status,
        items: updatedItems // Send updated items including assigned warehouses
      });
      toast.success(res.data.message);
      closeModal();
      fetchAllOrders(); // Refresh the list
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update order status to ${status}`);
      console.error('Order update error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center text-xl" style={{marginTop: '5rem', color: 'var(--text-color-medium)'}}>Loading all orders...</div>;
  if (error) return <div className="p-3 danger-light text-red-700 rounded-md mt-4">{error}</div>;

  return (
    <div className="card container" style={{maxWidth: '1200px'}}>
      <h2 className="section-title">All Orders (Admin View)</h2>

      {orders.length === 0 ? (
        <p className="text-center text-lg" style={{color: 'var(--text-color-light)'}}>No orders found in the system.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="table-header">Order ID</th>
                <th className="table-header">Buyer</th>
                <th className="table-header">Enterprise</th>
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
                  <td className="table-cell">{order.enterprise?.name || 'N/A'}</td>
                  <td className="table-cell">${order.totalAmount.toFixed(2)}</td>
                  <td className="table-cell">
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-cell">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="table-cell action-buttons">
                    <button onClick={() => openModal(order)} className="btn btn-info btn-sm">View/Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && selectedOrder && (
        <div className="modal-overlay order-details-modal">
          <div className="modal-content">
            <h3 className="modal-title">Order Details (ID: {selectedOrder._id.substring(0, 8)}...)</h3>
            <p><strong>Buyer:</strong> {selectedOrder.buyer?.name || 'N/A'} ({selectedOrder.buyer?.email || 'N/A'})</p>
            <p><strong>Enterprise:</strong> {selectedOrder.enterprise?.name || 'N/A'}</p>
            <p><strong>Total Amount:</strong> ${selectedOrder.totalAmount.toFixed(2)}</p>
            <p><strong>Status:</strong> <span className={`status-badge status-${selectedOrder.status}`}>{selectedOrder.status}</span></p>
            <p><strong>Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</p>

            <h4 style={{marginTop: '20px', marginBottom: '10px', color: 'var(--text-color-dark)'}}>Items:</h4>
            <ul className="order-items-list">
              {selectedOrder.items.map((item) => (
                <li key={item._id}>
                  <p><strong>Product:</strong> {item.name}</p>
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  <p><strong>Price At Order:</strong> ${item.priceAtOrder.toFixed(2)}</p>
                  <div className="warehouse-input">
                    <label htmlFor={`warehouse-${item._id}`}>Assigned Warehouse:</label>
                    <input
                      type="text"
                      id={`warehouse-${item._id}`}
                      value={itemWarehouses[item._id] || ''}
                      onChange={(e) => handleWarehouseChange(item._id, e.target.value)}
                      placeholder="e.g., Main Warehouse, North Depot"
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="order-actions">
              {selectedOrder.status === 'pending' && (
                <>
                  <button onClick={() => handleUpdateOrderStatus('approved')} className="btn btn-approve">Approve Order</button>
                  <button onClick={() => handleUpdateOrderStatus('rejected')} className="btn btn-reject">Reject Order</button>
                </>
              )}
              {selectedOrder.status === 'approved' && (
                <button onClick={() => handleUpdateOrderStatus('shipped')} className="btn btn-primary">Mark as Shipped</button>
              )}
              {selectedOrder.status === 'shipped' && (
                <button onClick={() => handleUpdateOrderStatus('delivered')} className="btn btn-success">Mark as Delivered</button>
              )}
              {(selectedOrder.status === 'pending' || selectedOrder.status === 'approved' || selectedOrder.status === 'shipped') && (
                <button onClick={() => handleUpdateOrderStatus('cancelled')} className="btn btn-danger">Cancel Order</button>
              )}
              <button onClick={closeModal} className="btn btn-close">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrdersPage;