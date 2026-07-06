import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

const GoogleLoginButton = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || clientId.trim() === '') {
      return;
    }

    const initializeGoogleSignIn = () => {
      try {
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCallback,
          });

          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      } catch (err) {
        console.error('Failed to initialize Google accounts SDK:', err);
      }
    };

    const handleGoogleCallback = async (response) => {
      setLoading(true);
      setError('');
      try {
        const result = await loginWithGoogle(response.credential);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.message || 'Google login failed.');
        }
      } catch (err) {
        setError('Google login failed. Try again.');
      } finally {
        setLoading(false);
      }
    };

    // Check if script loaded, poll if not yet ready
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initializeGoogleSignIn();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loginWithGoogle, navigate]);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Render a helper notice if no client ID is set
  if (!clientId || clientId.trim() === '') {
    return (
      <div className="text-[11px] text-gray-500 text-center py-2.5 bg-dark-bg/60 border border-dark-border/40 rounded-xl select-none">
        Google Sign-In disabled (VITE_GOOGLE_CLIENT_ID is missing)
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl p-2.5">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="relative flex justify-center w-full min-h-[40px]">
        {loading && (
          <div className="absolute inset-0 bg-dark-surface z-10 flex items-center justify-center rounded border border-dark-border">
            <Loader2 className="animate-spin text-brand-purple-light h-5 w-5" />
          </div>
        )}
        <div ref={buttonRef} className="w-full google-signin-btn" />
      </div>
    </div>
  );
};

export default GoogleLoginButton;
