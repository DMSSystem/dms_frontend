// frontend/src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

// Pages
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import VerifyOTP from '../components/auth/VerifyOTP';
import AdminDashboard from '../pages/Admin/DashboardPage';
import OfficerDashboard from '../pages/Officer/DashboardPage';
import ParentDashboard from '../pages/Parent/DashboardPage';

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';

const AppRoutes = () => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading system configuration..." />;
  }

  // Role-based dashboard mapping
  const getDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'officer':
        return <OfficerDashboard />;
      case 'parent':
        return <ParentDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" replace />} />
      <Route path="/verify-otp" element={!isAuthenticated ? <VerifyOTP /> : <Navigate to="/dashboard" replace />} />
      
      {/* Protected Layout Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={getDashboard()} />
          
          {/* Admin Role-Specific Views (using dashboards as placeholders) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/users" element={<AdminDashboard />} />
            <Route path="/reports" element={<AdminDashboard />} />
            <Route path="/settings" element={<AdminDashboard />} />
          </Route>

          {/* Officer Role-Specific Views */}
          <Route element={<ProtectedRoute allowedRoles={['officer', 'admin']} />}>
            <Route path="/leaves" element={<OfficerDashboard />} />
            <Route path="/maintenance" element={<OfficerDashboard />} />
            <Route path="/duty" element={<OfficerDashboard />} />
            <Route path="/inspections" element={<OfficerDashboard />} />
          </Route>

          {/* Parent Role-Specific Views */}
          <Route element={<ProtectedRoute allowedRoles={['parent', 'admin']} />}>
            <Route path="/leaves/history" element={<ParentDashboard />} />
            <Route path="/notifications" element={<ParentDashboard />} />
          </Route>
        </Route>
      </Route>
      
      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

export default AppRoutes;