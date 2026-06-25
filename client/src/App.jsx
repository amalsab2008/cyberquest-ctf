import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Import Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Challenges from './pages/Challenges';
import Leaderboard from './pages/Leaderboard';
import Learning from './pages/Learning';
import Profile from './pages/Profile';
import Certificate from './pages/Certificate';
import Admin from './pages/Admin';

// Protected Route Guard (Must be logged in)
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-darkest text-white flex items-center justify-center font-mono">
        Decrypting secure session credentials...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Guard (Must be logged in as admin)
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-darkest text-white flex items-center justify-center font-mono">
        Authenticating administrative tokens...
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  const [crtEnabled, setCrtEnabled] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col bg-cyber-darkest text-gray-200 selection:bg-cyber-green selection:text-black ${
      crtEnabled ? 'crt-overlay' : ''
    }`}>
      
      {/* Navigation */}
      <Navbar />

      {/* Main Content Router */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/challenges" element={
            <ProtectedRoute>
              <Challenges />
            </ProtectedRoute>
          } />
          
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } />
          
          <Route path="/learning" element={<Learning />} />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/certificate" element={
            <ProtectedRoute>
              <Certificate />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />

          {/* Catch all redirecting to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Retro Toggle Panel */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setCrtEnabled(!crtEnabled)}
          className={`px-3 py-1.5 rounded font-mono text-[10px] font-bold border transition-all shadow-md ${
            crtEnabled
              ? 'border-cyber-green text-cyber-green bg-cyber-green/5 shadow-neon-green'
              : 'border-zinc-800 text-zinc-500 bg-zinc-950/60 hover:text-zinc-300'
          }`}
        >
          CRT_MONITOR: {crtEnabled ? 'ACTIVE' : 'BYPASS'}
        </button>
      </div>

    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
