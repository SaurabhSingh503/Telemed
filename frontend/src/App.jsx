/* eslint-disable */
// Main App component with routing and layout
// Manages application routes and navigation
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './context/AuthContext';

// Import components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import PatientDashboard from './components/Dashboard/PatientDashboard';
import DoctorDashboard from './components/Dashboard/DoctorDashboard';
import JitsiMeeting from './components/VideoCall/JitsiMeeting';
import SymptomChecker from './components/SymptomChecker/SymptomChecker';
import DoctorVerificationForm from './components/Doctor/DoctorVerificationForm';
import Navbar from './components/Layout/Navbar';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import PharmacyFinder from './components/Pharmacy/PharmacyFinder';
<Route path="/pharmacies" element={
  <ProtectedRoute>
    <PharmacyFinder />
  </ProtectedRoute>
} />
import PharmacyTest from './components/Debug/PharmacyTest';

<Route path="/test-pharmacy" element={<PharmacyTest />} />
function App() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <Box>
        {/* Show navbar only for authenticated users */}
        {user && <Navbar />}
        
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/dashboard" />} 
          />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {user?.role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />}
            </ProtectedRoute>
          } />
          
          <Route path="/video-call/:roomId" element={
            <ProtectedRoute>
              <JitsiMeeting />
            </ProtectedRoute>
          } />

          <Route path="/symptom-checker" element={
            <ProtectedRoute>
              <SymptomChecker />
            </ProtectedRoute>
          } />

          {/* Doctor verification route */}
          <Route path="/doctor-verification" element={
            <ProtectedRoute>
              <DoctorVerificationForm />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </Box>
    </ErrorBoundary>
  );
}

export default App;
