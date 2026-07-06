import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Sparkles, MessageSquare, BrainCircuit, FileDown, Cpu, Wand2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CursorGlow from '../components/CursorGlow';

const Home = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen bg-dark-bg text-gray-200 overflow-hidden flex flex-col justify-between">
      <CursorGlow />
      
      {/* Siri-Style Morphing Aura Backgrounds */}
      <div className="absolute top-[-20%] left-[-20%] w-[65%] h-[65%] bg-brand-purple/10 blur-[130px] pointer-events-none animate-aura-1" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[65%] h-[65%] bg-indigo-950/25 blur-[130px] pointer-events-none animate-aura-2" />

      {/* Cybernetic Grid Overlay */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-80" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-dark-border/40 bg-dark-bg/60 backdrop-blur-md select-none shrink-0">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-purple to-indigo-900 border border-brand-purple/40 shadow-[0_0_20px_rgba(116,9,104,0.35)] animate-pulse">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Rishav AI
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </Link>
            <div className="relative">
              <span className="absolute inset-0 rounded-xl bg-brand-purple/35 animate-ping pointer-events-none" />
              <Link
                to="/register"
                className="relative bg-brand-purple hover:bg-brand-purple-hover text-white text-xs sm:text-sm font-bold py-2 px-3.5 sm:py-2.5 sm:px-5 rounded-xl transition-all cursor-pointer shadow-[0_0_25px_rgba(116,9,104,0.35)] hover:scale-[1.02] flex items-center gap-1"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-2 md:py-4 flex-1 flex flex-col items-center justify-center text-center animate-elastic">
        
        {/* Concentric Rotating Holographic AI Centerpiece Orb with Rishav Photo */}
        <div className="relative w-24 h-24 mb-4 mt-0 flex items-center justify-center select-none">
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
        </div>

        {/* Glow pill badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/35 text-brand-purple-light text-[9px] sm:text-[10px] font-semibold mb-2.5 select-none animate-pulse">
          <Cpu size={10} />
          Powered by Google Gemini 2.5 Flash
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-2 leading-[1.15]">
          Your Intelligent Conversational <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-purple-light via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(156,21,141,0.45)]">
            AI Assistant
          </span>
        </h1>

        <p className="text-xs sm:text-base text-gray-400 max-w-2xl mb-4.5 leading-relaxed">
          Rishav AI is a production-ready conversational chatbot platform. Instantly solve code queries, 
          query uploaded PDF materials with contextual memory retrieval, and customize system instruction prompts.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3.5 mb-6 w-full sm:w-auto px-4 sm:px-0 select-none">
          <div className="relative w-full sm:w-auto">
            <span className="absolute inset-0 rounded-xl bg-brand-purple/40 animate-ping pointer-events-none" />
            <Link
              to="/register"
              className="relative w-full sm:w-auto bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-3 px-7 rounded-xl transition-all cursor-pointer text-center text-xs sm:text-sm shadow-[0_0_30px_rgba(116,9,104,0.45)] hover:scale-[1.03] flex items-center justify-center gap-1.5"
            >
              <Wand2 size={15} />
              Create Free Account
            </Link>
          </div>
          <Link
            to="/login"
            className="w-full sm:w-auto bg-dark-surface/40 hover:bg-dark-hover/60 border border-dark-border/80 text-gray-300 hover:text-white font-bold py-3 px-7 rounded-xl transition-colors cursor-pointer text-center text-xs sm:text-sm flex items-center justify-center"
          >
            Try Chat Demo
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl text-left px-4 sm:px-0">
          
          {/* Card 1 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6">
            <div className="bg-brand-purple/15 text-brand-purple-light w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-brand-purple/20 transition-all group-hover:scale-105">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Real-time Conversational Flow</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Experience seamless chats with Gemini. Features complete syntax highlighted coding blocks, markdown formatting, and typing animations.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6">
            <div className="bg-indigo-950/40 text-indigo-400 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-indigo-950/50">
              <BrainCircuit size={20} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Contextual Memory Engine</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Keeps track of conversations natively. Past queries are fed as context to Gemini, enabling cohesive responses to follow-up prompts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6">
            <div className="bg-purple-950/40 text-purple-400 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-purple-950/50">
              <FileDown size={20} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">PDF Extraction QA</h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Upload PDF documents and extract details instantly. Parses text in-memory and executes keyword retrieval queries before prompting Gemini.
            </p>
          </div>

        </div>

      </main>

      {/* Footer Banner */}
      <footer className="relative z-10 border-t border-dark-border bg-dark-sidebar/40 py-6 text-center select-none shrink-0">
        <span className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Rishav AI. Built with Node.js, React, Tailwind, and Google Gemini API.
        </span>
      </footer>

    </div>
  );
};

export default Home;
