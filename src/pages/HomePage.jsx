import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentRole } from '../features/auth/authSlice';

const HomePage = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const role = useSelector(selectCurrentRole);

    if (isAuthenticated) {
        // Redirect to appropriate dashboard based on role
        if (role === 'admin') {
            return <Navigate to="/admin/foot-exam" replace />;
        } else if (role === 'user') {
            return <Navigate to="/user/rssdi-save-the-feet-2.0" replace />;
        }
    }

    // Default redirect for unauthenticated users
    return <Navigate to="/" replace />;
};

export default HomePage;