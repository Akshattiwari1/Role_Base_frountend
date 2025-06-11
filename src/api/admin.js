import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/admin'; // Use environment variable

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("API Error fetching all users:", error);
        if (error.response) {
            throw error.response.data;
        } else if (error.request) {
            throw { message: 'No response from server. Check network connection or CORS setup.' };
        } else {
            throw { message: 'An unexpected error occurred: ' + error.message };
        }
    }
};

export const updateEnterpriseStatus = async (id, status) => {
    try {
        const response = await axios.put(`${API_URL}/enterprise/${id}/status`, { status }, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("API Error updating enterprise status:", error);
        if (error.response) {
            throw error.response.data;
        } else if (error.request) {
            throw { message: 'No response from server. Check network connection or CORS setup.' };
        } else {
            throw { message: 'An unexpected error occurred: ' + error.message };
        }
    }
};

export const toggleUserBlock = async (id) => {
    try {
        const response = await axios.put(`${API_URL}/user/${id}/block`, {}, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("API Error toggling user block:", error);
        if (error.response) {
            throw error.response.data;
        } else if (error.request) {
            throw { message: 'No response from server. Check network connection or CORS setup.' };
        } else {
            throw { message: 'An unexpected error occurred: ' + error.message };
        }
    }
};