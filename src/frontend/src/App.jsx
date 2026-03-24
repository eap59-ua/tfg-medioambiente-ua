import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';

// Lazy-loaded Pages para Code Splitting (Optimización de Rendimiento)
const HomePage = lazy(() => import('./pages/HomePage'));
const IncidentDetailPage = lazy(() => import('./pages/IncidentDetailPage'));
const CreateIncidentPage = lazy(() => import('./pages/CreateIncidentPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const MyIncidentsPage = lazy(() => import('./pages/MyIncidentsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminIncidentsPage = lazy(() => import('./pages/AdminIncidentsPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminEntitiesPage = lazy(() => import('./pages/AdminEntitiesPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const EntityDashboardPage = lazy(() => import('./pages/EntityDashboardPage'));

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

// Fallback de carga (Skeleton UI general)
const PageLoader = () => (
  <div className="flex h-[calc(100vh-200px)] items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
  </div>
);

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
