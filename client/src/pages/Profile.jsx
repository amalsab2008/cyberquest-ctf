import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, School, Hash, Mail, Award, CheckCircle, Download, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { jsPDF } from 'jspdf';

const Profile = () => {
  const { user } = useAuth();
  const [certGenerating, setCertGenerating] = useState(false);
  const canvasRef = useRef(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-cyber-darkest text-white flex items-center justify-center font-mono">
        Loading profile configuration node...
      </div>
    );
  }

  // Certificate Generator
  const generateCertificate = () => {
    setCertGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 1. Setup Canvas Dimensions (for printing/sharing)
    canvas.width = 1200;
    canvas.height = 800;

    // 2. Draw Dark Cyber Theme Background
    ctx.fillStyle = '#080c14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Draw Cyber Grid lines (subtle background)
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 4. Draw Premium Double Borders with Glowing neon corners
    ctx.strokeStyle = '#0ea848';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Glowing Neon corners
    ctx.fillStyle = '#00ff66';
    // Top-left
    ctx.fillRect(25, 25, 30, 8);
    ctx.fillRect(25, 25, 8, 30);
    // Top-right
    ctx.fillRect(canvas.width - 55, 25, 30, 8);
    ctx.fillRect(canvas.width - 33, 25, 8, 30);
    // Bottom-left
    ctx.fillRect(25, canvas.height - 33, 30, 8);
    ctx.fillRect(25, canvas.height - 55, 8, 30);
    // Bottom-right
    ctx.fillRect(canvas.width - 55, canvas.height - 33, 30, 8);
    ctx.fillRect(canvas.width - 33, canvas.height - 55, 8, 30);

    // 5. Header Banner
    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 36px "Share Tech Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CYBERQUEST CTF', canvas.width / 2, 130);
    
    ctx.fillStyle = '#8b949e';
    ctx.font = '14px "Share Tech Mono", monospace';
    ctx.fillText('================ CERTIFICATE OF COMPROMISE ================', canvas.width / 2, 170);

    // 6. Main Text Body
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px "Outfit", sans-serif';
    ctx.fillText('This document verifies that security node', canvas.width / 2, 240);

    // Student Name (Glowing & Bold)
    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 48px "Outfit", sans-serif';
    ctx.shadowColor = 'rgba(0, 255, 102, 0.4)';
    ctx.shadowBlur = 10;
    ctx.fillText(user.name.toUpperCase(), canvas.width / 2, 320);
    
    // Reset shadow blur
    ctx.shadowBlur = 0;

    // College & Roll details
    ctx.fillStyle = '#c9d1d9';
    ctx.font = '18px "Share Tech Mono", monospace';
    ctx.fillText(`ID: ${user.roll_number} | College: ${user.college_name}`, canvas.width / 2, 370);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px "Outfit", sans-serif';
    ctx.fillText('has successfully completed the beginner training exercises, demonstrating', canvas.width / 2, 440);
    ctx.fillText('knowledge in cryptography, file forensics, social OSINT, and web security portals.', canvas.width / 2, 475);

    // 7. Stats summary block
    ctx.fillStyle = '#0e1726';
    ctx.fillRect(canvas.width / 2 - 250, 520, 500, 80);
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(canvas.width / 2 - 250, 520, 500, 80);

    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 24px "Share Tech Mono", monospace';
    ctx.fillText(`${user.score} PTS`, canvas.width / 2 - 125, 560);
    ctx.fillStyle = '#8b949e';
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.fillText('SCORE ACCUMULATED', canvas.width / 2 - 125, 582);

    ctx.fillStyle = '#00ff66';
    ctx.font = 'bold 24px "Share Tech Mono", monospace';
    ctx.fillText(`${user.solves ? user.solves.length : 0} solves`, canvas.width / 2 + 125, 560);
    ctx.fillStyle = '#8b949e';
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.fillText('CHALLENGES SOLVED', canvas.width / 2 + 125, 582);

    // 8. Signatures / Signatures lines
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    
    // Left Sign Line (Platform Admin)
    ctx.beginPath();
    ctx.moveTo(150, 700);
    ctx.lineTo(400, 700);
    ctx.stroke();
    
    ctx.fillStyle = '#00ff66';
    ctx.font = 'italic 16px "Share Tech Mono", monospace';
    ctx.fillText('CyberQuest_Admin_0x7F', 275, 680);
    ctx.fillStyle = '#8b949e';
    ctx.font = '11px "Share Tech Mono", monospace';
    ctx.fillText('TOURNAMENT COMPTROLLER', 275, 720);

    // Right Sign Line (Verification Key)
    ctx.beginPath();
    ctx.moveTo(800, 700);
    ctx.lineTo(1050, 700);
    ctx.stroke();

    const verifyHash = `SHA256-${user.id.substring(0, 8).toUpperCase()}`;
    ctx.fillStyle = '#8b949e';
    ctx.font = '12px "Share Tech Mono", monospace';
    ctx.fillText(verifyHash, 925, 680);
    ctx.font = '11px "Share Tech Mono", monospace';
    ctx.fillText('DIGITAL AUTHENTICITY KEY', 925, 720);

    // 9. Export image and trigger download
    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`cyberquest_cert_${user.name.toLowerCase().replace(/ /g, '_')}.pdf`);
      setCertGenerating(false);
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 border-b border-zinc-900 pb-6 font-mono">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <User className="h-6 w-6 text-cyber-green" /> USER_PROFILE
          </h1>
          <p className="text-zinc-500 text-xs mt-1">PARTICIPANT NODE PROFILE AND COMPROMISE CREDENTIALS</p>
        </div>

        {/* Generate Certificate button */}
        <button
          onClick={generateCertificate}
          disabled={certGenerating || !user.solves || user.solves.length === 0}
          className="py-2.5 px-5 rounded cyber-button font-bold text-white text-xs font-mono tracking-widest uppercase flex items-center gap-2"
        >
          <Download className="h-4 w-4 shrink-0" />
          {certGenerating ? 'GENERATING CERT...' : 'GENERATE CERTIFICATE'}
        </button>
      </div>

      {/* Profile Info Cards Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Side: General Profile Info */}
        <div className="space-y-6">
          <div className="cyber-panel p-6 rounded-lg border border-zinc-800 space-y-6 font-mono">
            <h3 className="text-white font-bold border-b border-zinc-900 pb-3 uppercase text-xs">
              NODE_METRICS
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-cyber-green shrink-0" />
                <div>
                  <span className="block text-zinc-500 text-[10px]">NAME</span>
                  <span className="text-zinc-200 font-bold">{user.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 hidden" />
                <Mail className="h-4 w-4 text-cyber-green shrink-0" />
                <div>
                  <span className="block text-zinc-500 text-[10px]">EMAIL_ENDPOINT</span>
                  <span className="text-zinc-200">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-cyber-green shrink-0" />
                <div>
                  <span className="block text-zinc-500 text-[10px]">ROLL_NUMBER_TAG</span>
                  <span className="text-zinc-200">{user.roll_number}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <School className="h-4 w-4 text-cyber-green shrink-0" />
                <div>
                  <span className="block text-zinc-500 text-[10px]">AFFILIATED_COLLEGE</span>
                  <span className="text-zinc-200">{user.college_name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Locked/Unlocked Badges summary */}
          <div className="cyber-panel p-6 rounded-lg border border-zinc-800 font-mono text-xs">
            <h3 className="text-white font-bold border-b border-zinc-900 pb-3 mb-4 uppercase">
              ACTIVE_ACHIEVEMENTS
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {user.badges && user.badges.map((b, idx) => (
                <div key={idx} className="p-3 bg-cyber-green/5 border border-cyber-green/20 rounded text-center">
                  <Award className="h-6 w-6 text-cyber-green mx-auto mb-1.5 shadow-neon-green" />
                  <span className="block text-zinc-200 font-bold text-[10px] leading-tight truncate">{b.name}</span>
                </div>
              ))}
              {(!user.badges || user.badges.length === 0) && (
                <div className="col-span-full py-4 text-center text-zinc-600">
                  No active achievement keys unlocked. Solve challenges to earn!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Solved Challenges Table */}
        <div className="lg:col-span-2">
          <div className="cyber-panel p-6 rounded-lg border border-zinc-800 space-y-6">
            <h3 className="font-mono text-white font-bold border-b border-zinc-900 pb-3 uppercase text-xs">
              COMPROMISED_VECTORS_TIMELINE
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono border-collapse">
                <thead>
                  <tr className="bg-black/40 text-[9px] text-zinc-500 border-b border-zinc-950 uppercase tracking-wider">
                    <th className="px-4 py-3">Challenge Vector</th>
                    <th className="px-4 py-3">Domain</th>
                    <th className="px-4 py-3 text-center">Difficulty</th>
                    <th className="px-4 py-3 text-right">Date Recovered</th>
                    <th className="px-4 py-3 text-right">Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50 text-[11px] md:text-xs text-zinc-400">
                  {user.solves && user.solves.map((solve, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/10">
                      <td className="px-4 py-3.5 text-zinc-200 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5 text-cyber-green shrink-0" /> {solve.title}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{solve.category}</td>
                      <td className="px-4 py-3.5 text-center">{solve.difficulty}</td>
                      <td className="px-4 py-3.5 text-right text-zinc-500">
                        {new Date(solve.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-cyber-green">
                        +{solve.points_awarded} PTS
                      </td>
                    </tr>
                  ))}
                  {(!user.solves || user.solves.length === 0) && (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-zinc-600 text-xs">
                        NO RECORDED SOLVES YET. EXPLORE ACTIVE_SECTORS TO BEGIN.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Hidden Certificate Drawing canvas */}
      <canvas ref={canvasRef} className="hidden" />

    </div>
  );
};

export default Profile;
