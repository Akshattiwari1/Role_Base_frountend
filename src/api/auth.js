import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/auth'; // Use environment variable

export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        console.error("API Error during registration:", error);
        if (error.response) {
            throw error.response.data;
        } else if (error.request) {
            throw { message: 'No response from server. Check network connection or CORS setup.' };
        } else {
            throw { message: 'An unexpected error occurred: ' + error.message };
        }
    }
};

export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, credentials);
        return response.data;
    } catch (error) {
        console.error("API Error during login:", error);
        if (error.response) {
            throw error.response.data;
        } else if (error.request) {
            throw { message: 'No response from server. Check network connection or CORS setup.' };
        } else {
            throw { message: 'An unexpected error occurred: ' + error.message };
        }
    }
};