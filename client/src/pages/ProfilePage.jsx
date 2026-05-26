// src/pages/ProfilePage.jsx
// User profile and settings page

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { User, Mail, Shield, Calendar, Save, Key, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({});

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) setProfileErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!profileData.name.trim() || profileData.name.trim().length < 2)
      errors.name = 'Name must be at least 2 characters';
    if (!profileData.email || !/\S+@\S+\.\S+/.test(profileData.email))
      errors.email = 'Invalid email format';
    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileLoading(true);
    try {
      const { data } = await authService.updateProfile(profileData);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile header card */}
      <div className="card p-6 animate-slide-up">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 
                          flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`badge ${user?.role === 'admin'
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                : 'bg-slate-700/60 text-slate-300'
                }`}>
                {user?.role === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit profile form */}
      <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="font-semibold text-white mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-primary-400" />
          Profile Information
        </h3>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className={`input pl-10 ${profileErrors.name ? 'border-red-500' : ''}`}
                placeholder="Your full name"
              />
            </div>
            {profileErrors.name && (
              <p className="text-red-400 text-xs mt-1">{profileErrors.name}</p>
            )}
          </div>

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className={`input pl-10 ${profileErrors.email ? 'border-red-500' : ''}`}
                placeholder="your@email.com"
              />
            </div>
            {profileErrors.email && (
              <p className="text-red-400 text-xs mt-1">{profileErrors.email}</p>
            )}
          </div>

          <div>
            <label className="label">Role</label>
            <input
              type="text"
              value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              disabled
              className="input opacity-50 cursor-not-allowed capitalize"
            />
            <p className="text-xs text-slate-500 mt-1">
              Role cannot be changed here. Contact an admin.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="btn-primary"
            >
              {profileLoading ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Account info */}
      <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-primary-400" />
          Account Details
        </h3>
        <div className="space-y-3">
          {[
            { label: 'User ID', value: user?._id, mono: true },
            { label: 'Account Created', value: formatDate(user?.createdAt) },
            { label: 'Authentication', value: 'JWT Token (7-day expiry)' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 
                                              border-b border-slate-700/50 last:border-0">
              <span className="text-sm text-slate-400">{item.label}</span>
              <span className={`text-sm text-slate-200 ${item.mono ? 'font-mono text-xs' : ''}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Role permissions info */}
      <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary-400" />
          Your Permissions
        </h3>
        <div className="space-y-2">
          {user?.role === 'admin' ? (
            [
              '✅ Create, edit, and delete projects',
              '✅ Create, assign, and delete tasks',
              '✅ View all projects and tasks',
              '✅ Manage team members',
              '✅ Access full dashboard analytics',
            ]
          ) : (
            [
              '✅ View assigned tasks',
              '✅ Update task status',
              '✅ View projects you are part of',
              '❌ Cannot create or delete projects',
              '❌ Cannot create or assign tasks',
            ]
          ).map((perm, i) => (
            <p key={i} className="text-sm text-slate-300">{perm}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
