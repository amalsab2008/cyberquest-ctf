import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, RefreshCw, Medal, Calendar, Search } from 'lucide-react';

const Leaderboard = () => {
  const { user } = useAuth();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setStandings(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 10000); // Auto-refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const formatSolveTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    const date = new Date(timeStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4.5 w-4.5 text-cyber-yellow drop-shadow-[0_0_5px_rgba(255,204,0,0.5)] inline" />;
      case 2:
        return <Medal className="h-4.5 w-4.5 text-zinc-300 inline" />;
      case 3:
        return <Medal className="h-4.5 w-4.5 text-amber-600 inline" />;
      default:
        return <span className="font-mono text-zinc-500 font-bold">#{rank}</span>;
    }
  };

  // Filter standings based on search query
  const filteredStandings = standings.filter(entry => 
    entry.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    entry.college_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 border-b border-zinc-900 pb-6 font-mono">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Trophy className="h-6 w-6 text-cyber-yellow" /> LIVE_SCOREBOARD
          </h1>
          <p className="text-zinc-500 text-xs mt-1">REAL-TIME CONTESTANT CLASSIFICATIONS AND METRICS</p>
        </div>

        {/* Toolbar */}
        <div className="flex gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search hacker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded bg-black/40 border border-zinc-800 text-sm text-white focus:border-cyber-green focus:outline-none"
            />
          </div>

          <button
            onClick={fetchLeaderboard}
            disabled={isRefreshing}
            className="p-2.5 rounded border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/50 transition-all shrink-0"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-cyber-green' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="font-mono text-center py-20 text-zinc-400">Restructuring scoreboard standings network...</div>
      ) : (
        <div className="cyber-panel rounded-lg border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono border-collapse">
              <thead>
                <tr className="bg-black/50 text-[10px] text-zinc-500 border-b border-zinc-800 uppercase tracking-wider">
                  <th className="px-6 py-4 text-center">Rank</th>
                  <th className="px-6 py-4">Contestant</th>
                  <th className="px-6 py-4">College Entity</th>
                  <th className="px-6 py-4 text-center">Solved</th>
                  <th className="px-6 py-4 text-right">Last solve</th>
                  <th className="px-6 py-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/80 text-xs md:text-sm text-zinc-300">
                {filteredStandings.map((entry) => {
                  const isSelf = user && entry.id === user.id;

                  return (
                    <tr 
                      key={entry.id}
                      className={`transition-colors ${
                        isSelf 
                          ? 'bg-cyber-green/[0.04] hover:bg-cyber-green/[0.08] text-white border-y border-cyber-green/20' 
                          : 'hover:bg-zinc-900/35'
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-6 py-4 text-center">
                        {getRankBadge(entry.rank)}
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="font-bold flex items-center gap-2">
                          <span className={isSelf ? 'text-cyber-green' : 'text-zinc-100'}>
                            {entry.name}
                          </span>
                          {isSelf && (
                            <span className="text-[9px] bg-cyber-green/15 text-cyber-green border border-cyber-green/20 px-1.5 py-0.5 rounded font-mono font-semibold uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{entry.roll_number}</div>
                      </td>

                      {/* College */}
                      <td className="px-6 py-4 text-zinc-400">
                        {entry.college_name}
                      </td>

                      {/* Solved count */}
                      <td className="px-6 py-4 text-center text-zinc-400">
                        {entry.solved_count} / 5
                      </td>

                      {/* Last Solve */}
                      <td className="px-6 py-4 text-right text-zinc-500 text-[11px]">
                        <span className="flex items-center justify-end gap-1.5">
                          <Calendar className="h-3 w-3 inline text-zinc-600" /> {formatSolveTime(entry.last_solve_time)}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="px-6 py-4 text-right font-bold text-cyber-green text-sm md:text-md">
                        {entry.score} PTS
                      </td>
                    </tr>
                  );
                })}

                {filteredStandings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-zinc-600 text-xs">
                      NO CONTESTANTS IDENTIFIED.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Leaderboard;
