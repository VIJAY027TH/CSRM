import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Public Pages
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';

// User Pages
import { Dashboard } from '../pages/user/Dashboard';
import { Resources } from '../pages/user/Resources';
import { BookingCalendar } from '../pages/user/BookingCalendar';
import { MyBookings } from '../pages/user/MyBookings';
import { Notifications } from '../pages/user/Notifications';
import { Profile } from '../pages/user/Profile';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserManagement } from '../pages/admin/UserManagement';
import { ResourceManagement } from '../pages/admin/ResourceManagement';
import { BookingManagement } from '../pages/admin/BookingManagement';
import { Reports } from '../pages/admin/Reports';
import { AuditLogs } from '../pages/admin/AuditLogs';

export const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : user?.role === 'ADMIN' ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />

      {/* Public Authentication */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
          ) : (
            <Register />
          )
        }
      />

      {/* Student / Faculty Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'ADMIN']}>
            <Resources />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'ADMIN']}>
            <BookingCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY', 'ADMIN']}>
            <MyBookings />
          </ProtectedRoute>
        }
      />

      {/* Shared Authenticated Routes */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Admin Dedicated Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/resources"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ResourceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <BookingManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AuditLogs />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
