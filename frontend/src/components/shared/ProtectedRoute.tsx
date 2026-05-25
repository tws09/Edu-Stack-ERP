import { Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { slug } = useParams<{ slug?: string }>();
  const isAdminArea = window.location.pathname.startsWith('/admin');
  const loginPath = isAdminArea ? '/admin/login' : slug ? `/${slug}/login` : '/register';

  if (!isAuthenticated || !user) {
    return <Navigate to={loginPath} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const prefix = slug ? `/${slug}` : '';
    let path: string;
    if (user.role === 'super_admin') path = '/admin';
    else if (user.role === 'group_admin') path = `${prefix}/group`;
    else if (user.role === 'teacher') path = `${prefix}/teacher`;
    else if (user.role === 'student') path = `${prefix}/student`;
    else path = `${prefix}/dashboard`;
    return <Navigate to={path} replace />;
  }

  return <>{children}</>;
}
