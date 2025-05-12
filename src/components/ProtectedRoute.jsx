// components/ProtectedRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {
    selectIsAuthenticated,
    selectCurrentRole,
    selectAuthLoading,
} from '../features/auth/authSlice';

const ProtectedRoute = ({ allowedRoles, redirectPath = null }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const role = useSelector(selectCurrentRole);
    const loading = useSelector(selectAuthLoading);
    const location = useLocation();

    if (loading) {
        return <div>Loading authentication...</div>;
    }

    const loginRedirect = redirectPath || (role === 'admin' ? '/admin' : '/user-login');

    if (!isAuthenticated) {
        return <Navigate to={loginRedirect} state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
