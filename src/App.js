import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EnterpriseDashboard from './pages/EnterpriseDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Unauthorized from './pages/Unauthorized';


function App() {
    return (
        <Router>
            <AuthProvider>
                <Navbar />
                <div style={{ padding: '20px' }}> {/* This div is targeted by index.css */}
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Protected Routes */}
                        <Route element={<PrivateRoute roles={['admin']} />}>
                            <Route path="/admin-dashboard" element={<AdminDashboard />} />
                        </Route>
                        <Route element={<PrivateRoute roles={['admin', 'enterprise']} />}>
                            <Route path="/enterprise-dashboard" element={<EnterpriseDashboard />} />
                        </Route>
                        <Route element={<PrivateRoute roles={['admin', 'enterprise', 'buyer']} />}>
                            <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
                        </Route>

                        {/* More protected routes can be added here */}
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;