import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import CodeRain from '../components/CodeRain';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Authentication failed. Check your keys.');
      }
    } catch (err) {
      setError('Connection to auth node lost.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center justify-center px-4 py-12">
      <CodeRain opacity={0.1} />

      <div className="w-full max-w-md z-10 relative">
        <div className="cyber-panel p-8 rounded-lg shadow-neon-green border border-cyber-green/20">
          
          {/* Header */}
          <div className="text-center mb-8">
            <Shield className="h-10 w-10 text-cyber-green mx-auto mb-3 shadow-neon-green" />
            <h2 className="font-mono text-2xl font-bold text-white tracking-widest uppercase">AUTH_DECRYPT</h2>
            <p className="text-zinc-500 font-mono text-xs mt-1">ESTABLISH SECURE CONTEXT SESSION</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded bg-cyber-red/10 border border-cyber-red/30 flex gap-3 text-cyber-red font-mono text-xs items-center">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 font-mono text-sm">
            <div>
              <label className="block text-zinc-400 font-bold mb-2">EMAIL_ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded bg-black/60 border border-zinc-700 text-white focus:border-cyber-green focus:ring-1 focus:ring-cyber-green focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-2">ACCESS_KEY (PASSWORD)</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded bg-black/60 border border-zinc-700 text-white focus:border-cyber-green focus:ring-1 focus:ring-cyber-green focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded cyber-button font-bold text-white flex items-center justify-center gap-2 mt-6 uppercase"
            >
              {isSubmitting ? 'CONNECTING...' : 'INITIATE SESSION'} 
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Prompt */}
          <div className="mt-8 text-center font-mono text-xs text-zinc-500 border-t border-zinc-800/60 pt-6">
            New node entry?{' '}
            <Link to="/register" className="text-cyber-green hover:underline">
              REGISTER_PARTICIPANT
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
