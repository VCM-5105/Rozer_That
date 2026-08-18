import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronDown, User, LogOut, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import chestnumber from '../../assets/logo.png';

const Navbar = ({ onOpenSearch }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-secondary)] border-b border-[var(--border-color)] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
       
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={chestnumber} alt="RozerThat" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-extrabold tracking-wider military-font text-[var(--text-primary)]">
              RozerThat
            </span>
          </Link>

         
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            
            <div className="relative" onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}>
              <button className="flex items-center gap-1 py-2 text-[var(--text-primary)] hover:text-teal-500 transition">
                Exams <ChevronDown className="w-4 h-4" />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 w-48 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-xl z-50">
                  <Link to="/sheets?exam=NDA" className="block px-4 py-2 hover:bg-teal-500/10 text-sm text-[var(--text-primary)]">NDA Examination</Link>
                  <Link to="/sheets?exam=CDS" className="block px-4 py-2 hover:bg-teal-500/10 text-sm text-[var(--text-primary)]">CDS Examination</Link>
                  <Link to="/sheets?exam=AFCAT" className="block px-4 py-2 hover:bg-teal-500/10 text-sm text-[var(--text-primary)]">AFCAT Entry</Link>
                  <Link to="/sheets?exam=CAPF" className="block px-4 py-2 hover:bg-teal-500/10 text-sm text-[var(--text-primary)]">CAPF (AC)</Link>
                </div>
              )}
            </div>

            <Link to="/sheets" className="text-[var(--text-primary)] hover:text-teal-500 transition">Study Sheets</Link>
            <Link to="/pyqs" className="text-[var(--text-primary)] hover:text-teal-500 transition">PYQs</Link>
            <Link to="/quizzes" className="text-[var(--text-primary)] hover:text-teal-500 transition">Quizzes</Link>
            <Link to="/mocktests" className="text-[var(--text-primary)] hover:text-teal-500 transition">Mock Tests</Link>
            <Link to="/current-affairs" className="text-[var(--text-primary)] hover:text-teal-500 transition">Current Affairs</Link>
          </nav>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:border-teal-500 transition cursor-pointer"
          >
            <Search className="w-4 h-4 text-teal-500" />
            <span className="hidden sm:inline">Search Arsenal...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-color)] text-[10px] font-mono">⌘K</kbd>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Auth Buttons / Profile Dropdown */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-500 font-semibold text-sm hover:bg-teal-500/20 transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                  {user.username.charAt(0)}
                </div>
                <span className="hidden sm:inline">{user.username}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50">
                  <div className="px-4 py-2 border-b border-[var(--border-color)]">
                    <p className="text-sm font-bold text-[var(--text-primary)]">{user.username}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="block px-4 py-2 hover:bg-teal-500/10 text-sm text-[var(--text-primary)] flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-teal-500" /> Student Dashboard
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 hover:bg-amber-500/10 text-sm text-amber-500 font-semibold flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" /> Admin Portal
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-sm text-red-500 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-[var(--text-primary)] hover:text-teal-500 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white shadow-md transition"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[var(--text-primary)]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 border-t border-[var(--border-color)] bg-[var(--bg-card)]">
          <Link to="/sheets" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-[var(--text-primary)]">Study Sheets</Link>
          <Link to="/pyqs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-[var(--text-primary)]">Previous Year Papers</Link>
          <Link to="/quizzes" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-[var(--text-primary)]">Quizzes</Link>
          <Link to="/mocktests" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-[var(--text-primary)]">Mock Tests</Link>
          <Link to="/current-affairs" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-[var(--text-primary)]">Current Affairs</Link>
          <Link to="/notifications" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-[var(--text-primary)]">Defence Notifications</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
