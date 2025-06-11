import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="form-card">
      <h2 className="section-title">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group" style={{marginBottom: '1.5rem'}}>
          <label htmlFor="password" className="form-label">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-full-width"
        >
          Login
        </button>
        <p className="text-center text-sm" style={{color: 'var(--text-color-light)', marginTop: '1rem'}}>
          Don't have an account? <Link to="/register" className="link-blue font-semibold">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;