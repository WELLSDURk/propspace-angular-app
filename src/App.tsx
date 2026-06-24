import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Navbar } from './components/Navbar';
import { PropertyList } from './pages/PropertyList';
import { PropertyDetail } from './pages/PropertyDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { MyListings } from './pages/MyListings';
import { PropertyForm } from './pages/PropertyForm';
import { Profile } from './pages/Profile';

// Protected Route Guard (React equivalent of AuthGuard)
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500 font-bold">Verifying authorization clearance...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50/30 flex flex-col text-gray-800 font-sans" id="propspace-app">
          {/* Navigation Bar */}
          <Navbar />

          {/* Main Routing System */}
          <main className="flex-grow">
            <Routes>
              {/* Public Feed Routes */}
              <Route path="/" element={<PropertyList />} />
              <Route path="/properties" element={<PropertyList />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Dashboard/Profile Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-listings" 
                element={
                  <ProtectedRoute>
                    <MyListings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-property" 
                element={
                  <ProtectedRoute>
                    <PropertyForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/edit-property/:id" 
                element={
                  <ProtectedRoute>
                    <PropertyForm />
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

              {/* Catch all fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Humble & Elegant Footer */}
          <footer className="bg-white border-t border-gray-100 py-8" id="main-footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-400">
              <p>© {new Date().getFullYear()} PropSpace Real Estate Listing Platform. All rights reserved.</p>
              <div className="flex gap-4">
                <Link to="/" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
                <span>•</span>
                <Link to="/" className="hover:text-emerald-600 transition-colors">Terms of Service</Link>
                <span>•</span>
                <span className="text-gray-300">Port 3000 Ingress Node</span>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
