import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { token, role } = useAuthStore();

  // Already authenticated - redirect to role dashboard
  if (token && role) {
    if (role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'Manager') return <Navigate to="/manager/dashboard" replace />;
    if (role === 'Trainer') return <Navigate to="/trainer/home" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
