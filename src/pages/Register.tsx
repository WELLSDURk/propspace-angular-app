import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ShieldAlert, KeyRound, Phone, AlignLeft, Info } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export const Register: React.FC = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Inputs
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');

  // Status
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form validation
    if (!email.trim() || !username.trim() || !fullName.trim() || !password || !confirmPassword) {
      setError('All required fields (email, username, full name, password, confirm password) must be filled out.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email address (e.g. user@domain.com).');
      return;
    }

    // Username validation
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    // Password validations (minimum 8 characters, with at least one number and special character)
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (!hasNumber || !hasSpecial) {
      setError('Password must contain at least one numeric digit and one special character (e.g. !, @, #, $, etc.).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register({
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        fullName: fullName.trim(),
        password,
        phoneNumber: phoneNumber.trim() || undefined,
        bio: bio.trim() || undefined
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try a different username or email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8" id="register-page">
      <div className="max-w-2xl w-full bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-950 tracking-tight">Create an Account</h2>
          <p className="text-sm text-gray-500 mt-2">Sign up to PropSpace to start listing and managing property portfolios</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex gap-2.5 items-center p-4 bg-red-50 border border-red-100 rounded-2xl text-red-750 text-sm mb-6" id="register-error-alert">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 placeholder-gray-400 font-medium"
                  id="register-fullname-input"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="johndoe@example.com"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 placeholder-gray-400 font-medium"
                  id="register-email-input"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="johndoe"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 placeholder-gray-400 font-medium"
                  id="register-username-input"
                />
              </div>
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 placeholder-gray-400 font-medium"
                  id="register-phone-input"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-gray-100">
            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 chars, 1 num, 1 spec"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 placeholder-gray-400 font-medium"
                  id="register-password-input"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 placeholder-gray-400 font-medium"
                  id="register-confirm-password"
                />
              </div>
            </div>
          </div>

          {/* Real-time Password Rules Help */}
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-500 space-y-1">
            <span className="font-bold text-gray-700 flex items-center gap-1 mb-1">
              <Info className="h-3.5 w-3.5 text-emerald-600" />
              Password must fulfill:
            </span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li className={password.length >= 8 ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
                Minimum of 8 characters
              </li>
              <li className={/\d/.test(password) ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
                At least one numerical digit (0-9)
              </li>
              <li className={/[^A-Za-z0-9]/.test(password) ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
                At least one special character symbol (e.g. @, #, $, %, etc.)
              </li>
            </ul>
          </div>

          {/* Description / Bio (Optional) */}
          <div className="pt-3 border-t border-gray-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Short Bio / Agent Description <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative rounded-2xl">
              <div className="absolute top-3 left-4 text-gray-400">
                <AlignLeft className="h-5 w-5" />
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell others about yourself or your real estate experience..."
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 placeholder-gray-400 font-medium"
                id="register-bio-textarea"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-600/60 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer"
            id="register-submit-btn"
          >
            {loading ? 'Creating Account...' : 'Register and Continue'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100 text-sm">
          <span className="text-gray-500 font-medium">Already have an account? </span>
          <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors" id="register-login-link">
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
};
