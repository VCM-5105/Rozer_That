import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle2, ArrowRight, Shield, Search, Plus, X } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Sheets = () => {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const examFilter = searchParams.get('exam') || 'All';
  const [sheets, setSheets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSheet, setNewSheet] = useState({ title: '', category: 'NDA', description: '', slug: '' });

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      setLoading(true);
      const res = await API.get('/sheets');
      const payload = res.data?.data || res.data;
      setSheets(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Fetch sheets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSheet = async (e) => {
    e.preventDefault();
    try {
      const slug = newSheet.slug.trim() || newSheet.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload = { ...newSheet, slug };
      await API.post('/sheets', payload).catch(() => {
        setSheets(prev => [...prev, { ...payload, id: Date.now(), totalTopics: 0, percentage: 0 }]);
      });
      setIsModalOpen(false);
      setNewSheet({ title: '', category: 'NDA', description: '', slug: '' });
      fetchSheets();
    } catch (err) {
      console.error('Create sheet error:', err);
    }
  };

  const filteredSheets = (Array.isArray(sheets) ? sheets : []).filter((s) => {
    const matchesExam = examFilter === 'All' || s.category === examFilter;
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
                          s.description.toLowerCase().includes(search.toLowerCase());
    return matchesExam && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] military-font uppercase">
            Defence Study Sheets 
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Structured roadmap sheets for NDA, CDS, AFCAT, SSB & Revision with progress tracking and notes.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer military-font uppercase tracking-wider whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Create Study Sheet
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'NDA', 'CDS', 'AFCAT', 'SSB', 'Revision'].map((tag) => (
            <Link
              key={tag}
              to={tag === 'All' ? '/sheets' : `/sheets?exam=${tag}`}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                examFilter === tag
                  ? 'bg-teal-600 text-white font-bold shadow-md'
                  : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-teal-500'
              }`}
            >
              {tag}
            </Link>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder=""
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-teal-500 text-[var(--text-primary)]"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[var(--text-secondary)]">Loading Military Study Sheets...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSheets.map((sheet) => (
            <div key={sheet.id || sheet.slug} className="p-6 rounded-2xl glass-card flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-500 text-xs font-bold military-font uppercase">
                    {sheet.category}
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">{sheet.totalTopics || 0} Topics</span>
                </div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] military-font mb-2">{sheet.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">{sheet.description}</p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-[var(--text-secondary)]">
                    <span>Progress</span>
                    <span className="text-teal-500 font-bold">{sheet.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-[var(--bg-primary)] h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full transition-all" style={{ width: `${sheet.percentage || 0}%` }} />
                  </div>
                </div>
              </div>

              <Link
                to={`/sheets/${sheet.slug}`}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs text-center shadow-md transition flex items-center justify-center gap-2 cursor-pointer military-font tracking-wider"
              >
                Access Roadmap Sheet <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase">Create New Study Sheet</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSheet} className="space-y-4">
              <input
                type="text"
                required
                placeholder=""
                value={newSheet.title}
                onChange={(e) => setNewSheet({ ...newSheet, title: e.target.value })}
                className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              />

              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newSheet.category}
                  onChange={(e) => setNewSheet({ ...newSheet, category: e.target.value })}
                  className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
                >
                  <option value="NDA">NDA</option>
                  <option value="CDS">CDS</option>
                  <option value="AFCAT">AFCAT</option>
                  <option value="SSB">SSB</option>
                  <option value="Revision">Revision</option>
                </select>

                <input
                  type="text"
                  placeholder=""
                  value={newSheet.slug}
                  onChange={(e) => setNewSheet({ ...newSheet, slug: e.target.value })}
                  className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)] font-mono"
                />
              </div>

              <textarea
                rows={3}
                required
                placeholder=""
                value={newSheet.description}
                onChange={(e) => setNewSheet({ ...newSheet, description: e.target.value })}
                className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs military-font cursor-pointer"
                >
                  Save Study Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sheets;
