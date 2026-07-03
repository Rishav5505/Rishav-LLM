import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, KeyRound, ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: request OTP, 2: input OTP + new password, 3: success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Send OTP to email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.forgotPassword(email);
      if (response.data.success) {
        setSuccessMsg(response.data.message || 'OTP code sent successfully!');
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Validate OTP and reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return;

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.resetPassword(email, otp, newPassword);
      if (response.data.success) {
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-dark-bg text-gray-200 flex items-center justify-center px-4 overflow-hidden select-none">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[65%] h-[65%] bg-brand-purple/10 blur-[130px] pointer-events-none animate-aura-1" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[65%] h-[65%] bg-indigo-950/25 blur-[130px] pointer-events-none animate-aura-2" />
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-80" />

      <div className="relative z-10 w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-white/5 animate-elastic">
        
        {/* Header branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-purple to-indigo-900 border border-brand-purple/40 shadow-[0_0_20px_rgba(116,9,104,0.3)] mb-4">
            <Sparkles size={22} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Reset Password</h2>
          <p className="text-xs text-gray-400 mt-1">
            {step === 1 && 'Enter your email to receive a password reset OTP'}
            {step === 2 && 'Enter the 6-digit OTP code and your new password'}
            {step === 3 && 'Your password has been changed successfully'}
          </p>
        </div>

        {/* Global error block */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/25 border border-red-900/60 rounded-xl p-3 mb-5 animate-shake">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1 Form */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-gray-400">Email Address</label>
              <div className="relative flex items-center border border-dark-border rounded-xl bg-dark-surface focus-within:border-brand-purple transition-all px-3 py-2.5">
                <Mail size={16} className="text-gray-500 mr-2.5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="bg-transparent border-none outline-none text-white text-sm w-full focus:ring-0 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-[0_0_25px_rgba(116,9,104,0.35)] flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-98"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
              ) : (
                <>
                  Send OTP Code
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer text-center pt-2"
            >
              <ArrowLeft size={12} />
              Back to Login
            </Link>
          </form>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-xs text-green-400 bg-green-950/20 border border-green-900/50 rounded-xl p-3 mb-4 text-center font-medium">
              {successMsg}
            </div>

            {/* OTP code */}
            <div className="space-y-1.5">
              <label htmlFor="otp" className="text-xs font-semibold text-gray-400">One-Time Password (OTP)</label>
              <div className="relative flex items-center border border-dark-border rounded-xl bg-dark-surface focus-within:border-brand-purple transition-all px-3 py-2.5">
                <KeyRound size={16} className="text-gray-500 mr-2.5" />
                <input
                  type="text"
                  id="otp"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="bg-transparent border-none outline-none text-white text-sm w-full focus:ring-0 focus:outline-none tracking-widest font-bold"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label htmlFor="newPassword" className="text-xs font-semibold text-gray-400">New Password</label>
              <div className="relative flex items-center border border-dark-border rounded-xl bg-dark-surface focus-within:border-brand-purple transition-all px-3 py-2.5">
                <Lock size={16} className="text-gray-500 mr-2.5" />
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent border-none outline-none text-white text-sm w-full focus:ring-0 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-400">Confirm Password</label>
              <div className="relative flex items-center border border-dark-border rounded-xl bg-dark-surface focus-within:border-brand-purple transition-all px-3 py-2.5">
                <Lock size={16} className="text-gray-500 mr-2.5" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent border-none outline-none text-white text-sm w-full focus:ring-0 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !otp || !newPassword || !confirmPassword}
              className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-[0_0_25px_rgba(116,9,104,0.35)] flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-98"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
              ) : (
                'Reset Password'
              )}
            </button>

            <button
              type="button"
              onClick={() => { setError(''); setStep(1); }}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors pt-2 cursor-pointer"
            >
              Request a new OTP code
            </button>
          </form>
        )}

        {/* Step 3 Success */}
        {step === 3 && (
          <div className="text-center">
            <div className="flex justify-center text-green-400 mb-5 animate-bounce">
              <CheckCircle2 size={48} className="drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Password Reset Successful!</h3>
            <p className="text-sm text-gray-300 mb-6">
              Your credentials have been updated. You can now use your new password to log in.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-3 px-5 rounded-xl transition-all cursor-pointer shadow-[0_0_25px_rgba(116,9,104,0.35)] hover:scale-[1.02]"
            >
              Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
