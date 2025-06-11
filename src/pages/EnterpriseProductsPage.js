// frontend/src/pages/EnterpriseProductsPage.js
import React, { useEffect, useState, useCallback } from 'react'; // Import useCallback
import { useNavigate } from 'react-router-dom'; // Make sure useNavigate is imported
import api from '../api'; // Correct path to api.js (assuming it's in src/)
import { toast } from 'react-toastify'; // Ensure react-toastify is installed and used
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'; // Only import used icons
import './EnterpriseProductsPage.css'; // Optional: for styling

function EnterpriseProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // For edit/add form
  const [warehousesInput, setWarehousesInput] = useState([{ warehouseName: '', stockLevel: 0 }]); // For warehouse management
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [productIdToDelete, setProductIdToDelete] = useState(null);

  const navigate = useNavigate(); // Initialize useNavigate
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Define fetchProducts using useCallback
  const fetchProducts = useCallback(async () => {
    // Redirect if not logged in or not an enterprise (moved here from useEffect)
    if (!userInfo || userInfo.role !== 'enterprise') {
        navigate('/login');
        return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      // Corrected endpoint to match your previous pattern `/api/products/enterprise-products`
      const res = await api.get('/api/products/enterprise-products', config); 
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      toast.error(err.response?.data?.message || 'Failed to fetch products');
      setLoading(false);
    }
  }, [userInfo, navigate]); // fetchProducts depends on userInfo and navigate

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // Now fetchProducts is a stable dependency

  const handleAddProduct = () => {
    setCurrentProduct(null); // Clear any existing product data
    setWarehousesInput([{ warehouseName: '', stockLevel: 0 }]); // Reset warehouses
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    // Deep copy warehouses to avoid direct state mutation
    setWarehousesInput(product.warehouses.map(wh => ({ ...wh })));
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    // Use currentProduct for form values if editing, otherwise new data
    const productData = currentProduct ? { ...currentProduct } : {};

    // Get data from form inputs if using controlled components or refs
    // For simplicity with your original form structure (using onSubmit with FormData),
    // we'll extract directly here. If you have controlled inputs with state, adjust.
    const form = event.target;
    productData.name = form.name.value;
    productData.description = form.description.value;
    productData.price = parseFloat(form.price.value);
    productData.isAvailable = form.isAvailable.checked; // Correctly get checkbox state

    // Filter out empty warehouse entries
    const validWarehouses = warehousesInput.filter(wh => wh.warehouseName.trim() !== '');

    if (validWarehouses.length === 0) {
        toast.error('At least one warehouse name must be provided.');
        return;
    }

    // Convert stock levels to numbers
    productData.warehouses = validWarehouses.map(wh => ({
      warehouseName: wh.warehouseName,
      stockLevel: parseInt(wh.stockLevel) || 0 // Ensure stock is a number
    }));

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      if (currentProduct) {
        // Update product
        await api.put(`/api/products/${currentProduct._id}`, productData, config); // Use /api prefix
        toast.success('Product updated successfully!');
      } else {
        // Add new product
        await api.post('/api/products', productData, config); // Use /api prefix
        toast.success('Product added successfully!');
      }
      setIsModalOpen(false);
      fetchProducts(); // Re-fetch products to update the list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await api.delete(`/api/products/${productIdToDelete}`, config); // Use /api prefix
      toast.success('Product deleted successfully!');
      setIsConfirmDeleteModalOpen(false);
      setProductIdToDelete(null);
      fetchProducts(); // Re-fetch products to update the list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const openConfirmDeleteModal = (productId) => {
    setProductIdToDelete(productId);
    setIsConfirmDeleteModalOpen(true);
  };

  const handleWarehouseChange = (index, field, value) => {
    const newWarehouses = [...warehousesInput];
    newWarehouses[index][field] = value;
    setWarehousesInput(newWarehouses);
  };

  const handleAddWarehouse = () => {
    setWarehousesInput([...warehousesInput, { warehouseName: '', stockLevel: 0 }]);
  };

  const handleRemoveWarehouse = (index) => {
    const newWarehouses = warehousesInput.filter((_, i) => i !== index);
    setWarehousesInput(newWarehouses);
  };

  if (loading) return <div className="text-center text-xl" style={{marginTop: '5rem', color: 'var(--text-color-medium)'}}>Loading products...</div>;
  if (error) return <div className="p-3 danger-light text-red-700 rounded-md mt-4">{error}</div>;

  return (
    <div className="card container">
      <h2 className="section-title">My Products</h2>
      <button onClick={handleAddProduct} className="btn btn-primary mb-6">
        <FaPlus className="mr-2" /> Add New Product
      </button>

      {products.length === 0 ? (
        <p className="text-center text-lg" style={{color: 'var(--text-color-light)'}}>You haven't added any products yet.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Description</th>
                <th className="table-header">Price</th>
                <th className="table-header">Total Stock</th>
                <th className="table-header">Available</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="table-cell">{product.name}</td>
                  <td className="table-cell">{product.description}</td>
                  <td className="table-cell">${product.price.toFixed(2)}</td>
                  <td className="table-cell">
                    {product.warehouses.reduce((total, wh) => total + wh.stockLevel, 0)}
                  </td>
                  <td className="table-cell">
                    {product.isAvailable ? <span className="text-green-600">Yes</span> : <span className="text-red-600">No</span>}
                  </td>
                  <td className="table-cell action-buttons">
                    <button onClick={() => handleEditProduct(product)} className="btn btn-sm btn-info mr-2">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => openConfirmDeleteModal(product._id)} className="btn btn-sm btn-danger">
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{currentProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input type="text" id="name" name="name" defaultValue={currentProduct?.name || ''} required />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" defaultValue={currentProduct?.description || ''} required></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="price">Price</label>
                <input type="number" id="price" name="price" step="0.01" defaultValue={currentProduct?.price || ''} required min="0" />
              </div>

              <div className="form-group mt-4">
                <label className="block text-lg font-semibold mb-2" style={{color: 'var(--text-color-dark)'}}>Warehouses</label>
                {warehousesInput.map((warehouse, index) => (
                  <div key={index} className="flex items-end mb-3 space-x-2">
                    <div className="flex-grow">
                      <label htmlFor={`warehouseName-${index}`} className="text-sm">Warehouse Name</label>
                      <input
                        type="text"
                        id={`warehouseName-${index}`}
                        value={warehouse.warehouseName}
                        onChange={(e) => handleWarehouseChange(index, 'warehouseName', e.target.value)}
                        placeholder="e.g., Main Warehouse"
                        className="form-input"
                        required={index === 0} // Make first warehouse name required
                      />
                    </div>
                    <div className="w-24">
                      <label htmlFor={`stockLevel-${index}`} className="text-sm">Stock</label>
                      <input
                        type="number"
                        id={`stockLevel-${index}`}
                        value={warehouse.stockLevel}
                        onChange={(e) => handleWarehouseChange(index, 'stockLevel', e.target.value)}
                        className="form-input"
                        min="0"
                      />
                    </div>
                    {warehousesInput.length > 1 && ( // Allow removing only if more than one warehouse
                      <button type="button" onClick={() => handleRemoveWarehouse(index)} className="btn btn-sm btn-danger h-10">
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddWarehouse} className="btn btn-secondary btn-sm mt-2">
                  <FaPlus className="mr-1" /> Add Warehouse
                </button>
              </div>

              <div className="form-group flex items-center mt-4">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  defaultChecked={currentProduct ? currentProduct.isAvailable : true} // Default to true for new product
                  className="form-checkbox"
                />
                <label htmlFor="isAvailable" className="ml-2 mb-0">Is Available for Purchase</label>
              </div>

              <div className="flex justify-end mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary mr-2">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {isConfirmDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Confirm Deletion</h3>
            <p>Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end mt-6">
              <button onClick={() => setIsConfirmDeleteModalOpen(false)} className="btn btn-secondary mr-2">
                Cancel
              </button>
              <button onClick={handleDeleteProduct} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnterpriseProductsPage;