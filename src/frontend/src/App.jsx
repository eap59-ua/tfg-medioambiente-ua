import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import CreateIncidentPage from './pages/CreateIncidentPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyIncidentsPage from './pages/MyIncidentsPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminIncidentsPage from './pages/AdminIncidentsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminEntitiesPage from './pages/AdminEntitiesPage';
import NotificationsPage from './pages/NotificationsPage';
import EntityDashboardPage from './pages/EntityDashboardPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return !isAuthenticated ? children : <Navigate to="/" />;
}

function AdminOnlyRoute({ children }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return null;
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';
  return (isAuthenticated && isAdmin) ? children : <Navigate to="/" />;
}

function AdminDashboardRo() {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role === 'entity') return <Navigate to="/admin/entity" />;
  if (user?.role === 'admin' || user?.role === 'moderator') return <AdminDashboardPage />;
  return <Navigate to="/" />;
}

function EntityOrAdminRoute({ children }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return null;
  const isAllowed = user?.role === 'entity' || user?.role === 'admin' || user?.role === 'moderator';
  return (isAuthenticated && isAllowed) ? children : <Navigate to="/" />;
}

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
          <Route path="/incidents/new" element={<ProtectedRoute><CreateIncidentPage /></ProtectedRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
          <Route path="/my-incidents" element={<ProtectedRoute><MyIncidentsPage /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboardRo />} />
          <Route path="/admin/incidents" element={<AdminOnlyRoute><AdminIncidentsPage /></AdminOnlyRoute>} />
          <Route path="/admin/users" element={<AdminOnlyRoute><AdminUsersPage /></AdminOnlyRoute>} />
          <Route path="/admin/entities" element={<AdminOnlyRoute><AdminEntitiesPage /></AdminOnlyRoute>} />
          <Route path="/admin/entity" element={<EntityOrAdminRoute><EntityDashboardPage /></EntityOrAdminRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
