import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({ username, email, password });
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration Error Payload:', err.response);
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      setError(serverMsg || 'Registration failed. Check network or connection details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-6">
      
      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-teal-400 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md bg-[#0f1217] border border-[#222834] rounded-3xl shadow-2xl shadow-black/80 p-8 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xl shadow-inner">
            R
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Create Account
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Fill in your details below to set up your account
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder=""
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0a0c0f] border border-[#222834] rounded-xl text-sm outline-none focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/50 text-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0a0c0f] border border-[#222834] rounded-xl text-sm outline-none focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/50 text-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0a0c0f] border border-[#222834] rounded-xl text-sm outline-none focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/50 text-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-teal-950/40 transition cursor-pointer flex items-center justify-center gap-2 tracking-wide"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-4 border-t border-[#222834] text-xs text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
