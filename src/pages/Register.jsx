import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';
import CursorGlow from '../components/CursorGlow';

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = formData;

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await register(name, email, password);
      if (result.success) {
        setSuccess(true);
        setSuccessMessage(result.message || 'Registration successful! Please check your email to verify.');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-dark-bg text-gray-200 flex items-center justify-center px-4 overflow-hidden">
      <CursorGlow />
      
      {/* Siri-Style Morphing Aura Backgrounds */}
      <div className="absolute top-[-20%] left-[-20%] w-[65%] h-[65%] bg-brand-purple/10 blur-[130px] pointer-events-none animate-aura-1" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[65%] h-[65%] bg-indigo-950/25 blur-[130px] pointer-events-none animate-aura-2" />
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-80" />

      {/* Glassmorphic Register Card Panel */}
      <div className="relative z-10 w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-white/5 animate-elastic">
        
        {success ? (
          <div className="text-center select-none">
            <div className="flex justify-center text-green-400 mb-5 animate-bounce">
              <CheckCircle2 size={48} className="drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Check Your Email!</h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">{successMessage}</p>
            <Link
              to="/login"
              className="w-full bg-brand-purple hover:bg-brand-purple-hover text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(116,9,104,0.3)] block text-center text-sm"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <>
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
              <h2 className="text-2xl font-bold text-white">Create Account</h2>
              <p className="text-sm text-gray-400 mt-1">Get started with a personalized chatbot session</p>
            </div>

            {/* Validation Errors */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-950/20 text-red-400 border border-red-500/30 rounded-xl p-4 mb-6 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Rishav Dev"
                    className="w-full bg-dark-bg/60 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/30 transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Email address input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-dark-bg/60 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/30 transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    className="w-full bg-dark-bg/60 border border-dark-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple/30 transition-all placeholder:text-gray-600"
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
                className="w-full flex items-center justify-center gap-2 bg-brand-purple hover:bg-brand-purple-hover disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(116,9,104,0.3)] mt-3 hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Register'
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
            <div className="text-center text-sm text-gray-400 mt-6 select-none">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-purple-light font-semibold hover:underline">
                Sign In Here
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Register;
