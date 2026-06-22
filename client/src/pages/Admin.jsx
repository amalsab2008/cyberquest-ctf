import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Shield, Plus, Edit2, Trash2, FileText, Users, Download, AlertCircle, Save, CheckCircle } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  
  // Tabs: challenges, logs, participants
  const [activeTab, setActiveTab] = useState('challenges');
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(100);
  const [category, setCategory] = useState('Cryptography');
  const [difficulty, setDifficulty] = useState('Easy');
  const [flag, setFlag] = useState('');
  
  // Hint form states (2 hints supported)
  const [hint1Text, setHint1Text] = useState('');
  const [hint1Penalty, setHint1Penalty] = useState(20);
  const [hint2Text, setHint2Text] = useState('');
  const [hint2Penalty, setHint2Penalty] = useState(40);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch challenges
      const chalRes = await fetch('/api/challenges', { headers });
      if (chalRes.ok) {
        const chalData = await chalRes.json();
        setChallenges(chalData);
      }

      // Fetch logs
      const subRes = await fetch('/api/admin/submissions', { headers });
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubmissions(subData);
      }

      // Fetch participants
      const partRes = await fetch('/api/admin/users', { headers });
      if (partRes.ok) {
        const partData = await partRes.json();
        setParticipants(partData);
      }

    } catch (error) {
      console.error('Error fetching admin details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/leaderboard/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyberquest_scoreboard_${Date.now()}.csv`;
        a.click();
      }
    } catch (e) {
      alert('Error exporting scoreboard CSV.');
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    setFormError('');

    const hints = [];
    if (hint1Text) hints.push({ hint_text: hint1Text, penalty: hint1Penalty });
    if (hint2Text) hints.push({ hint_text: hint2Text, penalty: hint2Penalty });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, points, category, difficulty, flag, hints })
      });

      if (response.ok) {
        setShowAddForm(false);
        resetForm();
        fetchAdminData();
      } else {
        const err = await response.json();
        setFormError(err.message || 'Error creating challenge.');
      }
    } catch (error) {
      setFormError('Failed connecting to API nodes.');
    }
  };

  const handleEditChallenge = (challenge) => {
    setEditingChallenge(challenge);
    setTitle(challenge.title);
    setDescription(challenge.description);
    setPoints(challenge.points);
    setCategory(challenge.category);
    setDifficulty(challenge.difficulty);
    setFlag(''); // Don't prefill flag for security, require type to override

    // Prefill hints if existing
    if (challenge.hints && challenge.hints[0]) {
      setHint1Text(challenge.hints[0].hint_text || '');
      setHint1Penalty(challenge.hints[0].penalty || 0);
    } else {
      setHint1Text('');
    }
    if (challenge.hints && challenge.hints[1]) {
      setHint2Text(challenge.hints[1].hint_text || '');
      setHint2Penalty(challenge.hints[1].penalty || 0);
    } else {
      setHint2Text('');
    }
  };

  const handleUpdateChallenge = async (e) => {
    e.preventDefault();
    setFormError('');

    const hints = [];
    if (hint1Text) hints.push({ hint_text: hint1Text, penalty: hint1Penalty });
    if (hint2Text) hints.push({ hint_text: hint2Text, penalty: hint2Penalty });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/challenges/${editingChallenge.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          points,
          category,
          difficulty,
          flag: flag || undefined, // Only update if specified
          hints
        })
      });

      if (response.ok) {
        setEditingChallenge(null);
        resetForm();
        fetchAdminData();
      } else {
        const err = await response.json();
        setFormError(err.message || 'Error updating challenge.');
      }
    } catch (error) {
      setFormError('Failed connecting to API nodes.');
    }
  };

  const handleDeleteChallenge = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to permanently delete this challenge? Submissions and solves will be deleted.');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/challenges/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchAdminData();
      }
    } catch (error) {
      console.error('Delete challenge error:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPoints(100);
    setCategory('Cryptography');
    setDifficulty('Easy');
    setFlag('');
    setHint1Text('');
    setHint1Penalty(20);
    setHint2Text('');
    setHint2Penalty(40);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center font-mono">
        <Shield className="h-12 w-12 text-cyber-red mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white uppercase">[!] ACCESS_VIOLATION</h1>
        <p className="text-zinc-500 text-xs mt-2">ADMIN CREDENTIALS REQUIRED FOR NODE CONTEXT VIEW</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 border-b border-zinc-900 pb-6 font-mono">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Settings className="h-6 w-6 text-cyber-blue" /> ADMIN_PORTAL_CORE
          </h1>
          <p className="text-zinc-500 text-xs mt-1">OPERATIONS CONSOLE, EXPLOIT AUDITS, AND DATABASE SERVICES</p>
        </div>

        {/* Toolbar actions */}
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="py-2 px-4 rounded border border-zinc-800 text-zinc-300 hover:border-cyber-green hover:text-cyber-green transition-all flex items-center gap-2 text-xs font-mono font-bold"
          >
            <Download className="h-4 w-4" /> EXPORT SCOREBOARD
          </button>
          
          <button
            onClick={() => { setShowAddForm(!showAddForm); setEditingChallenge(null); resetForm(); }}
            className="py-2 px-4 rounded cyber-button text-white flex items-center gap-1.5 text-xs font-mono font-bold"
          >
            <Plus className="h-4 w-4" /> ADD CHALLENGE
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex gap-4 mb-6 font-mono border-b border-zinc-900 pb-4">
        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all border ${
            activeTab === 'challenges' ? 'border-cyber-blue text-cyber-blue bg-cyber-blue/5' : 'border-zinc-850 text-zinc-500 hover:text-white'
          }`}
        >
          <Shield className="h-4 w-4" /> CHALLENGE DATABASE
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all border ${
            activeTab === 'logs' ? 'border-cyber-blue text-cyber-blue bg-cyber-blue/5' : 'border-zinc-850 text-zinc-500 hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4" /> SUBMISSION LOGS
        </button>

        <button
          onClick={() => setActiveTab('participants')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition-all border ${
            activeTab === 'participants' ? 'border-cyber-blue text-cyber-blue bg-cyber-blue/5' : 'border-zinc-850 text-zinc-500 hover:text-white'
          }`}
        >
          <Users className="h-4 w-4" /> PARTICIPANTS LIST
        </button>
      </div>

      {/* Forms Area (Create / Edit) */}
      {(showAddForm || editingChallenge) && (
        <div className="cyber-panel p-6 rounded-lg border border-cyber-blue/30 mb-8 font-mono">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3 mb-6">
            <h2 className="text-white font-bold text-sm uppercase">
              {editingChallenge ? 'Edit Challenge Schema' : 'Add New Challenge Node'}
            </h2>
            <button 
              onClick={() => { setShowAddForm(false); setEditingChallenge(null); resetForm(); }}
              className="text-zinc-500 hover:text-white"
            >
              [ CANCEL ]
            </button>
          </div>

          {formError && (
            <div className="mb-6 p-4 rounded bg-cyber-red/10 border border-cyber-red/35 flex gap-2 text-cyber-red text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={editingChallenge ? handleUpdateChallenge : handleCreateChallenge} className="space-y-4 text-xs md:text-sm font-mono text-zinc-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-500 text-xs mb-1">CHALLENGE_TITLE</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-black/60 border border-zinc-800 text-white rounded focus:border-cyber-blue focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-500 text-xs mb-1">POINTS</label>
                  <input 
                    type="number" 
                    value={points} 
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-zinc-800 text-white rounded focus:border-cyber-blue focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-500 text-xs mb-1">CATEGORY</label>
                  <select 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-zinc-800 text-zinc-300 rounded focus:border-cyber-blue focus:outline-none"
                  >
                    <option value="Cryptography" className="bg-cyber-darkest text-white">Cryptography</option>
                    <option value="Web Security" className="bg-cyber-darkest text-white">Web Security</option>
                    <option value="Forensics" className="bg-cyber-darkest text-white">Forensics</option>
                    <option value="OSINT" className="bg-cyber-darkest text-white">OSINT</option>
                    <option value="General" className="bg-cyber-darkest text-white">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-500 text-xs mb-1">DIFFICULTY</label>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-zinc-800 text-zinc-300 rounded focus:border-cyber-blue focus:outline-none"
                  >
                    <option value="Easy" className="bg-cyber-darkest text-white">Easy</option>
                    <option value="Medium" className="bg-cyber-darkest text-white">Medium</option>
                    <option value="Hard" className="bg-cyber-darkest text-white">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-zinc-500 text-xs mb-1">DESCRIPTION (Markdown Supported)</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-24 px-3 py-2 bg-black/60 border border-zinc-800 text-white rounded focus:border-cyber-blue focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-500 text-xs mb-1">
                FLAG_CODE {editingChallenge && '(Leave blank to retain current flag)'}
              </label>
              <input 
                type="text" 
                value={flag} 
                onChange={(e) => setFlag(e.target.value)}
                placeholder="cyberquest{flag_secret}"
                className="w-full px-3 py-2 bg-black/60 border border-zinc-800 text-white rounded focus:border-cyber-blue focus:outline-none"
                required={!editingChallenge}
              />
            </div>

            {/* Hints Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-900 pt-4">
              <div className="space-y-3">
                <label className="block text-cyber-yellow font-bold text-xs uppercase">HINT #01 (System Penalty)</label>
                <input 
                  type="text" 
                  value={hint1Text} 
                  onChange={(e) => setHint1Text(e.target.value)}
                  placeholder="Text description for hint..."
                  className="w-full px-3 py-2 bg-black/60 border border-zinc-800 text-white rounded focus:border-cyber-blue focus:outline-none text-xs"
                />
                <input 
                  type="number" 
                  value={hint1Penalty} 
                  onChange={(e) => setHint1Penalty(e.target.value)}
                  placeholder="Point penalty (e.g. 20)"
                  className="w-full px-3 py-2 bg-black/60 border border-zinc-800 text-white rounded focus:border-cyber-blue focus:outline-none text-xs"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-cyber-yellow font-bold text-xs uppercase">HINT #02 (System Penalty)</label>
                <input 
                  type="text" 
                  value={hint2Text} 
                  onChange={(e) => setHint2Text(e.target.value)}
                  placeholder="Text description for hint..."
                  className="w-full px-3 py-2 bg-black/60 border border-zinc-800 text-white rounded focus:border-cyber-blue focus:outline-none text-xs"
                />
                <input 
                  type="number" 
                  value={hint2Penalty} 
                  onChange={(e) => setHint2Penalty(e.target.value)}
                  placeholder="Point penalty (e.g. 40)"
                  className="w-full px-3 py-2 bg-black/60 border border-zinc-800 text-white rounded focus:border-cyber-blue focus:outline-none text-xs"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="py-2.5 px-6 rounded cyber-button text-white font-bold flex items-center gap-1.5 mt-6"
            >
              <Save className="h-4 w-4" /> {editingChallenge ? 'UPDATE NODE' : 'SAVE NODE'}
            </button>
          </form>
        </div>
      )}

      {/* Tabs rendering */}
      {loading ? (
        <div className="font-mono text-center py-20 text-zinc-400">Loading admin operations metrics...</div>
      ) : (
        <>
          {/* 1. Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="cyber-panel rounded-lg border border-zinc-800 overflow-hidden">
              <table className="w-full text-left font-mono border-collapse">
                <thead>
                  <tr className="bg-black/50 text-[10px] text-zinc-500 border-b border-zinc-800 uppercase tracking-wider">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Domain</th>
                    <th className="px-6 py-4 text-center">Difficulty</th>
                    <th className="px-6 py-4 text-right">Points</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-xs md:text-sm text-zinc-300">
                  {challenges.map((ch) => (
                    <tr key={ch.id} className="hover:bg-zinc-900/20">
                      <td className="px-6 py-4 font-bold text-white">{ch.title}</td>
                      <td className="px-6 py-4 text-zinc-400">{ch.category}</td>
                      <td className="px-6 py-4 text-center">{ch.difficulty}</td>
                      <td className="px-6 py-4 text-right text-cyber-green font-bold">{ch.points} PTS</td>
                      <td className="px-6 py-4 text-right space-x-3 shrink-0">
                        <button
                          onClick={() => handleEditChallenge(ch)}
                          className="text-cyber-blue hover:underline inline-flex items-center gap-1"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteChallenge(ch.id)}
                          className="text-cyber-red hover:underline inline-flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {challenges.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-16 text-center text-zinc-600 text-xs">
                        NO CHALLENGES FOUND IN DATABASE.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. Logs Tab */}
          {activeTab === 'logs' && (
            <div className="cyber-panel rounded-lg border border-zinc-800 overflow-hidden">
              <table className="w-full text-left font-mono border-collapse">
                <thead>
                  <tr className="bg-black/50 text-[10px] text-zinc-500 border-b border-zinc-800 uppercase tracking-wider">
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Challenge</th>
                    <th className="px-6 py-4">Flag Submitted</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-xs md:text-sm text-zinc-300">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-zinc-900/20">
                      <td className="px-6 py-4 text-zinc-500 text-[11px]">
                        {new Date(sub.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-200 font-bold">{sub.user_name}</div>
                        <div className="text-[10px] text-zinc-500">{sub.user_email}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">{sub.challenge_title}</td>
                      <td className="px-6 py-4 font-bold text-zinc-300 truncate max-w-[200px]" title={sub.submitted_flag}>
                        {sub.submitted_flag}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                          sub.is_correct 
                            ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/20' 
                            : 'bg-cyber-red/10 text-cyber-red border border-cyber-red/20'
                        }`}>
                          {sub.is_correct ? 'CORRECT' : 'INCORRECT'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-16 text-center text-zinc-600 text-xs">
                        NO SUBMISSIONS LOGGED.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Participants Tab */}
          {activeTab === 'participants' && (
            <div className="cyber-panel rounded-lg border border-zinc-800 overflow-hidden">
              <table className="w-full text-left font-mono border-collapse">
                <thead>
                  <tr className="bg-black/50 text-[10px] text-zinc-500 border-b border-zinc-800 uppercase tracking-wider">
                    <th className="px-6 py-4">Contestant</th>
                    <th className="px-6 py-4">Affiliation Details</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-xs md:text-sm text-zinc-300">
                  {participants.map((part) => (
                    <tr key={part.id} className="hover:bg-zinc-900/20">
                      <td className="px-6 py-4">
                        <div className="text-zinc-200 font-bold">{part.name}</div>
                        <div className="text-[10px] text-zinc-500">{part.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{part.college_name}</div>
                        <div className="text-[10px] text-zinc-500">Roll: {part.roll_number}</div>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-cyber-green">{part.score} PTS</td>
                      <td className="px-6 py-4 text-right text-zinc-500 text-[11px]">
                        {new Date(part.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {participants.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-16 text-center text-zinc-600 text-xs">
                        NO REGISTERED PARTICIPANTS FOUND.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Admin;
