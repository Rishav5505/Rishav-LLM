import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Calendar, ShieldCheck, ArrowLeft, MessageSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { chats } = useChat();

  const formattedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-12 max-w-2xl mx-auto w-full">
      <div className="w-full bg-dark-surface border border-dark-border/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow corner effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 rounded-full blur-2xl pointer-events-none" />

        {/* Back navigation header */}
        <div className="flex items-center justify-between border-b border-dark-border/60 pb-5 mb-8 select-none">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            User Account Details
          </span>
        </div>

        {/* Header Branding info */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-purple/15 border border-brand-purple/40 text-brand-purple-light text-3xl font-extrabold select-none uppercase mb-4 shadow-[0_0_20px_rgba(116,9,104,0.2)] animate-pulse">
            {user?.name ? user.name[0] : <User size={30} />}
          </div>
          <h2 className="text-2xl font-bold text-white leading-tight">{user?.name || 'Explorer'}</h2>
          <p className="text-xs text-gray-400 mt-1">Manage your credentials and view statistics</p>
        </div>

        {/* Account Details list */}
        <div className="space-y-4 mb-8">
          
          {/* Email row */}
          <div className="flex items-center gap-4 bg-dark-bg/40 border border-dark-border/50 rounded-xl p-4">
            <div className="p-2 rounded-lg bg-dark-surface border border-dark-border text-gray-400">
              <Mail size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Email Address</p>
              <p className="text-sm font-semibold text-white truncate">{user?.email || 'email@example.com'}</p>
            </div>
          </div>

          {/* Role row */}
          <div className="flex items-center gap-4 bg-dark-bg/40 border border-dark-border/50 rounded-xl p-4">
            <div className="p-2 rounded-lg bg-dark-surface border border-dark-border text-gray-400">
              <ShieldCheck size={16} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Account Access Role</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide mt-0.5 ${
                user?.role === 'admin' 
                  ? 'bg-brand-purple/20 text-brand-purple-light border border-brand-purple/35' 
                  : 'bg-slate-900 text-slate-400 border border-slate-700/60'
              }`}>
                {user?.role || 'user'}
              </span>
            </div>
          </div>

          {/* Registration Date row */}
          <div className="flex items-center gap-4 bg-dark-bg/40 border border-dark-border/50 rounded-xl p-4">
            <div className="p-2 rounded-lg bg-dark-surface border border-dark-border text-gray-400">
              <Calendar size={16} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Member Since</p>
              <p className="text-sm font-semibold text-white">{formattedDate}</p>
            </div>
          </div>

          {/* Chat count statistic row */}
          <div className="flex items-center gap-4 bg-dark-bg/40 border border-dark-border/50 rounded-xl p-4">
            <div className="p-2 rounded-lg bg-dark-surface border border-dark-border text-gray-400">
              <MessageSquare size={16} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">Conversations Count</p>
              <p className="text-sm font-semibold text-white">{chats.length} active sessions</p>
            </div>
          </div>

        </div>

        {/* Footer Redirect actions */}
        <div className="flex flex-col sm:flex-row gap-3 select-none">
          <Link
            to="/dashboard"
            className="flex-1 text-center bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer text-sm shadow-[0_0_15px_rgba(116,9,104,0.2)]"
          >
            Start Chatting
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="flex-1 text-center bg-dark-surface hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white font-bold py-3.5 px-4 rounded-xl transition-colors cursor-pointer text-sm"
            >
              Modify System Prompt
            </Link>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
