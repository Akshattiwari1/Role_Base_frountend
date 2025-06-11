import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await login(name, password);
            if (data.role === 'admin') {
                navigate('/admin-dashboard');
            } else if (data.role === 'enterprise') {
                navigate('/enterprise-dashboard');
            } else {
                navigate('/buyer-dashboard');
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        }
    };

    return (
        <div className="page-container form-page">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Login</button>
            </form>
            {error && <p className="message error">{error}</p>}
        </div>
    );
};

export default Login;