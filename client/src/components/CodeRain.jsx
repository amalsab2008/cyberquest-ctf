import React, { useEffect, useRef } from 'react';

const CodeRain = ({ opacity = 0.15 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Matrix characters
    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
    const nums = '0123456789';
    const alphabetChars = katakana + alphabet + nums;
    const charArray = alphabetChars.split('');

    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize) + 1;
    const rainDrops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = `rgba(8, 12, 20, ${0.05})`; // Fade trail
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff66';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < rainDrops.length; i++) {
        // Random character
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = rainDrops[i] * fontSize;

        // Bright lead character, green tail
        if (Math.random() > 0.95) {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = '#00ff66';
        }

        ctx.fillText(text, x, y);

        // Reset to top once it hits bottom with randomness
        if (y > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0" 
      style={{ opacity }}
    />
  );
};

export default CodeRain;
