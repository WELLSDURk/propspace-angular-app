import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Load remembered username/email
  useEffect(() => {
    const remembered = localStorage.getItem('propspace_remember_user');
    if (remembered) {
      setEmailOrUsername(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!emailOrUsername.trim()) {
      setError('Please enter your email or username.');
      return;
    }

    if (password.length < 1) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      await login(emailOrUsername.trim(), password, rememberMe);

      if (rememberMe) {
        localStorage.setItem('propspace_remember_user', emailOrUsername.trim());
      } else {
        localStorage.removeItem('propspace_remember_user');
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8" id="login-page">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-xl transition-all duration-300">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-2">Sign in to list properties and manage your dashboard</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex gap-2.5 items-center p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm mb-6" id="login-error-alert">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email / Username Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Username or Email
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Enter email or username"
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 placeholder-gray-400 font-medium"
                id="login-username-input"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative rounded-2xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-11 pr-12 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 placeholder-gray-400 font-medium"
                id="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                id="login-password-toggle"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me Box */}
          <div className="flex items-center justify-between py-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-gray-700 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4.5 w-4.5 rounded-lg border-gray-300 text-emerald-600 focus:ring-emerald-500/20"
                id="login-remember-me"
              />
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-600/60 text-white font-bold text-sm rounded-2xl shadow-md transition-all duration-150 cursor-pointer"
            id="login-submit-btn"
          >
            <LogIn className="h-4.5 w-4.5" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer links */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100 text-sm">
          <span className="text-gray-500 font-medium">Don't have an account? </span>
          <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors" id="login-register-link">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};
