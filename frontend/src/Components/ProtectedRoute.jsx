import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    const location = useLocation();

    if (!token || !userStr) {
        console.warn("--> ProtectedRoute: No token or user found. Redirecting to login.");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    let user;
    try {
        user = JSON.parse(userStr);
    } catch (e) {
        console.error("--> ProtectedRoute: Failed to parse user data. Redirecting to login.");
        return <Navigate to="/login" replace />;
    }

    const userRole = (user.role || "").toLowerCase();
    const normalizedAllowedRoles = (allowedRoles || []).map(r => r.toLowerCase());

    console.log(`--> ProtectedRoute Check: UserRole=${userRole}, Allowed=[${normalizedAllowedRoles.join(", ")}]`);

    if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(userRole)) {
        console.warn(`--> ProtectedRoute: Access Denied. User role '${userRole}' not in [${normalizedAllowedRoles.join(", ")}]`);
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
