import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import GoogleLoginButton from '../components/GoogleLoginButton';
import MarketeamBackground from '../components/MarketeamBackground';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notVerified, setNotVerified] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (notVerified) setNotVerified(false);
    if (resendSuccess) setResendSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');
    setNotVerified(false);
    setResendSuccess('');

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
        if (result.isNotVerified) {
          setNotVerified(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendLink = async () => {
    if (!formData.email) return;
    setLoading(true);
    setError('');
    setResendSuccess('');
    try {
      const response = await authAPI.resendVerification(formData.email);
      if (response.data.success) {
        setResendSuccess(response.data.message || 'Verification link resent successfully!');
        setNotVerified(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketeamBackground showLeftHero={false} isFormOverlay={true}>
      
      {/* Glassmorphic Login Card Panel */}
      <div className="relative z-10 w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-white/5 animate-elastic bg-black/45 backdrop-blur-md text-white">
        
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8 select-none">
          <Link to="/" className="flex items-center gap-2 mb-3 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-purple to-indigo-900 border border-brand-purple/50 shadow-[0_0_15px_rgba(116,9,104,0.3)] animate-pulse">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Rishav AI
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-sm text-gray-400 mt-1">Sign in to resume your conversations</p>
        </div>

        {/* Resend link success banner */}
        {resendSuccess && (
          <div className="flex items-center gap-2.5 bg-green-950/20 text-green-400 border border-green-500/30 rounded-xl p-4 mb-6 text-sm">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{resendSuccess}</span>
          </div>
        )}

        {/* Validation Errors */}
        {error && (
          <div className="flex flex-col gap-2.5 bg-red-950/20 text-red-400 border border-red-500/30 rounded-xl p-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
            {notVerified && (
              <button
                onClick={handleResendLink}
                disabled={loading}
                className="text-left text-xs text-brand-purple-light hover:underline font-semibold mt-1 cursor-pointer disabled:opacity-50"
              >
                Resend verification email?
              </button>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email field */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-dark-surface/40 hover:bg-dark-hover/60 border border-dark-border/80 text-white rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:border-brand-purple/70 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-brand-purple-light hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-dark-surface/40 hover:bg-dark-hover/60 border border-dark-border/80 text-white rounded-xl py-3 pl-11 pr-12 text-sm outline-none focus:border-brand-purple/70 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-purple hover:bg-brand-purple-hover disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(116,9,104,0.3)] mt-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="relative flex py-4 items-center select-none">
          <div className="flex-grow border-t border-dark-border/60"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-xs font-bold uppercase tracking-wider">Or</span>
          <div className="flex-grow border-t border-dark-border/60"></div>
        </div>

        <GoogleLoginButton />

        {/* Footer Redirect */}
        <div className="text-center text-sm text-gray-400 mt-8 select-none">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-purple-light font-semibold hover:underline">
            Register Here
          </Link>
        </div>

      </div>
    </MarketeamBackground>
  );
};

export default Login;
