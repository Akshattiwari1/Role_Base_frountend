// frontend/src/pages/BuyerProductsPage.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
// import { useAuth } from '../context/AuthContext'; // Removed this import if not directly used in component logic/JSX

function BuyerProductsPage() {
  // const { user } = useAuth(); // If 'user' isn't explicitly used in JSX or component logic, this can be removed to clear warning
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/products'); // Correct endpoint for all products
      setProducts(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      toast.error(err.response?.data?.message || 'Failed to fetch products');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = (productId, quantity) => {
    const qtyToAdd = Math.max(1, parseInt(quantity) || 1);

    const product = products.find(p => p._id === productId);
    const totalStock = product ? product.warehouses.reduce((sum, wh) => sum + wh.stockLevel, 0) : 0;
    
    const currentCartQty = cart[productId] || 0;
    const newCartQty = currentCartQty + qtyToAdd;

    if (newCartQty > totalStock) {
        toast.error(`Cannot add ${qtyToAdd} more. Only ${totalStock - currentCartQty} available in stock.`);
        return;
    }

    setCart(prevCart => ({
      ...prevCart,
      [productId]: newCartQty
    }));
    toast.success(`Added ${qtyToAdd} item(s) to cart!`);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const qty = parseInt(newQuantity) || 0;
    if (qty < 0) return;

    const product = products.find(p => p._id === productId);
    const totalStock = product ? product.warehouses.reduce((sum, wh) => sum + wh.stockLevel, 0) : 0;

    if (qty > totalStock) {
        toast.error(`Quantity cannot exceed available stock (${totalStock}).`);
        setCart(prevCart => ({
            ...prevCart,
            [productId]: totalStock
        }));
    } else {
        setCart(prevCart => ({
            ...prevCart,
            [productId]: qty
        }));
    }
};

  const handlePlaceOrder = async () => {
    const orderItems = Object.keys(cart)
      .filter(productId => cart[productId] > 0)
      .map(productId => {
        const product = products.find(p => p._id === productId);
        if (!product) {
            toast.error(`Error: Product with ID ${productId} not found.`);
            throw new Error(`Product with ID ${productId} not found.`);
        }
        return {
          product: productId,
          name: product.name,
          quantity: cart[productId],
          priceAtOrder: product.price,
        };
      });

    if (orderItems.length === 0) {
      toast.warn('Your cart is empty!');
      return;
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + item.quantity * item.priceAtOrder, 0);

    try {
      setLoading(true);
      await api.post('/orders', { items: orderItems, totalAmount }); // Correct endpoint for placing orders
      toast.success('Order placed successfully!');
      setCart({});
      setLoading(false);
      fetchProducts(); // Re-fetch products to update stock levels
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
      setError(err.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center text-xl" style={{marginTop: '5rem', color: 'var(--text-color-medium)'}}>Loading products...</div>;
  if (error) return <div className="p-3 danger-light text-red-700 rounded-md mt-4">{error}</div>;

  return (
    <div className="card container">
      <h2 className="section-title">Browse Products</h2>

      {products.length === 0 ? (
        <p className="text-center text-lg" style={{color: 'var(--text-color-light)'}}>No products available to browse.</p>
      ) : (
        <div className="grid grid-cols-1 sm-grid-cols-2 lg-grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="card shadow-sm" style={{padding: '1.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-light)', display: 'flex', flexDirection: 'column'}}>
              <h3 className="font-semibold text-lg mb-2" style={{color: 'var(--text-color-dark)'}}>{product.name}</h3>
              <p className="text-sm mb-1" style={{color: 'var(--text-color-light)'}}>By: {product.enterprise?.name || 'N/A'}</p>
              <p className="text-md font-bold mb-2 link-blue">${product.price.toFixed(2)}</p>
              <p className="text-sm mb-3 flex-grow" style={{color: 'var(--text-color-medium)'}}>{product.description}</p>
              <p className="text-xs text-green-600 mb-2">
                In Stock: {product.warehouses.reduce((total, wh) => total + wh.stockLevel, 0)} items
              </p>
              <div className="flex items-center mt-auto">
                <input
                  type="number"
                  min="1"
                  value={cart[product._id] || 1}
                  onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                  id={`quantity-${product._id}`}
                  className="form-input w-20 mr-2"
                />
                <button
                  onClick={() => handleAddToCart(product._id, cart[product._id] || 1)}
                  className="btn btn-primary btn-sm flex-grow"
                  disabled={product.warehouses.reduce((total, wh) => total + wh.stockLevel, 0) <= 0}
                >
                  {product.warehouses.reduce((total, wh) => total + wh.stockLevel, 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {Object.keys(cart).length > 0 && (
        <div className="card mt-8" style={{padding: '1.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-light)'}}>
          <h3 className="subsection-title" style={{marginTop: 0}}>Your Cart</h3>
          <ul className="mb-4 space-y-2">
            {Object.keys(cart).map(productId => {
              const product = products.find(p => p._id === productId);
              if (!product || cart[productId] === 0) return null;
              return (
                <li key={productId} className="flex justify-between items-center text-md" style={{color: 'var(--text-color-dark)'}}>
                  <span>{product.name} x {cart[productId]}</span>
                  <span>${(product.price * cart[productId]).toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
          <div className="flex justify-between items-center font-bold text-lg mb-4" style={{color: 'var(--text-color-dark)'}}>
            <span>Total:</span>
            <span>${Object.keys(cart).reduce((sum, productId) => {
              const product = products.find(p => p._id === productId);
              return sum + (product ? product.price * cart[productId] : 0);
            }, 0).toFixed(2)}</span>
          </div>
          <button onClick={handlePlaceOrder} className="btn btn-success btn-lg w-full">Place Order</button>
        </div>
      )}
    </div>
  );
}

export default BuyerProductsPage;