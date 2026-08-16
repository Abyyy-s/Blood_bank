import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { LandingPage } from './features/landing';
import { DonorDirectory } from './features/donors';
import { BloodRequestPortal } from './features/requests';
import { DashboardPage } from './features/dashboard';
import { AuthPage } from './features/auth';

export default function App() {
  return (
    <Routes>
      {/* Public / Core Landing Page */}
      <Route
        path="/"
        element={
          <Layout>
            <LandingPage />
          </Layout>
        }
      />

      {/* Donor Directory & Search */}
      <Route
        path="/donors"
        element={
          <Layout>
            <DonorDirectory />
          </Layout>
        }
      />

      {/* Blood Request Portal & Triage */}
      <Route
        path="/requests"
        element={
          <Layout>
            <BloodRequestPortal />
          </Layout>
        }
      />

      {/* Operations Dashboard */}
      <Route
        path="/dashboard"
        element={
          <Layout>
            <DashboardPage />
          </Layout>
        }
      />

      {/* Auth & Split-Screen Login Portal */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/auth" element={<Navigate to="/login" replace />} />

      {/* Legacy Flask Role Dashboard Route Aliases */}
      <Route path="/admin-dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/staff-dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/hospital-dashboard" element={<Navigate to="/dashboard" replace />} />

      {/* Fallback Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
