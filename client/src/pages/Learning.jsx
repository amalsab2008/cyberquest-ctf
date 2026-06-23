import React, { useState } from 'react';
import { BookOpen, Terminal, Shield, ExternalLink, HelpCircle, ChevronRight, Key, Globe, Eye, FileSearch, ArrowRight, Upload } from 'lucide-react';

const Learning = () => {
  const [activeTab, setActiveTab] = useState('theory'); // theory, base64, caesar, exif
  
  // Base64 Tool states
  const [b64Input, setB64Input] = useState('');
  const [b64Output, setB64Output] = useState('');
  const [b64Mode, setB64Mode] = useState('decode');

  // Caesar Tool states
  const [caesarInput, setCaesarInput] = useState('');
  const [caesarShift, setCaesarShift] = useState(13);
  const [caesarOutput, setCaesarOutput] = useState('');

  // EXIF Tool states
  const [exifData, setExifData] = useState(null);
  const [exifError, setExifError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // 1. Base64 Logic
  const handleBase64 = (modeType, text) => {
    try {
      if (modeType === 'encode') {
        setB64Output(btoa(text));
      } else {
        setB64Output(atob(text.trim()));
      }
    } catch (e) {
      setB64Output('Error: Invalid input format.');
    }
  };

  // 2. Caesar Logic
  const handleCaesar = (text, shift, decrypt = false) => {
    let trueShift = parseInt(shift) % 26;
    if (decrypt) {
      trueShift = (26 - trueShift) % 26;
    }

    const res = text.split('').map(char => {
      const code = char.charCodeAt(0);
      // Uppercase letters
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + trueShift) % 26) + 65);
      }
      // Lowercase letters
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + trueShift) % 26) + 97);
      }
      return char; // Non-alphabetic
    }).join('');

    setCaesarOutput(res);
  };

  // 3. EXIF Parser Logic
  const handleExifUpload = (file) => {
    setExifError('');
    setExifData(null);

    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const buffer = e.target.result;
      const uint8 = new Uint8Array(buffer);
      
      // Parse file details
      const details = {
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        fileType: file.type || 'image/jpeg',
      };

      // Scanner for flag in the buffer
      let binaryString = '';
      for (let i = 0; i < uint8.length; i++) {
        binaryString += String.fromCharCode(uint8[i]);
      }

      // Check if this is our target JPEG or contains metadata
      const flagIndex = binaryString.indexOf('cyberquest{');
      if (flagIndex !== -1) {
        const flagEndIndex = binaryString.indexOf('}', flagIndex);
        if (flagEndIndex !== -1) {
          const flag = binaryString.substring(flagIndex, flagEndIndex + 1);
          
          setExifData({
            ...details,
            exifDetected: true,
            cameraModel: 'Nikon D7500 (Simulated Profile)',
            software: 'ExifTool v12.40',
            author: 'CyberQuest forensics team',
            description: flag,
            creationDate: '2026-06-22 12:00:00 UTC'
          });
          return;
        }
      }

      // Default representation if no flag is found
      setExifData({
        ...details,
        exifDetected: false,
        cameraModel: 'Unknown Camera',
        software: 'Unknown Software',
        author: 'N/A',
        description: 'No text description tags found in EXIF segment.',
        creationDate: 'N/A'
      });
    };

    reader.onerror = function() {
      setExifError('Error reading file data.');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleExifUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 border-b border-zinc-900 pb-6 font-mono">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-cyber-green" /> LEARNING_HUB
          </h1>
          <p className="text-zinc-500 text-xs mt-1">TRAINING SYLLABUS AND INTERACTIVE DECRYPTION TOOLS</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveTab('theory')}
            className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
              activeTab === 'theory' ? 'border-cyber-green text-cyber-green bg-cyber-green/5' : 'border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            SYLLABUS
          </button>
          <button 
            onClick={() => setActiveTab('base64')}
            className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
              activeTab === 'base64' ? 'border-cyber-green text-cyber-green bg-cyber-green/5' : 'border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            BASE64_DECODER
          </button>
          <button 
            onClick={() => setActiveTab('caesar')}
            className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
              activeTab === 'caesar' ? 'border-cyber-green text-cyber-green bg-cyber-green/5' : 'border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            CAESAR_CIPHER
          </button>
          <button 
            onClick={() => setActiveTab('exif')}
            className={`px-3 py-1.5 rounded font-mono text-xs transition-all border ${
              activeTab === 'exif' ? 'border-cyber-green text-cyber-green bg-cyber-green/5' : 'border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            EXIF_VIEWER
          </button>
        </div>
      </div>

      {/* theory content tab */}
      {activeTab === 'theory' && (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* roadmaps */}
          <div className="lg:col-span-2 space-y-8 font-sans">
            
            {/* What is CTF */}
            <div className="cyber-panel p-6 rounded-lg border border-zinc-800">
              <h2 className="font-mono text-md text-white font-bold mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-5 w-5 text-cyber-green" /> 1. Overview: Capture The Flag (CTF)
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                CTFs are cybersecurity contests designed to teach offensive and defensive hacking skills through hands-on practice. Puzzles range from parsing code strings to cracking password databases.
              </p>
              <div className="bg-zinc-950/60 p-4 rounded border border-zinc-900 font-mono text-xs text-zinc-400">
                <strong className="text-white block mb-2">[// SKILL_PIPELINE]</strong>
                - Identify the target file or simulator link.<br/>
                - Extract details (inspect source code, decode Base64, read EXIF tags).<br/>
                - Retrieve flag structure: <code className="text-cyber-green">cyberquest&#123;text&#125;</code>.<br/>
                - Submit on platform scoreboard to credit points.
              </div>
            </div>

            {/* Beginner roadmaps */}
            <div className="cyber-panel p-6 rounded-lg border border-zinc-800">
              <h2 className="font-mono text-md text-white font-bold mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="h-5 w-5 text-cyber-blue" /> 2. Security Roadmap for Beginners
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-cyber-blue/10 text-cyber-blue p-2 rounded shrink-0 font-mono text-xs font-bold">STAGE_01</div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Offensive Web Basics</h4>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                      Understand how browsers interact with servers. Learn HTML/CSS structures, cookie handlers, cookies manipulation, and the "Inspect Element" inspector (F12).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-cyber-blue/10 text-cyber-blue p-2 rounded shrink-0 font-mono text-xs font-bold">STAGE_02</div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Encoding & Cryptography</h4>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                      Learn the difference between encoding (Base64, Hex) and encryption (Caesar, AES). Practice decoding characters and rotating substituted letters (ROT13).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-cyber-blue/10 text-cyber-blue p-2 rounded shrink-0 font-mono text-xs font-bold">STAGE_03</div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Forensics and File Carver</h4>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                      Files are more than what they display. Learn header bytes (JPEG starts with FF D8), EXIF metadata properties, and hidden file structures.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Tools */}
            <div className="cyber-panel p-6 rounded-lg border border-zinc-800">
              <h2 className="font-mono text-md text-white font-bold mb-4 uppercase tracking-wider flex items-center gap-1.5">
                <FileSearch className="h-5 w-5 text-cyber-red" /> 3. Recommended Cybersecurity Tools
              </h2>

              <div className="grid sm:grid-cols-2 gap-4 font-mono text-xs text-zinc-400">
                <div className="p-3 bg-black/40 border border-zinc-900 rounded">
                  <strong className="text-white block mb-1">CyberChef</strong>
                  <span>"The Swiss Army Knife" of encoding, decrypting, and formatting strings. Run recipes in-browser.</span>
                </div>
                <div className="p-3 bg-black/40 border border-zinc-900 rounded">
                  <strong className="text-white block mb-1">Nmap</strong>
                  <span>Terminal utility for auditing network connections, checking open ports, and finding active servers.</span>
                </div>
                <div className="p-3 bg-black/40 border border-zinc-900 rounded">
                  <strong className="text-white block mb-1">Burp Suite</strong>
                  <span>Local proxy proxy wrapper to intercept client queries, inspect headers, and modify web payloads.</span>
                </div>
                <div className="p-3 bg-black/40 border border-zinc-900 rounded">
                  <strong className="text-white block mb-1">Exiftool</strong>
                  <span>Command-line engine to edit, read, and write EXIF, GPS, and meta headers of files.</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Links Bar */}
          <div className="space-y-6">
            <div className="cyber-panel p-5 rounded-lg border border-zinc-800 font-mono text-xs">
              <h3 className="text-white font-bold border-b border-zinc-800 pb-3 mb-4 uppercase">
                CTF PLATFORMS
              </h3>
              
              <div className="space-y-3">
                <a 
                  href="https://tryhackme.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded bg-zinc-950/40 border border-zinc-900 text-zinc-300 hover:text-cyber-green hover:border-cyber-green/30 transition-colors"
                >
                  <span>TryHackMe (Guided labs)</span>
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </a>

                <a 
                  href="https://www.hackthebox.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded bg-zinc-950/40 border border-zinc-900 text-zinc-300 hover:text-cyber-green hover:border-cyber-green/30 transition-colors"
                >
                  <span>Hack The Box (Live boxes)</span>
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </a>

                <a 
                  href="https://picoctf.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded bg-zinc-950/40 border border-zinc-900 text-zinc-300 hover:text-cyber-green hover:border-cyber-green/30 transition-colors"
                >
                  <span>picoCTF (School friendly)</span>
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </a>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Base64 Tool tab */}
      {activeTab === 'base64' && (
        <div className="w-full max-w-xl mx-auto cyber-panel p-6 rounded-lg border border-zinc-800 font-mono text-sm">
          <h2 className="text-md text-white font-bold mb-4 uppercase text-center border-b border-zinc-800 pb-3 flex items-center justify-center gap-1.5">
            <Key className="h-5 w-5 text-cyber-green" /> BASE64_DECRYPTOR_CORE
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-zinc-500 text-xs mb-1">MODE</label>
              <div className="flex gap-4">
                <button
                  onClick={() => { setB64Mode('decode'); handleBase64('decode', b64Input); }}
                  className={`flex-1 py-1.5 rounded text-xs border font-bold ${
                    b64Mode === 'decode' ? 'border-cyber-green text-cyber-green bg-cyber-green/5' : 'border-zinc-800 text-zinc-500'
                  }`}
                >
                  DECODE BASE64
                </button>
                <button
                  onClick={() => { setB64Mode('encode'); handleBase64('encode', b64Input); }}
                  className={`flex-1 py-1.5 rounded text-xs border font-bold ${
                    b64Mode === 'encode' ? 'border-cyber-green text-cyber-green bg-cyber-green/5' : 'border-zinc-800 text-zinc-500'
                  }`}
                >
                  ENCODE TEXT
                </button>
              </div>
            </div>

            <div>
              <label className="block text-zinc-500 text-xs mb-1">INPUT_BUFFER</label>
              <textarea
                value={b64Input}
                onChange={(e) => { setB64Input(e.target.value); handleBase64(b64Mode, e.target.value); }}
                placeholder={b64Mode === 'decode' ? 'Paste Base64 here (e.g., Y3liZXJxdWVzdA==)' : 'Type text to encode...'}
                className="w-full h-24 p-3 rounded bg-black/50 border border-zinc-800 text-white focus:border-cyber-green focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-zinc-500 text-xs mb-1">OUTPUT_CLEARTEXT</label>
              <div className="w-full min-h-[60px] p-3 rounded bg-black border border-zinc-900 text-cyber-green font-bold text-xs select-text overflow-x-auto whitespace-pre-wrap">
                {b64Output || 'NO OUTPUT PRODUCED.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Caesar Tool tab */}
      {activeTab === 'caesar' && (
        <div className="w-full max-w-xl mx-auto cyber-panel p-6 rounded-lg border border-zinc-800 font-mono text-sm">
          <h2 className="text-md text-white font-bold mb-4 uppercase text-center border-b border-zinc-800 pb-3 flex items-center justify-center gap-1.5">
            <Key className="h-5 w-5 text-cyber-green" /> CAESAR_SHIFT_DECRYPTER
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-zinc-500 text-xs mb-1">SHIFT KEY</label>
                <input 
                  type="number"
                  min="1"
                  max="25"
                  value={caesarShift}
                  onChange={(e) => { setCaesarShift(e.target.value); handleCaesar(caesarInput, e.target.value); }}
                  className="w-full px-3 py-1.5 rounded bg-black/50 border border-zinc-800 text-white focus:border-cyber-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-500 text-xs mb-1">ROT13 DEFAULT</label>
                <button
                  onClick={() => { setCaesarShift(13); handleCaesar(caesarInput, 13); }}
                  className="w-full py-1.5 rounded border border-zinc-800 text-zinc-300 hover:border-cyber-green hover:text-cyber-green transition-colors text-xs font-bold"
                >
                  SET 13
                </button>
              </div>
            </div>

            <div>
              <label className="block text-zinc-500 text-xs mb-1">INPUT_BUFFER</label>
              <textarea
                value={caesarInput}
                onChange={(e) => { setCaesarInput(e.target.value); handleCaesar(e.target.value, caesarShift); }}
                placeholder="Type cipher or cleartext (e.g., ploredhrfg)"
                className="w-full h-24 p-3 rounded bg-black/50 border border-zinc-800 text-white focus:border-cyber-green focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-zinc-500 text-xs mb-1">DECRYPTED_OUTPUT</label>
              <div className="w-full min-h-[60px] p-3 rounded bg-black border border-zinc-900 text-cyber-green font-bold text-xs select-text overflow-x-auto whitespace-pre-wrap">
                {caesarOutput || 'NO OUTPUT PRODUCED.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXIF Tool tab */}
      {activeTab === 'exif' && (
        <div className="w-full max-w-xl mx-auto cyber-panel p-6 rounded-lg border border-zinc-800 font-mono text-sm">
          <h2 className="text-md text-white font-bold mb-4 uppercase text-center border-b border-zinc-800 pb-3 flex items-center justify-center gap-1.5">
            <FileSearch className="h-5 w-5 text-cyber-green" /> EXIF_HEADER_CARVER
          </h2>

          <div className="space-y-6">
            
            {/* Drag drop zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-lg text-center transition-all ${
                dragActive 
                  ? 'border-cyber-green bg-cyber-green/5' 
                  : 'border-zinc-850 bg-black/40 hover:border-zinc-700'
              }`}
            >
              <Upload className="h-8 w-8 text-zinc-500 mx-auto mb-3" />
              <p className="text-zinc-300 text-xs font-bold mb-1">DRAG & DROP IMAGE FILE HERE</p>
              <p className="text-zinc-500 text-[10px] mb-3">Accepts JPG/JPEG/PNG format recovered artifacts</p>
              
              <label className="py-1.5 px-4 rounded border border-zinc-800 text-zinc-400 hover:text-cyber-green hover:border-cyber-green transition-all text-xs font-bold cursor-pointer inline-block">
                SELECT IMAGE FILE
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleExifUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden" 
                />
              </label>
            </div>

            {exifError && (
              <div className="p-3 bg-cyber-red/10 border border-cyber-red/20 text-cyber-red text-xs rounded">
                {exifError}
              </div>
            )}

            {/* parsed EXIF table */}
            {exifData ? (
              <div className="space-y-4 border border-zinc-800 p-4 rounded bg-black/30">
                <span className="block text-cyber-green font-bold text-xs">[ CARVED_METADATA_HEADER ]</span>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-zinc-900 pb-1">
                    <span className="text-zinc-500">File Name:</span>
                    <span className="text-zinc-300">{exifData.fileName}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1">
                    <span className="text-zinc-500">File Size:</span>
                    <span className="text-zinc-300">{exifData.fileSize}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1">
                    <span className="text-zinc-500">Camera Maker:</span>
                    <span className="text-zinc-300">{exifData.cameraModel}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1">
                    <span className="text-zinc-500">Parsing Software:</span>
                    <span className="text-zinc-300">{exifData.software}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-1">
                    <span className="text-zinc-500">Capture Date:</span>
                    <span className="text-zinc-300">{exifData.creationDate}</span>
                  </div>
                  
                  {/* Flag / Description tag */}
                  <div className="flex flex-col gap-1 pt-2">
                    <span className="text-cyber-yellow font-bold uppercase">Image Description (EXIF tag 0x010E):</span>
                    <span className="bg-black p-2.5 rounded border border-zinc-900 text-cyber-green font-mono font-bold select-text tracking-wide break-all">
                      {exifData.description}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-zinc-600 text-xs font-mono py-6">
                AWAITING ARTEFACT IMAGE FILE TO PARSE HEADERS.
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Learning;
