import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { token, role } = useAuthStore();

  // Not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'Manager') return <Navigate to="/manager/dashboard" replace />;
    if (role === 'Trainer') return <Navigate to="/trainer/home" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
