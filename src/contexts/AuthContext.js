import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser as loginApi, registerUser as registerApi } from '../api/auth';
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check token expiry
                if (decoded.exp * 1000 < Date.now()) {
                    console.log("Token expired. Logging out.");
                    localStorage.removeItem('token');
                    setUser(null);
                } else {
                    // Assuming token payload includes `id`, `role`, and `name`
                    // If your backend token only has `id` and `role`, you might need to
                    // fetch user details or store name in localStorage during login.
                    setUser({ id: decoded.id, role: decoded.role, name: decoded.name });
                    // NOTE: The `name` might not be in the JWT payload from your backend.
                    // If login endpoint returns `name`, store it in localStorage or pass it through.
                    // For now, I'm assuming it's present for consistency.
                }
            } catch (error) {
                console.error("Failed to decode token:", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (name, password) => {
        try {
            const data = await loginApi({ name, password });
            localStorage.setItem('token', data.token);
            // Assuming data.name is returned by loginApi
            setUser({ id: jwtDecode(data.token).id, role: jwtDecode(data.token).role, name: data.name });
            return data;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const data = await registerApi(userData);
            return data;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const isAdmin = user && user.role === 'admin';
    const isEnterprise = user && user.role === 'enterprise';
    const isBuyer = user && user.role === 'buyer';

    return (
        <AuthContext.Provider value={{ user, isAdmin, isEnterprise, isBuyer, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);