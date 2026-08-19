import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function PrivateRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}