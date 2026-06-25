import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Trophy, Terminal, BookOpen, User, Settings, LogOut, Award } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyber-green/10 bg-cyber-darkest/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold font-mono tracking-widest text-cyber-green">
          <Shield className="h-6 w-6 text-cyber-green shadow-neon-green" />
          <span className="hidden sm:inline">CYBERQUEST</span><span className="text-white">CTF</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 md:gap-4">
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-mono transition-colors ${
                  isActive('/dashboard') ? 'text-cyber-green bg-cyber-green/10' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Terminal className="h-4 w-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>

              <Link 
                to="/challenges" 
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-mono transition-colors ${
                  isActive('/challenges') ? 'text-cyber-green bg-cyber-green/10' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Challenges</span>
              </Link>

              <Link 
                to="/leaderboard" 
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-mono transition-colors ${
                  isActive('/leaderboard') ? 'text-cyber-green bg-cyber-green/10' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span className="hidden md:inline">Scoreboard</span>
              </Link>

              <Link 
                to="/learning" 
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-mono transition-colors ${
                  isActive('/learning') ? 'text-cyber-green bg-cyber-green/10' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden md:inline">Learning</span>
              </Link>

              <Link 
                to="/certificate" 
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-mono transition-colors ${
                  isActive('/certificate') ? 'text-cyber-green bg-cyber-green/10' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Award className="h-4 w-4" />
                <span className="hidden md:inline">Certificate</span>
              </Link>

              <Link 
                to="/profile" 
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-mono transition-colors ${
                  isActive('/profile') ? 'text-cyber-green bg-cyber-green/10' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Profile</span>
              </Link>

              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={`flex items-center gap-1 px-3 py-2 rounded text-sm font-mono transition-colors ${
                    isActive('/admin') ? 'text-cyber-blue bg-cyber-blue/10' : 'text-zinc-400 hover:text-white hover:text-cyber-blue'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden md:inline">Admin</span>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link 
                to="/" 
                className={`px-3 py-2 rounded text-sm font-mono transition-colors ${
                  isActive('/') ? 'text-cyber-green' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/learning" 
                className={`px-3 py-2 rounded text-sm font-mono transition-colors ${
                  isActive('/learning') ? 'text-cyber-green' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Learning
              </Link>
            </>
          )}
        </nav>

        {/* User Stats / Login Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Score widget */}
              <div className="hidden sm:flex flex-col text-right font-mono text-xs">
                <span className="text-cyber-green font-semibold">{user.score} PTS</span>
                <span className="text-zinc-500">Rank #{user.rank || 'N/A'}</span>
              </div>
              
              {/* Logout button */}
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center p-2 rounded text-zinc-500 hover:text-cyber-red hover:bg-cyber-red/10 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login"
                className="px-4 py-1.5 rounded text-sm font-mono border border-zinc-700 text-zinc-300 hover:border-cyber-green hover:text-cyber-green transition-colors"
              >
                LOGIN
              </Link>
              <Link 
                to="/register"
                className="px-4 py-1.5 rounded text-sm font-mono cyber-button text-white text-xs font-bold"
              >
                REGISTER
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
