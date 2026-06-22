import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Shield, Trophy, Award, Clock, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';

// Dynamic icon loader for badges
const BadgeIcon = ({ iconName, className }) => {
  const IconComponent = Icons[iconName] || Icons.Award;
  return <IconComponent className={className} />;
};

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [timeLeft, setTimeLeft] = useState('');
  const [timelineLogs, setTimelineLogs] = useState([]);

  // Auto-refresh stats
  useEffect(() => {
    refreshUser();
  }, []);

  // Timer: 24-hour countdown from registration or persistent in localStorage
  useEffect(() => {
    if (!user) return;

    // We can define a 24h timer from registration, or default to 24h from now.
    const regDate = user.created_at ? new Date(user.created_at) : new Date();
    const targetDate = new Date(regDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours later

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft('COMPETITION ENDED');
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const format = (num) => String(num).padStart(2, '0');
      setTimeLeft(`${format(hrs)}:${format(mins)}:${format(secs)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Construct audit logs from solves
  useEffect(() => {
    if (!user || !user.solves) return;

    const logs = [];
    // User creation log
    logs.push({
      time: user.created_at ? new Date(user.created_at) : new Date(),
      text: `[SYS] Session initialized for node "${user.name}" (${user.roll_number})`,
      color: 'text-zinc-500'
    });

    // Solves logs
    user.solves.forEach(solve => {
      logs.push({
        time: new Date(solve.created_at),
        text: `[SOLVE] Decrypted challenge "${solve.title}" (+${solve.points_awarded} PTS)`,
        color: 'text-cyber-green'
      });
    });

    // Badges logs
    if (user.badges) {
      user.badges.forEach((b, idx) => {
        // Mock a timestamp slightly after registration or solves
        logs.push({
          time: new Date(new Date(user.created_at).getTime() + (idx + 1) * 30 * 60 * 1000),
          text: `[BADGE] Awarded achievement: "${b.name}"`,
          color: 'text-cyber-blue'
        });
      });
    }

    // Sort chronologically, newest first
    logs.sort((a, b) => b.time - a.time);
    setTimelineLogs(logs);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-cyber-darkest text-white flex items-center justify-center font-mono">
        Loading secure user context...
      </div>
    );
  }

  // Calculate solves progress
  const totalChallenges = 5; // Built-in default
  const solvedCount = user.solves ? user.solves.length : 0;
  const progressPercent = Math.min(100, Math.round((solvedCount / totalChallenges) * 100));

  // Generate ASCII progress bar
  const barLength = 20;
  const filledCount = Math.round((solvedCount / totalChallenges) * barLength);
  const emptyCount = barLength - filledCount;
  const progressBarAscii = `[${'#'.repeat(filledCount)}${'.'.repeat(emptyCount)}] ${progressPercent}%`;

  // Standard Badge Catalog (with locked display)
  const defaultBadgeList = [
    { id: 'badge-first-blood', name: 'First Blood', desc: 'Solve first challenge', icon: 'Zap' },
    { id: 'badge-crypto-master', name: 'Crypto Master', desc: 'Complete all Crypto tasks', icon: 'Key' },
    { id: 'badge-web-hacker', name: 'Web Hacker', desc: 'Complete all Web Security tasks', icon: 'Globe' },
    { id: 'badge-elite-hacker', name: 'Elite Hacker', desc: 'Reach a score of 300 points', icon: 'Award' }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border border-cyber-green/10 bg-cyber-green/5 p-6 rounded-lg font-mono">
        <div>
          <div className="text-zinc-500 text-xs">ROOT@CYBERQUEST:~$ whoami</div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Welcome, <span className="text-cyber-green">{user.name}</span>
          </h1>
          <div className="text-zinc-400 text-xs mt-1">
            Node Identity: {user.roll_number} | College: {user.college_name}
          </div>
        </div>

        {/* Timer Widget */}
        <div className="flex items-center gap-3 bg-black/60 px-4 py-3 rounded border border-zinc-800">
          <Clock className="h-5 w-5 text-cyber-blue shadow-neon-blue shrink-0" />
          <div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">QUALIFIER_TIMER</div>
            <div className="text-xl font-bold text-cyber-blue font-mono tracking-wider">{timeLeft}</div>
          </div>
        </div>
      </div>

      {/* Grid statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Score Card */}
        <div className="cyber-panel p-6 rounded-lg border border-cyber-green/20">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-zinc-400 text-xs tracking-wider">SECURE_SCORE</span>
            <Trophy className="h-5 w-5 text-cyber-green shadow-neon-green" />
          </div>
          <div className="font-mono text-3xl font-bold text-cyber-green">{user.score} PTS</div>
          <div className="font-mono text-zinc-500 text-xs mt-2">TOTAL CREDITS EARNED</div>
        </div>

        {/* Rank Card */}
        <div className="cyber-panel p-6 rounded-lg border border-cyber-blue/20">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-zinc-400 text-xs tracking-wider">LOCAL_RANK</span>
            <Shield className="h-5 w-5 text-cyber-blue shadow-neon-blue" />
          </div>
          <div className="font-mono text-3xl font-bold text-cyber-blue">#{user.rank || 'N/A'}</div>
          <div className="font-mono text-zinc-500 text-xs mt-2">RANKING BREAKOUT ON SCORES</div>
        </div>

        {/* Progress Card */}
        <div className="cyber-panel p-6 rounded-lg border border-cyber-yellow/20 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-zinc-400 text-xs tracking-wider">SOLVES_COMPLETED</span>
            <Award className="h-5 w-5 text-cyber-yellow" />
          </div>
          <div className="font-mono text-lg font-bold text-cyber-yellow">{progressBarAscii}</div>
          <div className="font-mono text-zinc-500 text-xs mt-4">
            {solvedCount} OF {totalChallenges} TARGETS COMPROMISED
          </div>
        </div>

      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left / Center Grid - Console and Challenge List */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Timeline Audit Logs Terminal */}
          <div className="cyber-panel p-5 rounded-lg border border-zinc-800">
            <h2 className="font-mono text-sm text-white font-bold border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-cyber-green" /> SESSION_AUDIT_LOGS
            </h2>
            
            <div className="mt-4 font-mono text-[11px] md:text-xs h-64 overflow-y-auto space-y-2 bg-black/40 p-4 rounded border border-zinc-800/50">
              {timelineLogs.map((log, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                  <span className="text-zinc-600">[{new Date(log.time).toLocaleTimeString()}]</span>
                  <span className={log.color}>{log.text}</span>
                </div>
              ))}
              {timelineLogs.length === 0 && (
                <div className="text-zinc-600">No active events logged in session logs.</div>
              )}
            </div>
          </div>

          {/* Quick Start challenges panel */}
          <div className="cyber-panel p-6 rounded-lg border border-zinc-800 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-mono text-md text-white font-bold">READY TO COMMENCE EXPLOITS?</h3>
              <p className="text-zinc-400 text-xs">Dive into the active challenge grid. Hints available for beginners.</p>
            </div>
            <Link 
              to="/challenges"
              className="py-2.5 px-4 font-mono text-xs font-bold text-white cyber-button flex items-center gap-1.5 shrink-0"
            >
              LAUNCH INTERFACE <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>

        {/* Right Grid - Badges */}
        <div className="space-y-8">
          <div className="cyber-panel p-5 rounded-lg border border-zinc-800">
            <h2 className="font-mono text-sm text-white font-bold border-b border-zinc-800 pb-3">
              ACHIEVEMENT_BADGES
            </h2>
            
            <div className="mt-4 space-y-4 font-mono text-xs">
              {defaultBadgeList.map((badge, idx) => {
                // Check if user has this badge
                const hasBadge = user.badges && user.badges.some(b => b.id === badge.id);

                return (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-4 p-3 rounded border transition-colors ${
                      hasBadge 
                        ? 'border-cyber-green/20 bg-cyber-green/5 text-white' 
                        : 'border-zinc-800/80 bg-zinc-950/20 text-zinc-500'
                    }`}
                  >
                    <div className={`p-2 rounded ${
                      hasBadge ? 'bg-cyber-green/10 text-cyber-green' : 'bg-zinc-900 text-zinc-600'
                    }`}>
                      {hasBadge ? (
                        <BadgeIcon iconName={badge.icon} className="h-5 w-5" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${hasBadge ? 'text-white' : 'text-zinc-500'}`}>
                          {badge.name}
                        </span>
                        {hasBadge && (
                          <span className="text-[10px] text-cyber-green bg-cyber-green/15 px-2 py-0.5 rounded uppercase font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
