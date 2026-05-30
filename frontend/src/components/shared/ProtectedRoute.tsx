import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'super_admin')  return <Navigate to="/" replace />;
    if (user.role === 'group_admin')  return <Navigate to="/group" replace />;
    if (user.role === 'coordinator')  return <Navigate to="/coordinator" replace />;
    if (user.role === 'teacher')      return <Navigate to="/teacher" replace />;
    if (user.role === 'student')      return <Navigate to="/student" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
