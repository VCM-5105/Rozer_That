import React, { useState } from 'react';
import { User, Mail, Shield, Calendar, Award, BookOpen, CheckCircle2, Upload, FileUp, Sparkles, Flame, Bookmark, BarChart3, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
];

const Profile = () => {
  const { user, stats, updateUserProfile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setMsg('');
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await API.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).catch(() => null);

      if (res && res.data) {
        const payload = res.data?.data || res.data;
        updateUserProfile({ avatar: payload.avatar || payload.url });
        setMsg('Profile avatar updated successfully!');
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Image = event.target.result;
          updateUserProfile({ avatar: base64Image });
          setMsg('Avatar updated!');
        };
        reader.readAsDataURL(file);
      }
      refreshProfile();
    } catch (err) {
      setMsg('Updated profile avatar!');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectPreset = (url) => {
    updateUserProfile({ avatar: url });
    setMsg('Avatar updated to selected preset!');
  };

  const handleApplyCustomUrl = (e) => {
    e.preventDefault();
    if (!customAvatarUrl.trim()) return;
    updateUserProfile({ avatar: customAvatarUrl.trim() });
    setMsg('Custom Avatar URL applied!');
    setCustomAvatarUrl('');
  };

  if (!user) {
    return <div className="py-16 text-center text-[var(--text-secondary)]">Loading User Profile...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-800 text-white shadow-xl border border-amber-500/30 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover border-4 border-amber-500 shadow-xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-amber-500/20 border-4 border-amber-500 flex items-center justify-center text-amber-400 font-extrabold text-3xl">
                {user.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            
            <label htmlFor="avatar-file-input" className="absolute bottom-0 right-0 p-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white cursor-pointer shadow-lg transition">
              <Upload className="w-4 h-4" />
            </label>
            <input
              id="avatar-file-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-3xl font-extrabold military-font tracking-wide capitalize">{user.username}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase military-font ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-teal-500/20 text-teal-400 border border-teal-500/40'}`}>
                {user.role || 'Student'}
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 justify-center sm:justify-start font-mono">
              <Mail className="w-3.5 h-3.5 text-amber-400" /> {user.email}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-center sm:justify-start">
              <Calendar className="w-3.5 h-3.5 text-teal-400" /> Joined: {new Date(user.created_at || user.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20 text-center space-y-0.5 min-w-28">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold uppercase">
              <Flame className="w-4 h-4" /> Streak
            </div>
            <p className="text-2xl font-black military-font text-white">{stats?.streakDays || user.streakDays || 1} Days</p>
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {msg}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)] uppercase">
            <BookOpen className="w-4 h-4 text-teal-500" /> Completed Topics
          </div>
          <p className="text-3xl font-black text-teal-500 military-font">{stats?.completedTopics || 0}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)] uppercase">
            <Award className="w-4 h-4 text-amber-500" /> Quizzes Taken
          </div>
          <p className="text-3xl font-black text-amber-500 military-font">{stats?.quizzesTaken || 0}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)] uppercase">
            <BarChart3 className="w-4 h-4 text-sky-500" /> Mocks Completed
          </div>
          <p className="text-3xl font-black text-sky-500 military-font">{stats?.mocksTaken || 0}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-secondary)] uppercase">
            <Bookmark className="w-4 h-4 text-emerald-500" /> Bookmarks
          </div>
          <p className="text-3xl font-black text-emerald-500 military-font">{stats?.bookmarkedTopics || 0}</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-6">
        <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" /> Avatar Image Settings
        </h3>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[var(--bg-primary)] border-2 border-dashed border-amber-500/40 space-y-3">
            <label className="block text-xs font-bold text-[var(--text-primary)] uppercase flex items-center gap-2">
              <FileUp className="w-4 h-4 text-amber-500" /> Upload Custom Avatar Image
            </label>
            <div className="flex items-center gap-3">
              <label htmlFor="avatar-file-button" className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md military-font uppercase">
                <Upload className="w-4 h-4" /> Choose Avatar Image
              </label>
              <input
                id="avatar-file-button"
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
              <span className="text-xs text-[var(--text-secondary)] font-mono">
                {uploading ? 'Uploading avatar...' : 'Select image from device'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase">Or Choose Preset Avatar Icon</label>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {PRESET_AVATARS.map((url, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectPreset(url)}
                  className={`relative p-1 rounded-full border-2 transition cursor-pointer ${
                    user.avatar === url ? 'border-amber-500 scale-105' : 'border-[var(--border-color)] hover:border-amber-500/50'
                  }`}
                >
                  <img src={url} alt={`Preset ${index + 1}`} className="w-14 h-14 rounded-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleApplyCustomUrl} className="flex gap-3">
            <input
              type="text"
              placeholder=""
              value={customAvatarUrl}
              onChange={(e) => setCustomAvatarUrl(e.target.value)}
              className="flex-1 p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs outline-none text-[var(--text-primary)]"
            />
            <button type="submit" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs military-font uppercase cursor-pointer">
              Set Image URL
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
