import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'viewer';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'viewer' 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          className="glass p-8 rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-foreground">Loading...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Role hierarchy: admin > manager > viewer
  const roleHierarchy = { admin: 3, manager: 2, viewer: 1 };
  const userRole = roleHierarchy[user.role];
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (userRole < requiredRoleLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          className="glass p-8 rounded-lg text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-destructive">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have sufficient permissions to access this area.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};