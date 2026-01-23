// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import LibrarianDashboard from './pages/Librarian/Dashboard';
import StudentDashboard from './pages/Student/Dashboard';
import Profile from './pages/Profile/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #1e3a8a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Verifying access permissions...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'librarian':
        return <Navigate to="/librarian/dashboard" />;
      case 'student':
        return <Navigate to="/student/dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};

// Unauthorized Page Component
const UnauthorizedPage = () => {
  const { user, logout } = useAuth();

  const handleGoToDashboard = () => {
    switch (user?.role) {
      case 'admin':
        window.location.href = '/admin/dashboard';
        break;
      case 'librarian':
        window.location.href = '/librarian/dashboard';
        break;
      case 'student':
        window.location.href = '/student/dashboard';
        break;
      default:
        window.location.href = '/';
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        background: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⚠️</div>
        <h1 style={{ color: '#dc2626', fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
          Access Denied
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem', lineHeight: '1.5' }}>
          You don't have permission to access this page.
        </p>
        <p style={{ color: '#6b7280', marginBottom: '2rem', lineHeight: '1.5' }}>
          Your role: <strong style={{ color: '#1e293b' }}>{user?.role}</strong> does not have access to this section.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleGoToDashboard}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go to My Dashboard
          </button>
          <button
            onClick={logout}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Admin Routes - Strict Access */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Librarian Routes - Strict Access */}
            <Route
              path="/librarian/dashboard"
              element={
                <ProtectedRoute allowedRoles={['librarian']}>
                  <LibrarianDashboard />
                </ProtectedRoute>
              }
            />

            {/* Student Routes - Strict Access */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
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

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;