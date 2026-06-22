import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Key, Globe, Eye, FileSearch, ArrowRight, Calendar, AlertTriangle } from 'lucide-react';
import TerminalConsole from '../components/TerminalConsole';
import CodeRain from '../components/CodeRain';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user } = useAuth();

  const categories = [
    {
      title: 'Cryptography',
      desc: 'Crack substituted ciphers, analyze encoding formats, and decode secret payloads.',
      icon: Key,
      color: 'text-cyber-green',
      border: 'border-cyber-green/20 hover:border-cyber-green/50',
      shadow: 'hover:shadow-neon-green'
    },
    {
      title: 'Web Security',
      desc: 'Inspect webpage comments, analyze client configs, and bypass access control gates.',
      icon: Globe,
      color: 'text-cyber-blue',
      border: 'border-cyber-blue/20 hover:border-cyber-blue/50',
      shadow: 'hover:shadow-neon-blue'
    },
    {
      title: 'Forensics',
      desc: 'Recover deleted file artifacts, inspect images, and analyze embedded metadata tags.',
      icon: FileSearch,
      color: 'text-cyber-red',
      border: 'border-cyber-red/20 hover:border-cyber-red/50',
      shadow: 'hover:shadow-neon-red'
    },
    {
      title: 'OSINT',
      desc: 'Collect clues from public archives, search forum entries, and track online tracks.',
      icon: Eye,
      color: 'text-cyber-yellow',
      border: 'border-cyber-yellow/20 hover:border-cyber-yellow/50',
      shadow: 'hover:shadow-[0_0_15px_rgba(255,204,0,0.15)]'
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Code Rain Effect */}
      <CodeRain opacity={0.12} />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-12 text-center md:px-6 md:pt-24">
        <div className="mx-auto max-w-3xl flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyber-green/20 bg-cyber-green/5 text-cyber-green text-xs font-mono mb-6 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse-fast"></span>
            Live Cyber Training sandbox
          </div>
          
          <h1 className="font-mono text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            CYBERQUEST <span className="text-cyber-green shadow-neon-green">CTF</span>
          </h1>
          
          <p className="mt-6 text-base md:text-lg text-zinc-400 font-sans max-w-xl">
            A beginner-friendly Capture The Flag sandbox. Crack hashes, inspect server files, unlock clues, and earn ranking badges directly in your browser.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
            {user ? (
              <Link 
                to="/dashboard" 
                className="flex-1 py-3 px-6 rounded font-mono font-bold text-center text-white cyber-button flex items-center justify-center gap-2"
              >
                ENTER DASHBOARD <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="flex-1 py-3 px-6 rounded font-mono font-bold text-center text-white cyber-button flex items-center justify-center gap-2"
                >
                  START COMPETING <ArrowRight className="h-4 w-4" />
                </Link>
                <Link 
                  to="/learning" 
                  className="flex-1 py-3 px-6 rounded font-mono font-bold text-center border border-zinc-700 hover:border-cyber-green text-zinc-300 hover:text-white transition-colors"
                >
                  LEARN ROADMAPS
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Terminal Widget Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 flex justify-center md:px-6 z-10 relative">
        <TerminalConsole />
      </section>

      {/* What is CTF? */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="cyber-panel p-8 rounded-lg">
            <h2 className="font-mono text-2xl text-cyber-green font-bold mb-4">[// ABOUT_THE_WARFARE]</h2>
            <h3 className="text-xl font-bold text-white mb-3">What is Capture The Flag?</h3>
            <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
              Capture The Flag (CTF) is an educational cybersecurity tournament. Students are tasked with solving technical puzzles across security domains to uncover a hidden code called a <strong>flag</strong>.
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Submit flags to earn points and climb the rankings. Learn to think like a security engineer or forensic investigator using built-in interactive tools and sandboxed simulations.
            </p>
            
            <div className="mt-6 p-4 rounded border border-cyber-green/10 bg-cyber-green/5 flex gap-3">
              <Shield className="h-6 w-6 text-cyber-green shrink-0 mt-0.5" />
              <div className="text-xs font-mono text-zinc-400">
                <strong className="text-white">Flag structure:</strong> cyberquest&#123;text_here&#125;<br/>
                Example: cyberquest&#123;caesar_cipher_is_classic&#125;
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="font-mono text-2xl text-white font-bold">[// TARGET_SECTORS]</h2>
            <p className="text-zinc-400 text-sm">
              CyberQuest CTF focuses on beginner-friendly exercises, helping college students explore the basics without complex local setups.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div key={idx} className={`cyber-panel p-5 rounded-lg border ${cat.border} ${cat.shadow} transition-all duration-300`}>
                    <Icon className={`h-6 w-6 ${cat.color} mb-3`} />
                    <h4 className="font-mono font-bold text-white mb-2">{cat.title}</h4>
                    <p className="text-zinc-500 text-xs leading-relaxed">{cat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Rules and Schedule */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 relative z-10 border-t border-zinc-900 bg-cyber-darkest/40">
        <div className="grid md:grid-cols-2 gap-12">
          
          {/* Rules */}
          <div className="space-y-6">
            <h2 className="font-mono text-2xl text-cyber-red font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" /> RULES_OF_ENGAGEMENT
            </h2>
            <ul className="space-y-3 font-mono text-sm text-zinc-400">
              <li className="flex gap-2">
                <span className="text-cyber-red">1.</span>
                No Denial of Service (DoS) attacks on the website or APIs.
              </li>
              <li className="flex gap-2">
                <span className="text-cyber-red">2.</span>
                Do not share flags, answers, or solution steps on community groups.
              </li>
              <li className="flex gap-2">
                <span className="text-cyber-red">3.</span>
                Unlocking hints incurs a penalty based on challenge weight.
              </li>
              <li className="flex gap-2">
                <span className="text-cyber-red">4.</span>
                Colluding with other contestants will result in immediate rank bans.
              </li>
            </ul>
          </div>

          {/* Schedule */}
          <div className="space-y-6">
            <h2 className="font-mono text-2xl text-cyber-blue font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6" /> EVENT_SCHEDULE
            </h2>
            <div className="border-l border-cyber-blue/30 ml-3 pl-6 space-y-6 font-mono text-sm text-zinc-400">
              <div className="relative">
                <span className="absolute -left-9 top-1.5 w-3 h-3 rounded-full bg-cyber-blue shadow-neon-blue"></span>
                <strong className="text-white font-bold block">Registration Phase</strong>
                <span>Open for all college students using roll numbers and college emails.</span>
              </div>
              <div className="relative">
                <span className="absolute -left-9 top-1.5 w-3 h-3 rounded-full bg-zinc-700"></span>
                <strong className="text-white font-bold block">Qualifiers Kickoff</strong>
                <span>5 Beginner challenges live. Duration is 48 hours.</span>
              </div>
              <div className="relative">
                <span className="absolute -left-9 top-1.5 w-3 h-3 rounded-full bg-zinc-700"></span>
                <strong className="text-white font-bold block">Scoreboard Lock & Audit</strong>
                <span>CSV submissions analysis and validation checks.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-cyber-darkest border-t border-zinc-900 py-8 text-center text-xs font-mono text-zinc-600 relative z-10">
        <p>© {new Date().getFullYear()} CyberQuest College Club. All rights reserved.</p>
        <p className="mt-2 text-zinc-700">Built for security training. Do not execute unauthorized exploits.</p>
      </footer>
    </div>
  );
};

export default Landing;
