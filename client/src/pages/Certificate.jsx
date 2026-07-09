import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Download, CheckCircle2, Lock, Unlock, ExternalLink, ShieldAlert, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

const Certificate = () => {
  const { user } = useAuth();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasError, setCanvasError] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Google Form URL - Replace this with your actual Google Form link
  const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc_9i5iYT2wRizi2_NP-6g3ffI_BCnMrF4U-4TkRg5eZoz69g/viewform?embedded=true";

  // Check local storage if they already unlocked it in this session
  useEffect(() => {
    if (user) {
      const unlocked = localStorage.getItem(`cert_unlocked_${user.id}`);
      if (unlocked === 'true') {
        setFeedbackSubmitted(true);
      }
    }
  }, [user]);

  const handleUnlock = () => {
    setFeedbackSubmitted(true);
    if (user) {
      localStorage.setItem(`cert_unlocked_${user.id}`, 'true');
    }
    // Trigger celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00ff66', '#39b54a', '#ffffff', '#0ea848']
    });
  };

  // Draw certificate on canvas
  useEffect(() => {
    if (!feedbackSubmitted || !user || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = '/certificate_template.jpg';

    img.onload = () => {
      // Set canvas to match the template's exact high-res dimensions
      canvas.width = 1024;
      canvas.height = 724;

      // 1. Draw the base template image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 2. Configure Text Styling for Participant's Name
      // We use a beautiful purple that matches the Cyber Quest certificate branding
      ctx.fillStyle = '#6c5ce7'; 
      ctx.textAlign = 'center';
      
      // Load 'Outfit' or fallback to sans-serif
      let fontSize = 36;
      ctx.font = `bold ${fontSize}px "Outfit", "Segoe UI", sans-serif`;

      // 3. Dynamic Font Scaling: Ensure name fits perfectly within the bounds (600px max width)
      const participantName = user.name.toUpperCase();
      let textWidth = ctx.measureText(participantName).width;
      
      while (textWidth > 580 && fontSize > 16) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px "Outfit", "Segoe UI", sans-serif`;
        textWidth = ctx.measureText(participantName).width;
      }

      // 4. Draw the participant's name centered exactly above the underline (y=444 is line, so y=430)
      ctx.fillText(participantName, 512, 430);

      setImageLoaded(true);
      setCanvasError(false);
    };

    img.onerror = () => {
      console.error("Failed to load certificate template image.");
      setCanvasError(true);
    };
  }, [feedbackSubmitted, user]);

  const downloadCertificate = () => {
    if (!canvasRef.current || !imageLoaded) return;
    
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = `cyberquest_participation_cert_${user.name.toLowerCase().replace(/ /g, '_')}.png`;
    link.href = dataUrl;
    link.click();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-cyber-darkest text-white flex items-center justify-center font-mono">
        Decrypting secure session credentials...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 font-mono" ref={containerRef}>
      
      {/* Portal Header */}
      <div className="border-b border-zinc-900 pb-6 mb-8">
        <h1 className="text-2xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <Award className="h-6 w-6 text-cyber-green" /> CERTIFICATE_PORTAL
        </h1>
        <p className="text-zinc-500 text-xs mt-1">SUBMIT WORKSHOP FEEDBACK AND CLAIM YOUR COMPROMISE CREDENTIALS</p>
      </div>

      {/* Main Panel Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Side: Google Form (Takes 5 columns on large screens) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="cyber-panel p-6 rounded-lg border border-zinc-800 flex flex-col h-[650px]">
            <h3 className="text-white font-bold border-b border-zinc-900 pb-3 mb-4 uppercase text-xs flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyber-green" /> STEP_1: FEEDBACK_FORM
            </h3>
            
            {/* Embedded Google Form Iframe */}
            <div className="flex-1 w-full bg-zinc-950 rounded border border-zinc-900 overflow-hidden relative">
              <iframe 
                src={GOOGLE_FORM_URL}
                width="100%" 
                height="100%" 
                frameBorder="0" 
                marginHeight="0" 
                marginWidth="0"
                className="w-full h-full"
                title="Feedback Form"
              >
                Loading form...
              </iframe>
            </div>

            {/* Unlock Action Button */}
            <div className="mt-4 pt-4 border-t border-zinc-900">
              <p className="text-zinc-500 text-[10px] mb-3 leading-relaxed">
                * AFTER submitting the Google Form above, click the button below to unlock your participation certificate.
              </p>
              
              {!feedbackSubmitted ? (
                <button
                  onClick={handleUnlock}
                  className="w-full py-3 px-5 rounded bg-cyber-green/10 border border-cyber-green text-cyber-green hover:bg-cyber-green/20 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md shadow-cyber-green/10"
                >
                  <Unlock className="h-4 w-4" />
                  Unlock My Certificate
                </button>
              ) : (
                <div className="w-full py-3 px-5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-cyber-green" />
                  Feedback Logged & Unlocked
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Certificate Generator (Takes 7 columns on large screens) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="cyber-panel p-6 rounded-lg border border-zinc-800 flex flex-col h-[650px] justify-between">
            <div>
              <h3 className="text-white font-bold border-b border-zinc-900 pb-3 mb-4 uppercase text-xs flex items-center gap-2">
                <Award className="h-4 w-4 text-cyber-green" /> STEP_2: CERTIFICATE_DISPATCH
              </h3>
            </div>

            {/* Interactive Preview Container */}
            <div className="flex-1 flex flex-col items-center justify-center bg-zinc-950/50 rounded border border-zinc-900 p-4 relative overflow-hidden">
              
              {!feedbackSubmitted ? (
                /* Locked Screen */
                <div className="text-center p-6 space-y-4 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto shadow-inner">
                    <Lock className="h-8 w-8 text-zinc-600" />
                  </div>
                  <h4 className="text-white font-bold text-sm uppercase tracking-wider">CERTIFICATE_LOCKED</h4>
                  <p className="text-zinc-500 text-xs leading-relaxed">
                    Participation credentials are encrypted. Please complete the feedback questionnaire in the left panel to release the cryptographic key and generate your certificate.
                  </p>
                </div>
              ) : (
                /* Unlocked & Loading/Preview Screen */
                <div className="w-full h-full flex flex-col items-center justify-center">
                  
                  {canvasError && (
                    <div className="text-center text-cyber-red p-4 border border-cyber-red/20 bg-cyber-red/5 rounded mb-4 max-w-sm">
                      <ShieldAlert className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-xs font-bold uppercase">TEMPLATE_LOAD_ERROR</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Failed to load the certificate template from the local node server. Please verify the asset exists.</p>
                    </div>
                  )}

                  {/* Hidden high-res drawing canvas */}
                  <canvas 
                    ref={canvasRef} 
                    className="hidden"
                  />

                  {/* Scaled down preview canvas shown to the user */}
                  <div className="w-full max-w-lg border border-zinc-800 rounded-lg overflow-hidden shadow-2xl bg-black relative aspect-[1024/724]">
                    {/* Rendered HTML5 Canvas output as preview */}
                    {imageLoaded ? (
                      <canvas 
                        id="preview-canvas"
                        width="1024"
                        height="724"
                        ref={(el) => {
                          if (!el || !canvasRef.current) return;
                          const ctx = el.getContext('2d');
                          ctx.drawImage(canvasRef.current, 0, 0);
                        }}
                        className="w-full h-auto object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-zinc-500 font-mono">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-green mb-3"></div>
                        Generating certificate render...
                      </div>
                    )}
                  </div>

                  <p className="text-zinc-500 text-[10px] text-center mt-3 leading-relaxed max-w-md">
                    * This is a live, real-time preview of your official participation certificate. Click download below to export the high-resolution copy.
                  </p>
                </div>
              )}
            </div>

            {/* Download Button */}
            <div className="mt-4 pt-4 border-t border-zinc-900">
              <button
                onClick={downloadCertificate}
                disabled={!feedbackSubmitted || !imageLoaded}
                className={`w-full py-3 px-5 rounded font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${
                  feedbackSubmitted && imageLoaded
                    ? 'cyber-button text-white shadow-neon-green/20'
                    : 'bg-zinc-900 border border-zinc-850 text-zinc-600 cursor-not-allowed'
                }`}
              >
                <Download className="h-4 w-4" />
                Download High-Res Certificate
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Certificate;
