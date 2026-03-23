import React from 'react';
import { useAuthStore } from '../../store/authStore';

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const role = useAuthStore(s => s.role);
  if (!role || !roles.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
