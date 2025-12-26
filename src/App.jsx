// src/App.jsx
import {React , useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { AnimatePresence, motion } from "framer-motion";

// Pages
import HomePage from "./components/pages/main/HomePage";
import FrontPage from "./components/pages/main/FrontPage";
import LoginPage from "./components/pages/auth/LoginPage";
import RegisterPage from "./components/pages/auth/RegisterPage";

// Page transition variants - Modified for auth pages
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const authPageVariants = {
  initial: { opacity: 1 }, // No initial animation for auth pages
  in: { opacity: 1 },
  out: { opacity: 1 } // No exit animation for auth pages
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

// Modified AnimatedPage to handle auth pages differently
const AnimatedPage = ({ children, isAuthPage = false }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={isAuthPage ? authPageVariants : pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

// Layout wrapper for authenticated routes
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated, loading, authLoading } = useAuth();
  const location = useLocation();

  // Check if current route is an auth page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={
          <AnimatedPage>
            <FrontPage />
          </AnimatedPage>
        } />
        <Route path="/login" element={
          !isAuthenticated ? (
            <AnimatedPage isAuthPage={true}>
              <LoginPage />
            </AnimatedPage>
          ) : <Navigate to="/home" />
        } />
        <Route path="/register" element={
          !isAuthenticated ? (
            <AnimatedPage isAuthPage={true}>
              <RegisterPage />
            </AnimatedPage>
          ) : <Navigate to="/home" />
        } />
        
        {/* Protected routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <AuthenticatedLayout>
              <AnimatedPage>
                <HomePage />
              </AnimatedPage>
            </AuthenticatedLayout>
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/"} />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;