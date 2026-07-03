import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { authAPI } from '../services/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const triggerVerification = async () => {
      try {
        const response = await authAPI.verifyEmail(token);
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully!');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Invalid or expired email verification link.');
      }
    };
    if (token) {
      triggerVerification();
    }
  }, [token]);

  return (
    <div className="relative min-h-screen bg-dark-bg text-gray-200 flex items-center justify-center px-4 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[65%] h-[65%] bg-brand-purple/10 blur-[130px] pointer-events-none animate-aura-1" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[65%] h-[65%] bg-indigo-950/25 blur-[130px] pointer-events-none animate-aura-2" />
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-80" />

      <div className="relative z-10 w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-white/5 animate-elastic text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6 select-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-purple to-indigo-900 border border-brand-purple/40 shadow-[0_0_20px_rgba(116,9,104,0.3)] animate-pulse">
            <Sparkles size={24} className="text-white" />
          </div>
        </div>

        {status === 'verifying' && (
          <div className="py-4">
            <div className="flex justify-center mb-5">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-purple"></div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verifying Your Email</h2>
            <p className="text-xs text-gray-400">Please wait while we validate your email credentials...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="flex justify-center text-green-400 mb-5 animate-bounce">
              <CheckCircle2 size={48} className="drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Account Verified!</h2>
            <p className="text-sm text-gray-300 mb-6">{message}</p>
            <Link
              to="/login"
              className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-[0_0_25px_rgba(116,9,104,0.35)] flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              Go to Login
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="flex justify-center text-red-500 mb-5">
              <XCircle size={48} className="drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-sm text-gray-300 mb-6">{message}</p>
            <Link
              to="/login"
              className="w-full bg-dark-surface hover:bg-dark-hover border border-dark-border text-gray-300 hover:text-white font-semibold py-3 px-5 rounded-xl transition-colors cursor-pointer block text-sm"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
