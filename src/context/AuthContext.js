import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwt-decode

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Check if token is expired
          if (parsedUser.token) {
            const decodedToken = jwtDecode(parsedUser.token);
            if (decodedToken.exp * 1000 < Date.now()) {
              // Token expired, log out
              localStorage.removeItem('user');
              setUser(null);
              toast.info('Your session has expired. Please log in again.');
            } else {
              setUser(parsedUser);
            }
          }
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem('user'); // Clear invalid data
        setUser(null); // Ensure user is null if parsing fails
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      toast.success('Logged in successfully!');
      // Navigate based on role and enterpriseStatus
      if (res.data.role === 'admin') {
        navigate('/admin/users');
      } else if (res.data.role === 'enterprise') {
        if (res.data.enterpriseStatus === 'approved') {
          navigate('/enterprise/products');
        } else if (res.data.enterpriseStatus === 'pending') {
          toast.info('Your enterprise account is pending admin approval.');
          navigate('/'); // Redirect to home or a dedicated pending page
        } else { // Rejected or other states
          toast.error('Your enterprise account is not approved. Please contact an administrator.');
          navigate('/');
        }
      } else { // buyer
        navigate('/buyer/products');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', error.response?.data || error);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      // For enterprise, don't auto-login, wait for approval
      if (role === 'enterprise') {
        toast.success('Registration successful. Your enterprise account is pending admin approval.');
        navigate('/login');
      } else { // Buyer auto-login
        localStorage.setItem('user', JSON.stringify(res.data));
        setUser(res.data);
        toast.success('Registration successful!');
        navigate('/buyer/products');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Try a different email/name.');
      console.error('Register error:', error.response?.data || error);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully!');
    navigate('/login');
  };

  // Function to update user object in context and local storage (e.g., after admin approves enterprise or blocks user)
  const updateUserInContext = (updatedUserData) => {
    setUser(prevUser => {
      // Create a new user object merging previous and updated data
      const newUser = { ...prevUser, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserInContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);