import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Loader2, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [systemInstruction, setSystemInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Guard: if not an admin, boot them back to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Load current personality settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await adminAPI.getSettings();
        if (response.data.success) {
          setSystemInstruction(response.data.systemInstruction);
        }
      } catch (err) {
        console.error(err);
        setStatus({ type: 'error', message: 'Failed to retrieve system prompt configurations.' });
      } finally {
        setFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!systemInstruction.trim()) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await adminAPI.updateSettings(systemInstruction.trim());
      if (response.data.success) {
        setStatus({ type: 'success', message: 'System instructions and bot personality updated successfully!' });
        setSystemInstruction(response.data.systemInstruction);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to update system settings.';
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefault = () => {
    const defaultPrompt = 
      'You are Rishav AI, a highly intelligent assistant. ' +
      'You are helpful, friendly, accurate, and concise. ' +
      'You assist in coding, interview preparation, learning, productivity, and daily tasks. ' +
      'Always respond clearly.';
    
    setSystemInstruction(defaultPrompt);
    setStatus({ type: 'info', message: 'Reset to default preset values. Click Save to apply changes.' });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 md:p-12 max-w-3xl mx-auto w-full">
      <div className="w-full bg-dark-surface border border-dark-border/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header branding controls */}
        <div className="flex items-center justify-between border-b border-dark-border/60 pb-5 mb-8 select-none">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
            <ShieldAlert size={12} />
            Admin Settings Panel
          </span>
        </div>

        <div className="flex items-center gap-3 mb-6 select-none">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Customize Assistant Personality</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Set the default system instructions injected into all chatbot sessions.
            </p>
          </div>
        </div>

        {/* Status notification alerts */}
        {status.message && (
          <div
            className={`flex items-start gap-2.5 text-sm rounded-xl p-4 mb-6 border ${
              status.type === 'success'
                ? 'bg-green-950/20 text-green-400 border-green-500/35'
                : status.type === 'error'
                ? 'bg-red-950/20 text-red-400 border-red-500/35'
                : 'bg-indigo-950/20 text-indigo-400 border-indigo-500/35'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
            )}
            <span className="font-medium leading-relaxed">{status.message}</span>
          </div>
        )}

        {fetching ? (
          <div className="flex flex-col items-center justify-center py-12 text-sm text-gray-500">
            <Loader2 className="animate-spin text-brand-purple mb-4" size={24} />
            Retrieving settings schema...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  System Instruction Prompt
                </label>
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="text-xs text-brand-purple-light hover:underline font-semibold cursor-pointer select-none"
                >
                  Load Preset Defaults
                </button>
              </div>

              <textarea
                value={systemInstruction}
                onChange={(e) => {
                  setSystemInstruction(e.target.value);
                  if (status.message) setStatus({ type: '', message: '' });
                }}
                required
                rows={8}
                className="w-full bg-dark-bg border border-dark-border rounded-xl p-4 text-sm md:text-base text-gray-200 focus:outline-none focus:border-brand-purple transition-colors placeholder:text-gray-600 leading-relaxed font-sans"
                placeholder="You are Rishav AI, a highly intelligent assistant..."
              />
              <p className="text-[10px] text-gray-500 leading-normal">
                These instructions guide model behaviors and outputs, such as tone, limits, rules, and formats.
                Newly instantiated chats will adopt this updated personality prompt automatically.
              </p>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={loading || !systemInstruction.trim()}
              className="w-full flex items-center justify-center gap-2 bg-brand-purple hover:bg-brand-purple-hover disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(116,9,104,0.35)] mt-2 hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving Personality...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Instructions
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Admin;
