import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (user && !user.approved) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <h1 className="text-4xl font-bold text-yellow-400 mb-4">Pending Approval</h1>
            <p className="text-lg text-muted-foreground">Your account is awaiting approval from an administrator.</p>
            <p className="text-lg text-muted-foreground">Please check back later.</p>
        </div>
    );
  }

  if (user && !allowedRoles.includes(user.role)) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <h1 className="text-4xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-lg text-muted-foreground">You do not have permission to view this page.</p>
        </div>
    );
  }

  return children;
};

export default ProtectedRoute;