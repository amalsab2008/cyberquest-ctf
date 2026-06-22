import React, { useState, useEffect, useRef } from 'react';

const ASCII_BANNER = `
  __     ______  ______ _____   ____  _    _ ______  _____ _______ 
 /\\ \\   / / __ \\|  ____|  __ \\ / __ \\| |  | |  ____|/ ____|__   __|
/  \\ \\_/ / |  | | |__  | |__) | |  | | |  | | |__  | (___    | |   
\\ / \\   /|  |  |  __| |  _  /| |  | | |  | |  __|  \\___ \\   | |   
 \\ \\ | | | |__| | |____| | \\ \\| |__| | |__| | |____ ____) |  | |   
  \\_\\|_|  \\____/|______|_|  \\_\\\\___\\_\\\\____/|______|_____/   |_|   
`;

const TerminalConsole = () => {
  const [history, setHistory] = useState([
    { type: 'output', text: 'Initializing CyberQuest Secure Shell [v1.0.4]...' },
    { type: 'output', text: 'Type "help" to see available terminal commands.' },
    { type: 'output', text: '' }
  ]);
  const [input, setInput] = useState('');
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmdStr) => {
    const trimmed = cmdStr.trim().toLowerCase();
    const newHistory = [...history, { type: 'input', text: `student@cyberquest:~$ ${cmdStr}` }];

    if (trimmed === '') {
      setHistory(newHistory);
      return;
    }

    const command = trimmed.split(' ')[0];

    switch (command) {
      case 'help':
        newHistory.push(
          { type: 'output', text: 'Available commands:' },
          { type: 'output', text: '  about      - Learn about CyberQuest CTF' },
          { type: 'output', text: '  rules      - Show official competition rules' },
          { type: 'output', text: '  categories - View challenge domains' },
          { type: 'output', text: '  hack       - Initiate secure core connection' },
          { type: 'output', text: '  banner     - Re-display ascii banner' },
          { type: 'output', text: '  clear      - Wipe terminal scroll screen' }
        );
        break;
      case 'about':
        newHistory.push(
          { type: 'output', text: 'CyberQuest CTF is an educational cyberwarfare platform built' },
          { type: 'output', text: 'for college students. It provides a sandboxed environment to' },
          { type: 'output', text: 'practice cryptography, forensic file analysis, open source' },
          { type: 'output', text: 'intelligence (OSINT), and web security challenges.' }
        );
        break;
      case 'rules':
        newHistory.push(
          { type: 'output', text: '--- CYBERQUEST CTF COMPETITION RULES ---' },
          { type: 'output', text: '1. Flags are always formatted as: cyberquest{secret_message}.' },
          { type: 'output', text: '2. Do not attack the platform infrastructure.' },
          { type: 'output', text: '3. Do not share flags or solutions with other participants.' },
          { type: 'output', text: '4. Hints apply a point penalty. Choose wisely!' },
          { type: 'output', text: '5. Submissions are recorded in real-time. Have fun!' }
        );
        break;
      case 'categories':
        newHistory.push(
          { type: 'output', text: 'Active Challenge Sectors:' },
          { type: 'output', text: '  [+] Cryptography      - Encrypted communications and substitution ciphers.' },
          { type: 'output', text: '  [+] Web Security      - Inspect source code, exploit page configurations.' },
          { type: 'output', text: '  [+] Forensics         - Extract files and investigate image EXIF headers.' },
          { type: 'output', text: '  [+] OSINT             - Search public records and simulated social feeds.' }
        );
        break;
      case 'hack':
        newHistory.push(
          { type: 'output', text: 'Connecting to main exploit engine...' },
          { type: 'output', text: '[*] Scanning open ports... Found port 80, 22, 443' },
          { type: 'output', text: '[*] Injecting payloads... [SUCCESS]' },
          { type: 'output', text: '[+] Shell established! Status: SYSTEM ROOT ACCESS' },
          { type: 'output', text: '[!] Warning: Self-destruct sequence not armed. Just kidding, go solve some challenges!' }
        );
        break;
      case 'banner':
        ASCII_BANNER.split('\n').forEach(line => {
          newHistory.push({ type: 'output', text: line, raw: true });
        });
        break;
      case 'clear':
        setHistory([]);
        return;
      default:
        newHistory.push({ 
          type: 'output', 
          text: `bash: command not found: ${command}. Type "help" for a list of command procedures.` 
        });
    }

    setHistory(newHistory);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCommand(input);
    setInput('');
  };

  return (
    <div className="w-full max-w-2xl font-mono text-xs md:text-sm bg-black border border-cyber-green rounded-lg overflow-hidden shadow-neon-green">
      {/* Terminal Title Bar */}
      <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyber-red"></div>
          <div className="w-3 h-3 rounded-full bg-cyber-yellow"></div>
          <div className="w-3 h-3 rounded-full bg-cyber-green"></div>
        </div>
        <div className="text-zinc-500 font-sans font-semibold">student@cyberquest: ~</div>
        <div className="w-10"></div>
      </div>

      {/* Terminal Output */}
      <div className="p-4 h-64 overflow-y-auto bg-black text-cyber-green cyber-flicker flex flex-col gap-1">
        {history.map((item, idx) => (
          <div 
            key={idx} 
            className={`${item.raw ? 'whitespace-pre' : 'whitespace-pre-wrap'} ${
              item.type === 'input' ? 'text-white font-semibold' : 'text-cyber-green'
            }`}
          >
            {item.text}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Form */}
      <form onSubmit={handleSubmit} className="flex bg-black border-t border-zinc-800">
        <span className="p-3 text-white font-bold pr-1">student@cyberquest:~$</span>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent p-3 text-white focus:outline-none placeholder-zinc-700"
          placeholder="type help..."
          autoFocus
        />
      </form>
    </div>
  );
};

export default TerminalConsole;
