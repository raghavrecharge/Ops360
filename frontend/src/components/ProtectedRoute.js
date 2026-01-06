import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ component: Component, requiredRoles }) => {
  const { isAuthenticated, isAuthorized, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !isAuthorized(requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Component />;
};

export default ProtectedRoute;
