import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Key, Globe, Eye, FileSearch, HelpCircle, Download, CheckCircle, ExternalLink, Search, Filter, AlertTriangle, ArrowRight, Zap, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

const Challenges = () => {
  const { user, refreshUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  
  // Challenge Modal inputs/state
  const [flagInput, setFlagInput] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null); // { success: bool, text: str }

  // Badge unlock overlay states
  const [badgeQueue, setBadgeQueue] = useState([]);
  const [activeBadge, setActiveBadge] = useState(null);

  // Trigger custom colored confetti on badge change
  useEffect(() => {
    if (activeBadge) {
      let colors = ['#00ff66', '#ffffff'];
      if (activeBadge.icon === 'Zap') colors = ['#ff0055', '#ffcc00', '#ffffff'];
      if (activeBadge.icon === 'Key') colors = ['#00ccff', '#0055ff', '#ffffff'];
      if (activeBadge.icon === 'Globe') colors = ['#00ff66', '#0ea848', '#ffffff'];
      if (activeBadge.icon === 'Award') colors = ['#ffcc00', '#ff8800', '#ffffff'];

      confetti({
        particleCount: 120,
        spread: 70,
        colors: colors,
        origin: { y: 0.5 }
      });
    }
  }, [activeBadge]);

  const handleAcknowledgeBadge = () => {
    const nextQueue = badgeQueue.slice(1);
    setBadgeQueue(nextQueue);
    if (nextQueue.length > 0) {
      setActiveBadge(nextQueue[0]);
    } else {
      setActiveBadge(null);
    }
  };

  const getBadgeStyle = (icon) => {
    switch (icon) {
      case 'Zap': return {
        border: 'border-cyber-red',
        shadow: 'shadow-neon-red',
        text: 'text-cyber-red',
        bg: 'bg-cyber-red/10',
        title: 'FIRST BLOOD SECTOR UNLOCKED'
      };
      case 'Key': return {
        border: 'border-cyber-blue',
        shadow: 'shadow-neon-blue',
        text: 'text-cyber-blue',
        bg: 'bg-cyber-blue/10',
        title: 'CRYPTOGRAPHIC MASTER KEY RECOVERED'
      };
      case 'Globe': return {
        border: 'border-cyber-green',
        shadow: 'shadow-neon-green',
        text: 'text-cyber-green',
        bg: 'bg-cyber-green/10',
        title: 'NETWORK PERIMETER COMPROMISED'
      };
      case 'Award': return {
        border: 'border-cyber-yellow',
        shadow: 'shadow-[0_0_15px_rgba(255,204,0,0.4)]',
        text: 'text-cyber-yellow',
        bg: 'bg-cyber-yellow/10',
        title: 'ELITE SECTOR LEVEL ACCREDITED'
      };
      default: return {
        border: 'border-cyber-green',
        shadow: 'shadow-neon-green',
        text: 'text-cyber-green',
        bg: 'bg-cyber-green/10',
        title: 'NEW ACHIEVEMENT DECRYPTED'
      };
    }
  };

  const categories = ['All', 'Cryptography', 'Web Security', 'Forensics', 'OSINT'];

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/challenges', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setChallenges(data);

        // Update selected challenge if modal is open to refresh hints state
        if (selectedChallenge) {
          const updated = data.find(c => c.id === selectedChallenge.id);
          if (updated) setSelectedChallenge(updated);
        }
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleUnlockHint = async (challengeId, hintId, penalty) => {
    const confirmUnlock = window.confirm(
      `Warning: Unlocking this hint will deduct ${penalty} points from your potential solve score for this challenge. Do you want to proceed?`
    );
    if (!confirmUnlock) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/challenges/${challengeId}/hint/${hintId}/unlock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Hint Unlocked!\n${data.hint_text}`);
        // Re-fetch challenges to update state
        await fetchChallenges();
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to unlock hint.');
      }
    } catch (error) {
      console.error('Error unlocking hint:', error);
    }
  };

  const handleSubmitFlag = async (e, challengeId) => {
    e.preventDefault();
    if (!flagInput.trim()) return;

    setSubmitLoading(true);
    setSubmitMessage(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/challenges/${challengeId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ flag: flagInput })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.correct) {
          setSubmitMessage({ success: true, text: data.message });
          setFlagInput('');
          
          // Queue up any newly earned badges
          if (data.badges && data.badges.length > 0) {
            setBadgeQueue(data.badges);
            setActiveBadge(data.badges[0]);
          } else {
            // General standard solve confetti if no badges earned
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 }
            });
          }

          // Refresh user context and local list
          await refreshUser();
          await fetchChallenges();
        } else {
          setSubmitMessage({ success: false, text: data.message });
        }
      } else {
        setSubmitMessage({ success: false, text: data.message || 'Error submitting flag.' });
      }
    } catch (error) {
      console.error('Error submitting flag:', error);
      setSubmitMessage({ success: false, text: 'Connection to exploit validator node lost.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Cryptography': return Key;
      case 'Web Security': return Globe;
      case 'Forensics': return FileSearch;
      case 'OSINT': return Eye;
      default: return Shield;
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'text-cyber-green bg-cyber-green/10 border-cyber-green/30';
      case 'Medium': return 'text-cyber-yellow bg-cyber-yellow/10 border-cyber-yellow/30';
      case 'Hard': return 'text-cyber-red bg-cyber-red/10 border-cyber-red/30';
      default: return 'text-zinc-400 bg-zinc-800';
    }
  };

  // Filter challenges
  const filteredChallenges = challenges.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Header and Search Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-zinc-900 pb-6 font-mono">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Shield className="h-6 w-6 text-cyber-green shadow-neon-green" /> ACTIVE_SECTOR_GRID
          </h1>
          <p className="text-zinc-500 text-xs mt-1">SELECT CORRUPTION CORE TARGET TO START EXPLOITATION</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded bg-black/40 border border-zinc-800 text-sm text-white focus:border-cyber-green focus:outline-none focus:ring-1 focus:ring-cyber-green"
            />
          </div>

          {/* Category Select */}
          <div className="flex gap-2">
            <Filter className="h-4 w-4 text-zinc-500 mt-2.5 shrink-0 hidden sm:inline" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded bg-black/40 border border-zinc-800 text-sm text-zinc-300 focus:border-cyber-green focus:outline-none"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat} className="bg-cyber-darkest text-white">{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="font-mono text-center py-20 text-zinc-400">Scanning challenges grid networks...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((ch) => {
            const Icon = getCategoryIcon(ch.category);
            return (
              <div 
                key={ch.id} 
                className={`cyber-panel p-6 rounded-lg border transition-all duration-300 flex flex-col justify-between ${
                  ch.is_solved 
                    ? 'border-cyber-green/45 bg-cyber-green/[0.02]' 
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                
                {/* Meta details */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Icon className="h-4 w-4 text-zinc-500" /> {ch.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] uppercase font-semibold ${getDifficultyColor(ch.difficulty)}`}>
                      {ch.difficulty}
                    </span>
                  </div>

                  <h3 className="font-mono text-lg font-bold text-white tracking-wide truncate">
                    {ch.title}
                  </h3>

                  <p className="text-zinc-500 text-xs line-clamp-3 leading-relaxed">
                    {ch.description.replace(/```[\s\S]*?```/g, '').replace(/\[.*?\]\(.*?\)/g, '')}
                  </p>
                </div>

                {/* Score & button */}
                <div className="flex items-center justify-between border-t border-zinc-800/40 mt-6 pt-4">
                  <span className="font-mono text-md font-bold text-cyber-green">
                    {ch.is_solved ? ch.points_awarded : ch.points} PTS
                  </span>

                  <button
                    onClick={() => {
                      setSelectedChallenge(ch);
                      setFlagInput('');
                      setSubmitMessage(null);
                    }}
                    className={`py-1.5 px-4 font-mono text-xs font-bold rounded flex items-center gap-1.5 border transition-all ${
                      ch.is_solved
                        ? 'border-cyber-green/20 text-cyber-green bg-cyber-green/5 hover:bg-cyber-green/10'
                        : 'cyber-button text-white border-cyber-green'
                    }`}
                  >
                    {ch.is_solved ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" /> SOLVED
                      </>
                    ) : (
                      'EXPLORE'
                    )}
                  </button>
                </div>

              </div>
            );
          })}
          
          {filteredChallenges.length === 0 && (
            <div className="col-span-full py-16 text-center text-zinc-600 font-mono text-xs">
              NO ACTIVE VECTORS FOUND FOR QUERY.
            </div>
          )}
        </div>
      )}

      {/* Challenge Overlay Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl cyber-panel border border-zinc-800 rounded-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Title Bar */}
            <div className="bg-zinc-950/80 px-6 py-4 border-b border-zinc-800 flex justify-between items-center font-mono">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyber-green" />
                <span className="text-white font-bold tracking-wider">{selectedChallenge.title}</span>
              </div>
              <button 
                onClick={() => setSelectedChallenge(null)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                [ CLOSE ]
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 font-mono text-sm">
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div className="bg-black/40 p-2.5 rounded border border-zinc-900">
                  <span className="block text-zinc-500 text-[10px] uppercase">Category</span>
                  <span className="font-bold text-zinc-300">{selectedChallenge.category}</span>
                </div>
                <div className="bg-black/40 p-2.5 rounded border border-zinc-900">
                  <span className="block text-zinc-500 text-[10px] uppercase">Difficulty</span>
                  <span className="font-bold text-zinc-300">{selectedChallenge.difficulty}</span>
                </div>
                <div className="bg-black/40 p-2.5 rounded border border-zinc-900">
                  <span className="block text-zinc-500 text-[10px] uppercase">Weight</span>
                  <span className="font-bold text-cyber-green">{selectedChallenge.points} PTS</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 bg-black/25 p-4 rounded border border-zinc-900/60">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-xs">[ DESCRIPTION ]</span>
                  <button
                    onClick={() => {
                      const cleanText = selectedChallenge.description
                        .replace(/\[Launch Simulator Page\]\((.*?)\)/g, '')
                        .replace(/\[Open Social Archive Simulation\]\((.*?)\)/g, '')
                        .replace(/```/g, '')
                        .trim();
                      navigator.clipboard.writeText(cleanText);
                      
                      const btn = document.getElementById('copy-desc-btn');
                      if (btn) {
                        const originalText = btn.innerText;
                        btn.innerText = '[ COPIED! ]';
                        btn.style.color = '#00ff66';
                        setTimeout(() => {
                          btn.innerText = originalText;
                          btn.style.color = '';
                        }, 1500);
                      }
                    }}
                    id="copy-desc-btn"
                    className="text-zinc-500 hover:text-cyber-green text-[10px] font-mono transition-colors"
                  >
                    [ COPY TEXT ]
                  </button>
                </div>
                <p className="text-zinc-300 text-xs md:text-sm whitespace-pre-wrap leading-relaxed select-text">
                  {selectedChallenge.description.replace(/\[Launch Simulator Page\]\((.*?)\)/g, '').replace(/\[Open Social Archive Simulation\]\((.*?)\)/g, '')}
                </p>

                {/* Specific Simulator Buttons parsed from links */}
                {selectedChallenge.description.includes('/simulation/html-comments.html') && (
                  <a 
                    href="/simulation/html-comments.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 transition-colors text-xs font-bold mt-2"
                  >
                    LAUNCH PORTAL SIMULATOR <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {selectedChallenge.description.includes('/simulation/social-feed.html') && (
                  <a 
                    href="/simulation/social-feed.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/10 transition-colors text-xs font-bold mt-2"
                  >
                    OPEN SOCIAL ARCHIVE FEED <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {/* Attachments */}
              {selectedChallenge.files && selectedChallenge.files.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-zinc-500 text-xs">[ ATTACHED_ARTEFACTS ]</span>
                  <div className="space-y-1.5">
                    {selectedChallenge.files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-zinc-800 text-xs text-cyber-blue hover:bg-cyber-blue/5 hover:border-cyber-blue/40 transition-colors"
                        download
                      >
                        <span className="flex items-center gap-2 truncate">
                          <FileSearch className="h-4 w-4 shrink-0" /> {file.name}
                        </span>
                        <span className="flex items-center gap-1 shrink-0 font-bold">
                          DOWNLOAD <Download className="h-3.5 w-3.5" />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Hints */}
              {selectedChallenge.hints && selectedChallenge.hints.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-zinc-500 text-xs">[ SYSTEM_HINTS ]</span>
                  <div className="space-y-2">
                    {selectedChallenge.hints.map((hint, idx) => (
                      <div key={hint.id} className="p-3 rounded bg-zinc-950/40 border border-zinc-900 text-xs">
                        {hint.is_unlocked ? (
                          <div className="space-y-1 text-zinc-300">
                            <span className="text-cyber-green font-bold block">Hint #{idx + 1} (Unlocked):</span>
                            <p>{selectedChallenge.is_solved ? hint.hint_text : hint.hint_text}</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-zinc-500">
                            <span>Hint #{idx + 1} (Locked: -{hint.penalty} points penalty)</span>
                            <button
                              onClick={() => handleUnlockHint(selectedChallenge.id, hint.id, hint.penalty)}
                              className="px-3 py-1 rounded border border-cyber-yellow/30 text-cyber-yellow hover:bg-cyber-yellow/10 transition-colors font-bold text-[10px]"
                            >
                              UNLOCK HINT
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flag submission box */}
              {selectedChallenge.is_solved ? (
                <div className="p-4 rounded border border-cyber-green/20 bg-cyber-green/5 text-cyber-green flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <strong className="block text-white">Challenge fully compromised.</strong>
                    <span className="text-xs">Points credited: +{selectedChallenge.points_awarded} PTS</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={(e) => handleSubmitFlag(e, selectedChallenge.id)} className="space-y-3 pt-4 border-t border-zinc-900">
                  <span className="block text-zinc-400 font-bold text-xs uppercase">SUBMIT_TARGET_FLAG</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      placeholder="cyberquest{your_flag_here}"
                      value={flagInput}
                      onChange={(e) => setFlagInput(e.target.value)}
                      disabled={submitLoading}
                      className="flex-1 px-4 py-2.5 rounded bg-black/60 border border-zinc-700 text-white focus:border-cyber-green focus:outline-none text-xs md:text-sm"
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={submitLoading}
                      className="py-2.5 px-6 rounded cyber-button font-bold text-white flex items-center justify-center gap-1.5 shrink-0 text-xs"
                    >
                      {submitLoading ? 'VERIFYING...' : 'DECRYPT FLAG'} <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {submitMessage && (
                    <div className={`p-3 rounded text-xs border mt-3 font-semibold ${
                      submitMessage.success 
                        ? 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green' 
                        : 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red'
                    }`}>
                      {submitMessage.text}
                    </div>
                  )}
                </form>
              )}

            </div>

          </div>
        </div>
      )}

      {/* Badge Unlock Overlay Modal */}
      {activeBadge && (() => {
        const style = getBadgeStyle(activeBadge.icon);
        const IconComponent = 
          activeBadge.icon === 'Zap' ? Zap : 
          activeBadge.icon === 'Key' ? Key : 
          activeBadge.icon === 'Globe' ? Globe : Award;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 font-mono">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none" />
            
            <div className={`relative max-w-sm w-full bg-cyber-darkest border-2 ${style.border} ${style.shadow} p-8 rounded-lg text-center overflow-hidden flex flex-col items-center gap-6`}>
              <div className="absolute inset-x-0 top-0 h-0.5 bg-white/20 shadow-lg animate-terminal-scan pointer-events-none" />
              
              <div className="space-y-1">
                <span className={`text-[10px] font-bold tracking-widest ${style.text} block uppercase animate-pulse`}>
                  {style.title}
                </span>
                <h2 className="text-white text-lg font-bold tracking-wider uppercase">
                  ACHIEVEMENT UNLOCKED!
                </h2>
              </div>

              <div className={`p-6 rounded-full border-2 ${style.border} ${style.bg} ${style.shadow} relative`}>
                <div className="absolute inset-0 rounded-full border border-white/5 animate-ping" />
                <IconComponent className={`h-12 w-12 ${style.text} filter drop-shadow-md`} />
              </div>

              <div className="space-y-2">
                <div className="text-xl font-bold text-white tracking-wider">{activeBadge.name}</div>
                <p className="text-zinc-400 text-xs px-2 leading-relaxed">
                  {activeBadge.description}
                </p>
              </div>

              <button
                onClick={handleAcknowledgeBadge}
                className={`w-full py-2.5 rounded border-2 ${style.border} ${style.text} ${style.bg} hover:bg-white/5 font-bold transition-all text-xs tracking-widest uppercase mt-2`}
              >
                CLAIM CREDITS & CLOSE
              </button>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default Challenges;
