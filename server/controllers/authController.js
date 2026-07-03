import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendVerificationEmail, sendOtpEmail } from '../services/emailService.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'rishav_ai_jwt_secret_key_123', {
    expiresIn: '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationToken,
    });

    if (user) {
      // Send verification email
      const clientUrl = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5174';
      await sendVerificationEmail(user.email, user.name, verificationToken, clientUrl);

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user (must select password explicitly)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        isNotVerified: true,
        message: 'Please verify your email address before logging in.',
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google ID Token is required' });
    }

    // Verify token with Google's API via native fetch
    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
    const verifyResponse = await fetch(googleVerifyUrl);
    const payload = await verifyResponse.json();

    if (payload.error || payload.error_description) {
      return res.status(400).json({ 
        success: false, 
        message: payload.error_description || 'Invalid Google ID Token' 
      });
    }

    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email not provided by Google account' });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create user if not exists
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword, // Will be hashed by userSchema pre-save hook
        isVerified: true, // Google accounts are verified implicitly
      });
    } else if (!user.isVerified) {
      // Auto-verify if they authenticate via Google OAuth
      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Google Auth Controller Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email token
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'This account has already been verified.' });
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    await user.save();

    const clientUrl = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5174';
    await sendVerificationEmail(user.email, user.name, token, clientUrl);

    res.status(200).json({
      success: true,
      message: 'Verification link has been resent! Please check your email.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist.' });
    }

    // Generate 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to user with 10 minutes expiry time
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send OTP email
    await sendOtpEmail(user.email, user.name, otp);

    res.status(200).json({
      success: true,
      message: 'Password reset OTP has been sent to your email!',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all fields (email, OTP, newPassword)' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify OTP code matches and is not expired
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    }

    if (user.resetPasswordOtpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP code has expired. Please request a new one.' });
    }

    // Reset password (User schema pre-save hook will automatically encrypt this password)
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    
    // Ensure account becomes verified if it wasn't already (nice UX touch)
    if (!user.isVerified) {
      user.isVerified = true;
      user.verificationToken = undefined;
    }
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
