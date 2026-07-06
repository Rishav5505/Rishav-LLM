import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, BrainCircuit, FileDown, Cpu, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// AnimatedHeading component: Splits text by \n into lines, then each line into individual characters. 
// Second line renders as a premium purple-to-indigo gradient.
// Character spans inherit background gradients to resolve inline-block clipping bugs.
const AnimatedHeading = ({ text, className = "" }) => {
  const [animate, setAnimate] = useState(false);
  const charDelay = 25; // 25ms per character for snap flow
  const initialDelay = 300; // 300ms initial wait

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, initialDelay);
    return () => clearTimeout(timer);
  }, []);

  const lines = text.split('\n');

  return (
    <h1 className={className} style={{ letterSpacing: '-0.03em' }}>
      {lines.map((line, lineIndex) => {
        const lineLength = line.length;
        const isGradientLine = lineIndex === 1;
        return (
          <span 
            key={lineIndex} 
            className={`block ${
              isGradientLine 
                ? 'bg-gradient-to-r from-brand-purple-light via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(156,21,141,0.35)]' 
                : 'text-white'
            }`}
            style={isGradientLine ? { backgroundClip: 'text', WebkitBackgroundClip: 'text' } : {}}
          >
            {line.split('').map((char, charIndex) => {
              const delayVal = (lineIndex * lineLength * charDelay) + (charIndex * charDelay);
              return (
                <span
                  key={charIndex}
                  className="inline-block transition-all"
                  style={{
                    opacity: animate ? 1 : 0,
                    transform: animate ? 'translateY(0)' : 'translateY(16px)',
                    transitionProperty: 'opacity, transform',
                    transitionDuration: '600ms',
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    transitionDelay: `${delayVal}ms`,
                    // Fix clipping issue by inheriting background gradient of the parent tag
                    background: isGradientLine ? 'inherit' : 'none',
                    backgroundClip: isGradientLine ? 'text' : 'initial',
                    WebkitBackgroundClip: isGradientLine ? 'text' : 'initial',
                    color: isGradientLine ? 'transparent' : 'inherit',
                    WebkitTextFillColor: isGradientLine ? 'transparent' : 'inherit'
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
};

const Home = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const customEase = [0.16, 1, 0.3, 1];

  return (
    <div className="relative min-h-screen bg-black text-gray-200 overflow-hidden flex flex-col justify-between">
      
      {/* Full-screen Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0 select-none pointer-events-none"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Futuristic Vignette Grid Mask Overlay */}
      <div 
        className="absolute inset-0 cyber-grid pointer-events-none opacity-[0.25] z-0" 
        style={{
          maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)'
        }}
      />

      {/* Navigation Header */}
      <motion.header 
        className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/40 backdrop-blur-md select-none shrink-0"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: customEase }}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-2">
            <motion.div 
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-purple to-indigo-900 border border-brand-purple/40 shadow-[0_0_20px_rgba(116,9,104,0.35)] cursor-pointer"
              whileHover={{ rotate: 180, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <Sparkles size={18} className="text-white" />
            </motion.div>
            <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Rishav AI
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold hover:text-white transition-colors cursor-pointer text-white no-underline"
            >
              Sign In
            </Link>
            <div className="relative">
              <span className="absolute inset-0 rounded-xl bg-brand-purple/35 animate-ping pointer-events-none" />
              <Link
                to="/register"
                className="relative bg-brand-purple hover:bg-brand-purple-hover text-white text-xs sm:text-sm font-bold py-2 px-3.5 sm:py-2.5 sm:px-5 rounded-xl transition-all cursor-pointer shadow-[0_0_25px_rgba(116,9,104,0.35)] hover:scale-[1.02] flex items-center gap-1 no-underline"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex-1 flex flex-col items-center justify-center text-center">
        
        {/* Concentric Rotating Holographic AI Centerpiece Orb with Rishav Photo */}
        <motion.div 
          className="relative w-24 h-24 mb-4 mt-0 flex items-center justify-center select-none cursor-pointer"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 1.0, ease: customEase }}
        >
          {/* Outer dashed rotation ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-brand-purple-light/40 animate-rotate-cw" />
          {/* Middle dotted rotation ring */}
          <div className="absolute inset-1.5 rounded-full border-2 border-dotted border-indigo-400/25 animate-rotate-ccw" />
          {/* Inner glowing core orb containing photo */}
          <div className="absolute inset-3 rounded-full border border-brand-purple/50 glow-orb overflow-hidden flex items-center justify-center bg-dark-sidebar/90 backdrop-blur-md">
            <img 
              src="/rishav.jpg" 
              alt="Rishav AI Avatar" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </motion.div>

        {/* Glow pill badge */}
        <motion.div 
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/35 text-brand-purple-light text-[9px] sm:text-[10px] font-semibold mb-2.5 select-none animate-pulse"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: customEase }}
        >
          <Cpu size={10} />
          Powered by Google Gemini 2.5 Flash
        </motion.div>

        {/* Character-by-character Title Split */}
        <AnimatedHeading 
          text={"Your Intelligent Conversational\nAI Assistant"} 
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-2 leading-[1.12]"
        />

        {/* Description Paragraph */}
        <motion.p 
          className="text-xs sm:text-base text-gray-400 max-w-2xl mb-6 leading-relaxed"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8, ease: customEase }}
        >
          Rishav AI is a production-ready conversational chatbot platform. Instantly solve code queries, 
          query uploaded PDF materials with contextual memory retrieval, and customize system instruction prompts.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-3.5 mb-10 w-full sm:w-auto px-4 sm:px-0 select-none"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: customEase }}
        >
          <div className="relative w-full sm:w-auto">
            <span className="absolute inset-0 rounded-xl bg-brand-purple/40 animate-ping pointer-events-none" />
            <Link
              to="/register"
              className="relative w-full sm:w-auto bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-3 px-7 rounded-xl transition-all cursor-pointer text-center text-xs sm:text-sm shadow-[0_0_30px_rgba(116,9,104,0.45)] hover:scale-[1.03] flex items-center justify-center gap-1.5 no-underline"
            >
              <Wand2 size={15} />
              Create Free Account
            </Link>
          </div>
          <Link
            to="/login"
            className="w-full sm:w-auto bg-dark-surface/40 hover:bg-dark-hover/60 border border-dark-border/80 text-gray-300 hover:text-white font-bold py-3 px-7 rounded-xl transition-colors cursor-pointer text-center text-xs sm:text-sm flex items-center justify-center no-underline"
          >
            Try Chat Demo
          </Link>
        </motion.div>

        {/* Feature Grid with spring hover cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl text-left px-4 sm:px-0"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8, ease: customEase }}
        >
          
          {/* Card 1 */}
          <motion.div 
            className="glass-panel rounded-2xl p-5 sm:p-6 bg-black/35 backdrop-blur-md border border-white/5 cursor-pointer relative overflow-hidden"
            whileHover={{ 
              y: -8, 
              borderColor: "rgba(156, 21, 141, 0.4)",
              boxShadow: "0 20px 40px -15px rgba(116, 9, 104, 0.25)",
              backgroundColor: "rgba(0, 0, 0, 0.5)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="bg-brand-purple/15 text-brand-purple-light w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-brand-purple/20 transition-all group-hover:scale-105">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Real-time Conversational Flow</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Experience seamless chats with Gemini. Features complete syntax highlighted coding blocks, markdown formatting, and typing animations.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            className="glass-panel rounded-2xl p-5 sm:p-6 bg-black/35 backdrop-blur-md border border-white/5 cursor-pointer relative overflow-hidden"
            whileHover={{ 
              y: -8, 
              borderColor: "rgba(156, 21, 141, 0.4)",
              boxShadow: "0 20px 40px -15px rgba(116, 9, 104, 0.25)",
              backgroundColor: "rgba(0, 0, 0, 0.5)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="bg-indigo-950/40 text-indigo-400 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-indigo-950/50">
              <BrainCircuit size={20} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Contextual Memory Engine</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Keeps track of conversations natively. Past queries are fed as context to Gemini, enabling cohesive responses to follow-up prompts.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            className="glass-panel rounded-2xl p-5 sm:p-6 bg-black/35 backdrop-blur-md border border-white/5 cursor-pointer relative overflow-hidden"
            whileHover={{ 
              y: -8, 
              borderColor: "rgba(156, 21, 141, 0.4)",
              boxShadow: "0 20px 40px -15px rgba(116, 9, 104, 0.25)",
              backgroundColor: "rgba(0, 0, 0, 0.5)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="bg-purple-950/40 text-purple-400 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-purple-950/50">
              <FileDown size={20} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">PDF Extraction QA</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Upload PDF documents and extract details instantly. Parses text in-memory and executes keyword retrieval queries before prompting Gemini.
            </p>
          </motion.div>

        </motion.div>

      </main>

      {/* Footer Banner */}
      <motion.footer 
        className="relative z-10 border-t border-white/5 bg-black/45 py-6 text-center select-none shrink-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Rishav AI. Built with Node.js, React, Tailwind, and Google Gemini API.
        </span>
      </motion.footer>

    </div>
  );
};

export default Home;
