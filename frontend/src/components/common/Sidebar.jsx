import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileCheck, Award, Newspaper, Bell, Bookmark, FileEdit } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/sheets', label: 'Study Sheets', icon: BookOpen },
    { to: '/mocktests', label: 'Mock Tests', icon: FileCheck },
    { to: '/quizzes', label: 'Quizzes', icon: Award },
    { to: '/pyqs', label: 'Previous Papers', icon: FileEdit },
    { to: '/current-affairs', label: 'Current Affairs', icon: Newspaper },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <aside className="w-64 bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] flex-shrink-0 min-h-[calc(100vh-4rem)] p-4 hidden lg:block border-r border-[var(--border-color)]">
      <div className="mb-6 px-3 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider text-center military-font">
        Military Prep Arsenal 🎖️
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-teal-600 text-white font-bold shadow-md'
                    : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover)]'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
