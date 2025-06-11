import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="page-container home-page">
            <h1>Welcome to the User Management System</h1>
            {user ? (
                <p>You are logged in as **{user.name}** ({user.role}).</p>
            ) : (
                <>
                    <p>Register or Login to get started!</p>
                    <div className="button-group">
                        <Link to="/register"><button>Register</button></Link>
                        <Link to="/login"><button>Login</button></Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default Home;