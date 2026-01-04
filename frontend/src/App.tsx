// frontend/src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DeviceProvider } from './contexts/DeviceContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MonitoringPage from './pages/MonitoringPage';
import PredictionPage from './pages/PredictionPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <DeviceProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Dashboard Routes (with Layout) */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <DashboardPage />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/monitoring"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <MonitoringPage />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/prediction"
                element={
                  <PrivateRoute>
                    <DashboardLayout>
                      <PredictionPage />
                    </DashboardLayout>
                  </PrivateRoute>
                }
              />

              {/* Redirect unknown routes to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </DeviceProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;