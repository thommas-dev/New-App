import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Pricing from './components/Pricing';
import PaymentSuccess from './components/PaymentSuccess';
import '@/App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios interceptor for auth
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Handle trial expired or access denied
      if (error.response?.data?.detail?.includes('trial has expired') || 
          error.response?.data?.detail?.includes('Access denied')) {
        toast.error('Your trial has expired. Please subscribe to continue.');
        window.location.href = '/pricing';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    toast.success(`Welcome back, ${userData.username}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              !user ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/pricing" 
            element={
              user ? (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                  <Pricing />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/payment-success" 
            element={
              user ? (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                  <PaymentSuccess />
                </div>
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/*" 
            element={
              user ? (
                <Dashboard user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
