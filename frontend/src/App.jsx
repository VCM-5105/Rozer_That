import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GuestGuardProvider } from './context/GuestGuardContext';

import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import GuestGuardModal from './components/common/GuestGuardModal';
import SearchModal from './components/common/SearchModal';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Sheets from './pages/Sheets';
import SheetDetail from './pages/SheetDetail';
import Notifications from './pages/Notifications';
import PYQs from './pages/PYQs';
import CurrentAffairs from './pages/CurrentAffairs';
import Quizzes from './pages/Quizzes';
import MockTests from './pages/MockTests';
import AdminDashboard from './pages/AdminDashboard';


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="py-16 text-center">Verifying Cadet Identity...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};


const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="py-16 text-center">Verifying Admin Privileges...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const AppContent = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <GuestGuardModal />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<Home onOpenSearch={() => setSearchOpen(true)} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/sheets" element={<Sheets />} />
            <Route path="/sheets/:slug" element={<SheetDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/pyqs" element={<PYQs />} />
            <Route path="/current-affairs" element={<CurrentAffairs />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/mocktests" element={<MockTests />} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <GuestGuardProvider>
            <AppContent />
          </GuestGuardProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
