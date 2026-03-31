// frontend/src/components/auth/AdminRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user')); // User object nikalein

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decodedToken = jwtDecode(token);
        
        // Dono jagah check karein: Token mein bhi aur LocalStorage mein bhi
        const isAdmin = decodedToken.is_admin || user?.is_admin;

        if (isAdmin) {
            return <Outlet />;
        } else {
            console.log("Admin check failed. Redirecting to User Dashboard...");
            return <Navigate to="/dashboard" replace />;
        }
    } catch (error) {
        console.error("Token Decode Error:", error);
        return <Navigate to="/login" replace />;
    }
};

export default AdminRoute;