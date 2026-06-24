import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Phone, FileText, Key, CheckCircle, ShieldAlert, ArrowLeft, RefreshCw, UploadCloud } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../components/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const Profile: React.FC = () => {
  const { user, setUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Profile fields state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI Status
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load existing profile details
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhoneNumber(user.phoneNumber || '');
      setAvatarUrl(user.avatarUrl || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    if (!fullName.trim()) {
      setProfileError('Full name is required.');
      return;
    }

    try {
      setProfileLoading(true);
      const res = await api.users.updateProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        avatarUrl: avatarUrl.trim(),
        bio: bio.trim()
      });
      
      setUser(res.user);
      setProfileSuccess('Your profile details have been updated successfully.');
      
      // Auto dismiss success alert after 3 seconds
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: any) {
      console.error('Update profile detail error:', err);
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    if (!hasNumber || !hasSpecial) {
      setPasswordError('New password must contain at least one digit and one special character symbol.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      await api.users.changePassword({
        currentPassword,
        newPassword
      });

      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      // Auto dismiss success alert after 3 seconds
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err: any) {
      console.error('Change password error:', err);
      setPasswordError(err.message || 'Failed to change password. Make sure your current password is correct.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner message="Opening profile settings panel..." fullPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16" id="profile-settings-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Navigation / Header */}
        <div className="mb-8 border-b border-gray-100 pb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest mb-2">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight" id="profile-title">
            Profile Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Update your public profile, modify phone contacts, or adjust credentials safely.
          </p>
        </div>

        {/* Content Columns split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Public Profile Fields (Takes 2/3 cols) */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-gray-950 border-b border-gray-100 pb-3 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-emerald-600" />
              Public Profile Details
            </h2>

            {/* Profile Update Alerts */}
            {profileSuccess && (
              <div className="flex gap-2.5 items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-semibold" id="profile-success-alert">
                <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="flex gap-2.5 items-center p-4 bg-red-50 border border-red-100 rounded-2xl text-red-800 text-xs font-semibold" id="profile-error-alert">
                <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              
              {/* Profile Avatar Review */}
              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 border border-gray-100">
                <img
                  className="h-16 w-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                  src={avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user?.username || 'user')}`}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=avatar`;
                  }}
                />
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-bold text-gray-950 text-sm">Avatar Preview</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Paste a custom avatar URL below to change your display picture.</p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <UserIcon className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 font-semibold"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Contact Phone Number
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 font-semibold"
                  />
                </div>
              </div>

              {/* Avatar Image URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Avatar Image URL
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <UploadCloud className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://api.dicebear.com/7.x/adventurer/svg?seed=your_name"
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 font-semibold"
                  />
                </div>
              </div>

              {/* Short Description Bio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Short Bio / Consultant Bio
                </label>
                <div className="relative rounded-2xl">
                  <div className="absolute top-3 left-4 text-gray-400">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Provide description bio to let prospective buyers understand your experience..."
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-sm transition-all outline-hidden text-gray-900 font-medium"
                  />
                </div>
              </div>

              {/* Submit Update button */}
              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-600/60 text-white font-bold text-sm rounded-2xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                id="profile-save-btn"
              >
                {profileLoading ? 'Saving...' : 'Update Details'}
              </button>

            </form>
          </div>

          {/* Column 2: Password Security Adjustments (Takes 1/3 col) */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-xl h-fit">
            <h2 className="text-lg font-bold text-gray-950 border-b border-gray-100 pb-3 flex items-center gap-2 mb-5">
              <Key className="h-5 w-5 text-emerald-600" />
              Adjust Credentials
            </h2>

            {/* Password Update Alerts */}
            {passwordSuccess && (
              <div className="flex gap-2.5 items-center p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-[11px] font-semibold mb-4" id="password-success-alert">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="flex gap-2.5 items-center p-3 bg-red-50 border border-red-100 rounded-xl text-red-800 text-[11px] font-semibold mb-4" id="password-error-alert">
                <ShieldAlert className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 chars, 1 num, 1 sym"
                  className="block w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900"
                />
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="block w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 focus:border-emerald-500 rounded-xl text-xs outline-hidden text-gray-900"
                />
              </div>

              {/* Submit credential button */}
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                id="password-save-btn"
              >
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
