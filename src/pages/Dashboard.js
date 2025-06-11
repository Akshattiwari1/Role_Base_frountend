import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return <p>Please login to see the dashboard.</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome, {user.role}</h1>
      {user.role === 'admin' && <p>Admin panel: Manage users and orders</p>}
      {user.role === 'enterprise' && <p>Enterprise panel: Manage products/warehouses</p>}
      {user.role === 'buyer' && <p>Buyer panel: Place orders</p>}
      <button onClick={logout} style={{ marginTop: 20 }}>
        Logout
      </button>
    </div>
  );
}
