import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Sparkles, MessageSquare, BrainCircuit, FileDown, ShieldAlert, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen bg-dark-bg text-gray-200 overflow-hidden flex flex-col justify-between">
      
      {/* Radiant Floating Mesh Background Circles */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] rounded-full bg-brand-purple/15 blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] rounded-full bg-indigo-950/30 blur-[140px] pointer-events-none animate-float-delayed" />

      {/* Navigation Header */}
      <nav className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between px-6 py-5 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-purple to-indigo-900 border border-brand-purple/40 shadow-[0_0_20px_rgba(116,9,104,0.35)]">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Rishav AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold hover:text-white transition-colors cursor-pointer"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-brand-purple hover:bg-brand-purple-hover text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-all cursor-pointer shadow-[0_0_25px_rgba(116,9,104,0.35)] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(116,9,104,0.5)]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-24 flex-1 flex flex-col items-center justify-center text-center">
        
        {/* Glow pill badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/35 text-brand-purple-light text-xs font-semibold mb-6 select-none animate-pulse">
          <Cpu size={12} />
          Powered by Google Gemini 2.5 Flash
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.12]">
          Your Intelligent Conversational <br />
          <span className="bg-gradient-to-r from-brand-purple-light via-purple-400 to-indigo-400 bg-clip-text text-transparent animate-pulse duration-1000">
            AI Assistant
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mb-12 leading-relaxed">
          Rishav AI is a production-ready conversational chatbot platform. Instantly solve code queries, 
          query uploaded PDF materials with contextual memory retrieval, and customize system instruction prompts.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20 select-none">
          <Link
            to="/register"
            className="bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-4 px-8 rounded-xl transition-all cursor-pointer text-center text-base shadow-[0_0_30px_rgba(116,9,104,0.45)] hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(116,9,104,0.6)]"
          >
            Create Free Account
          </Link>
          <Link
            to="/login"
            className="bg-dark-surface/40 hover:bg-dark-hover/60 border border-dark-border/80 text-gray-300 hover:text-white font-bold py-4 px-8 rounded-xl transition-colors cursor-pointer text-center text-base"
          >
            Try Chat Demo
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left">
          
          {/* Card 1 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6">
            <div className="bg-brand-purple/15 text-brand-purple-light w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-brand-purple/20">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Real-time Conversational Flow</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Experience seamless chats with Gemini. Features complete syntax highlighted coding blocks, markdown formatting, and typing animations.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6">
            <div className="bg-indigo-950/40 text-indigo-400 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-indigo-950/50">
              <BrainCircuit size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Contextual Memory Engine</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Keeps track of conversations natively. Past queries are fed as context to Gemini, enabling cohesive responses to follow-up prompts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-6">
            <div className="bg-purple-950/40 text-purple-400 w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-purple-950/50">
              <FileDown size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">PDF Extraction QA</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
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
