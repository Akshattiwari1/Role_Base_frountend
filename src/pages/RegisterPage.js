import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const { register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    register(name, email, password, role);
  };

  return (
    <div className="form-card">
      <h2 className="section-title">Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            required
          />
        </div>
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
        <div className="form-group">
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
        <div className="form-group" style={{marginBottom: '1.5rem'}}>
          <label htmlFor="role" className="form-label">Register as:</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="form-select"
          >
            <option value="buyer">Buyer</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-full-width"
        >
          Register
        </button>
        <p className="text-center text-sm" style={{color: 'var(--text-color-light)', marginTop: '1rem'}}>
          Already have an account? <Link to="/login" className="link-blue font-semibold">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;