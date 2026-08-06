import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Award, BookOpen, Flame, Bookmark, FileText, CheckCircle2, Clock, ArrowRight, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Dashboard = () => {
  const { user, stats, refreshProfile } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [userNotes, setUserNotes] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [mockHistory, setMockHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await refreshProfile();
      const [bmRes, notesRes, quizRes, mockRes] = await Promise.all([
        API.get('/sheets/user/bookmarks'),
        API.get('/sheets/user/notes'),
        API.get('/quizzes/user/history'),
        API.get('/mocktests/user/history')
      ]);

      setBookmarks(bmRes.data);
      setUserNotes(notesRes.data);
      setQuizHistory(quizRes.data);
      setMockHistory(mockRes.data);
    } catch (err) {
      console.error('Dashboard data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-16 text-center text-[var(--text-secondary)]">Loading Cadet Analytics...</div>;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-slate-800 text-white shadow-xl border border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-xs font-semibold military-font uppercase">
            Official Cadet Operations Command 🎖️
          </div>
          <h1 className="text-3xl font-extrabold military-font">
            Welcome back, Cadet <span className="text-teal-400">{user?.username}</span>!
          </h1>
          <p className="text-xs text-slate-300">
            Keep your preparation momentum strong. Target defense exams: NDA • CDS • AFCAT
          </p>
        </div>

        {/* Streak Counter */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <Flame className="w-8 h-8 text-amber-500 animate-bounce" />
          <div>
            <p className="text-2xl font-black text-amber-500 military-font leading-none">{stats?.streakDays || 5} Days</p>
            <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Active Study Streak</p>
          </div>
        </div>
      </div>

      {/* Analytics Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl glass-card space-y-3">
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Progress</span>
            <CheckCircle2 className="w-5 h-5 text-teal-500" />
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] military-font">{stats?.completedPercentage}%</p>
          <div className="w-full bg-[var(--bg-primary)] h-2 rounded-full overflow-hidden">
            <div className="bg-teal-500 h-full transition-all" style={{ width: `${stats?.completedPercentage}%` }} />
          </div>
          <p className="text-xs text-[var(--text-secondary)]">{stats?.completedTopics} of {stats?.totalTopics} topics completed</p>
        </div>

        <div className="p-6 rounded-2xl glass-card space-y-3">
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Quizzes Attempted</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] military-font">{stats?.quizzesTaken}</p>
          <p className="text-xs text-[var(--text-secondary)]">Subject-wise speed quizzes</p>
        </div>

        <div className="p-6 rounded-2xl glass-card space-y-3">
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Mock Exams Completed</span>
            <BarChart3 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] military-font">{stats?.mocksTaken}</p>
          <p className="text-xs text-[var(--text-secondary)]">Full exam condition tests</p>
        </div>

        <div className="p-6 rounded-2xl glass-card space-y-3">
          <div className="flex justify-between items-center text-[var(--text-secondary)]">
            <span className="text-xs font-semibold uppercase tracking-wider">Bookmarked Topics</span>
            <Bookmark className="w-5 h-5 text-sky-500" />
          </div>
          <p className="text-3xl font-black text-[var(--text-primary)] military-font">{stats?.bookmarkedTopics}</p>
          <p className="text-xs text-[var(--text-secondary)]">Saved for high-yield revision</p>
        </div>
      </div>

      {/* Two Column Layout: Recent Activity & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Notes & Bookmarks */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Personal Notes */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-500" /> Saved Personal Topic Notes
              </h3>
              <span className="text-xs text-[var(--text-secondary)] font-semibold">{userNotes.length} Saved</span>
            </div>

            {userNotes.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] py-4 text-center">
                No personal notes saved yet. Click the note icon on any study sheet topic to save your custom formulas & tricks!
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {userNotes.map((note) => (
                  <div key={note.id} className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-[var(--text-primary)]">{note.title}</p>
                        <p className="text-xs text-teal-500">{note.sheet_title} • {note.subject}</p>
                      </div>
                      <Link to={`/sheets/${note.sheet_slug}`} className="text-xs text-teal-500 hover:underline">
                        Open Sheet
                      </Link>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-color)] font-mono">
                      "{note.user_notes}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarks */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500" /> High Yield Bookmarks
              </h3>
              <span className="text-xs text-[var(--text-secondary)] font-semibold">{bookmarks.length} Bookmarked</span>
            </div>

            {bookmarks.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] py-4 text-center">
                No topics bookmarked. Click the bookmark icon on any topic to save it for revision.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bookmarks.map((bm) => (
                  <Link
                    key={bm.id}
                    to={`/sheets/${bm.sheet_slug}`}
                    className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-teal-500 transition space-y-1 block"
                  >
                    <p className="font-bold text-sm text-[var(--text-primary)] truncate">{bm.title}</p>
                    <p className="text-xs text-teal-500">{bm.sheet_title}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quiz & Mock History */}
        <div className="space-y-8">
          
          {/* Recent Quiz Scores */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="font-bold text-base text-[var(--text-primary)] military-font uppercase flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <Award className="w-5 h-5 text-amber-500" /> Recent Quiz Attempts
            </h3>

            {quizHistory.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] py-4 text-center">No quiz history available.</p>
            ) : (
              <div className="space-y-3">
                {quizHistory.slice(0, 4).map((q) => (
                  <div key={q.id} className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex justify-between items-center">
                    <div>
                      <p className="font-bold text-xs text-[var(--text-primary)]">{q.quiz_title}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">{new Date(q.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-teal-500">{q.score} / {q.total_questions}</span>
                      <p className="text-[10px] text-amber-500">{q.accuracy}% acc</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Mock Test Scorecards */}
          <div className="p-6 rounded-2xl glass-card space-y-4">
            <h3 className="font-bold text-base text-[var(--text-primary)] military-font uppercase flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <BarChart3 className="w-5 h-5 text-emerald-500" /> Mock Test Scorecards
            </h3>

            {mockHistory.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] py-4 text-center">No mock tests attempted yet.</p>
            ) : (
              <div className="space-y-3">
                {mockHistory.slice(0, 4).map((m) => (
                  <div key={m.id} className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex justify-between items-center">
                    <div>
                      <p className="font-bold text-xs text-[var(--text-primary)]">{m.mock_title}</p>
                      <p className="text-[10px] text-[var(--text-secondary)]">{m.exam} • {new Date(m.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-500">{m.score} Marks</span>
                      <p className="text-[10px] text-amber-500">{m.accuracy}% acc</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
