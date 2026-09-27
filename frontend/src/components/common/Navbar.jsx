import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, LogOut, Shield, Menu, X, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import logo from '../../assets/logo.png';
import navbarBg from '../../assets/navbar-bgc.jpg';

const Navbar = ({ onOpenSearch }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-3 z-40 w-full px-4 sm:px-6">
      <div 
        className="w-full h-16 px-4 sm:px-8 rounded-full border border-slate-700/60 shadow-2xl flex items-center justify-between text-white relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${navbarBg})` }}
      >
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm -z-0 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4 lg:gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="RozerThat" className="w-8 h-8 object-contain" />
            <span className="text-xl font-extrabold tracking-tight military-font text-white">
              RozerThat
            </span>
            
          </Link>
        </div>

        <nav className="relative z-10 hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-100">
          <div className="relative" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
            <button className="flex items-center gap-1 py-1.5 hover:text-amber-400 transition cursor-pointer">
              Exams <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 py-2 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-lg z-50">
                <Link to="/sheets?exam=NDA" className="block px-4 py-2 hover:bg-white/10 text-xs text-slate-200">NDA Examination</Link>
                <Link to="/sheets?exam=CDS" className="block px-4 py-2 hover:bg-white/10 text-xs text-slate-200">CDS Examination</Link>
                <Link to="/sheets?exam=AFCAT" className="block px-4 py-2 hover:bg-white/10 text-xs text-slate-200">AFCAT Entry</Link>
                <Link to="/sheets?exam=CAPF" className="block px-4 py-2 hover:bg-white/10 text-xs text-slate-200">CAPF (AC)</Link>
              </div>
            )}
          </div>

          <Link to="/sheets" className="hover:text-amber-400 transition">Study Sheets</Link>
          <Link to="/pyqs" className="hover:text-amber-400 transition">PYQs</Link>
          <Link to="/quizzes" className="hover:text-amber-400 transition">Quizzes</Link>
          <Link to="/mocktests" className="hover:text-amber-400 transition">Mock Tests</Link>
          <Link to="/current-affairs" className="hover:text-amber-400 transition">Current Affairs</Link>
        </nav>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-full bg-white/10 border border-white/15 text-slate-200 hover:text-white hover:bg-white/20 transition cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <ThemeToggle />

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white font-medium text-xs hover:bg-white/20 transition cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.username}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 py-2 bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-lg z-50">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white">{user.username}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="px-4 py-2 hover:bg-white/10 text-xs text-slate-200 flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-teal-400" /> Student Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="px-4 py-2 hover:bg-amber-500/10 text-xs text-amber-400 font-semibold flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5" /> Admin Portal
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-xs text-red-400 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 rounded-full text-xs font-medium text-white bg-white/10 border border-white/20 hover:bg-white/20 transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-1.5 shadow-lg transition"
              >
                Register
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-200 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl space-y-2 text-sm text-slate-200">
          <Link to="/sheets" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-amber-400">Study Sheets</Link>
          <Link to="/pyqs" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-amber-400">Previous Year Papers</Link>
          <Link to="/quizzes" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-amber-400">Quizzes</Link>
          <Link to="/mocktests" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-amber-400">Mock Tests</Link>
          <Link to="/current-affairs" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-amber-400">Current Affairs</Link>
          <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-amber-400">Defence Notifications</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
