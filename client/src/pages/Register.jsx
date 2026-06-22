import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Mail, User, School, Hash, ArrowRight, AlertCircle } from 'lucide-react';
import CodeRain from '../components/CodeRain';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await register(name, email, password, rollNumber, collegeName);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed. Check parameters.');
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
          <div className="text-center mb-6">
            <Shield className="h-10 w-10 text-cyber-green mx-auto mb-3 shadow-neon-green" />
            <h2 className="font-mono text-2xl font-bold text-white tracking-widest uppercase">REG_NODE</h2>
            <p className="text-zinc-500 font-mono text-xs mt-1">PROVISION NEW CTF PARTICIPANT</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded bg-cyber-red/10 border border-cyber-red/30 flex gap-3 text-cyber-red font-mono text-xs items-center">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-sm">
            <div>
              <label className="block text-zinc-400 font-bold mb-1">FULL_NAME</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alice Smith"
                  className="w-full pl-10 pr-4 py-2 rounded bg-black/60 border border-zinc-700 text-white focus:border-cyber-green focus:ring-1 focus:ring-cyber-green focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1">COLLEGE_EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alice@college.edu"
                  className="w-full pl-10 pr-4 py-2 rounded bg-black/60 border border-zinc-700 text-white focus:border-cyber-green focus:ring-1 focus:ring-cyber-green focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 font-bold mb-1">ROLL_NO</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input 
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="CS-2401"
                    className="w-full pl-10 pr-4 py-2 rounded bg-black/60 border border-zinc-700 text-white focus:border-cyber-green focus:ring-1 focus:ring-cyber-green focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-zinc-400 font-bold mb-1">COLLEGE</label>
                <div className="relative">
                  <School className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input 
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="MIT"
                    className="w-full pl-10 pr-4 py-2 rounded bg-black/60 border border-zinc-700 text-white focus:border-cyber-green focus:ring-1 focus:ring-cyber-green focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1">CREATE_PASSWORD</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2 rounded bg-black/60 border border-zinc-700 text-white focus:border-cyber-green focus:ring-1 focus:ring-cyber-green focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded cyber-button font-bold text-white flex items-center justify-center gap-2 mt-4 uppercase"
            >
              {isSubmitting ? 'ENROLLING...' : 'REGISTER NODE'} 
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Prompt */}
          <div className="mt-6 text-center font-mono text-xs text-zinc-500 border-t border-zinc-800/60 pt-4">
            Existing context established?{' '}
            <Link to="/login" className="text-cyber-green hover:underline">
              ESTABLISH_SESSION
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
