import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileCheck, Award, Newspaper, Bell, FileEdit, User } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/sheets', label: 'Study Sheets', icon: BookOpen },
    { to: '/mocktests', label: 'Mock Tests', icon: FileCheck },
    { to: '/quizzes', label: 'Quizzes', icon: Award },
    { to: '/pyqs', label: 'Previous Papers', icon: FileEdit },
    { to: '/current-affairs', label: 'Current Affairs', icon: Newspaper },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <aside className="w-56 flex-shrink-0 hidden lg:block sticky top-24 self-start space-y-4 p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl transition-colors duration-300">
      <div className="px-2.5 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider text-center military-font">
        Study Arsenals
      </div>

      <nav className="space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white font-bold shadow-lg shadow-teal-950/50'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
