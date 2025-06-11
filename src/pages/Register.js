import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('buyer'); // Default role
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    // const navigate = useNavigate(); // Not needed if you don't navigate immediately after register

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const res = await register({ name, email, password, role });
            setMessage(res.message);
            // Optionally redirect after successful registration
            // navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="page-container form-page">
            <h2>Register</h2>
            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="role">Role:</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="buyer">Buyer</option>
                        <option value="enterprise">Enterprise</option>
                        <option value="admin">Admin</option> {/* In a real app, admin creation is usually restricted */}
                    </select>
                </div>
                <button type="submit">Register</button>
            </form>
            {message && <p className="message success">{message}</p>}
            {error && <p className="message error">{error}</p>}
        </div>
    );
};

export default Register;