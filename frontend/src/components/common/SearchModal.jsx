import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, FileText, Bell, Newspaper, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await API.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error('Search query error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (path) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs pt-16 px-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]">
            <Search className="w-5 h-5 text-teal-500" />
            <input
              type="text"
              autoFocus
              placeholder="Search study sheets, topics, PYQs, news, notifications..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-base outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
            />
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {loading && (
              <div className="py-8 text-center text-sm text-[var(--text-secondary)]">Searching Defence Arsenal...</div>
            )}

            {!loading && results && (
              <>
                {/* Study Sheets */}
                {results.sheets?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Study Sheets
                    </h4>
                    <div className="space-y-1">
                      {results.sheets.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => handleSelect(`/sheets/${s.slug}`)}
                          className="p-2.5 rounded-lg hover:bg-teal-500/10 border border-transparent hover:border-teal-500/30 cursor-pointer flex justify-between items-center transition"
                        >
                          <span className="font-medium text-[var(--text-primary)]">{s.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-teal-500/20 text-teal-500">{s.category}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Topics */}
                {results.topics?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> Topics
                    </h4>
                    <div className="space-y-1">
                      {results.topics.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleSelect(`/sheets/${t.sheet_slug}`)}
                          className="p-2.5 rounded-lg hover:bg-teal-500/10 border border-transparent hover:border-teal-500/30 cursor-pointer flex justify-between items-center transition"
                        >
                          <div>
                            <p className="font-medium text-[var(--text-primary)] text-sm">{t.title}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{t.sheet_title} • {t.subject}</p>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-700/40 text-slate-300">{t.difficulty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {results.notifications?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Bell className="w-4 h-4" /> Notifications
                    </h4>
                    <div className="space-y-1">
                      {results.notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleSelect('/notifications')}
                          className="p-2.5 rounded-lg hover:bg-teal-500/10 border border-transparent hover:border-teal-500/30 cursor-pointer flex justify-between items-center transition"
                        >
                          <span className="font-medium text-[var(--text-primary)] text-sm">{n.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-500">{n.exam}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Affairs */}
                {results.news?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--gold-accent)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Newspaper className="w-4 h-4" /> Current Affairs
                    </h4>
                    <div className="space-y-1">
                      {results.news.map((news) => (
                        <div
                          key={news.id}
                          onClick={() => handleSelect('/current-affairs')}
                          className="p-2.5 rounded-lg hover:bg-teal-500/10 border border-transparent hover:border-teal-500/30 cursor-pointer flex justify-between items-center transition"
                        >
                          <span className="font-medium text-[var(--text-primary)] text-sm">{news.title}</span>
                          <span className="text-xs text-[var(--text-secondary)]">{news.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.sheets?.length === 0 &&
                  results.topics?.length === 0 &&
                  results.notifications?.length === 0 &&
                  results.news?.length === 0 && (
                    <div className="py-8 text-center text-sm text-[var(--text-secondary)]">
                      No results matching "{query}"
                    </div>
                  )}
              </>
            )}

            {!query.trim() && (
              <div className="py-8 text-center text-sm text-[var(--text-secondary)]">
                Type keywords like <span className="text-teal-500 font-semibold">"NDA"</span>, <span className="text-teal-500 font-semibold">"Trigonometry"</span>, <span className="text-teal-500 font-semibold">"CDS"</span>...
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SearchModal;
