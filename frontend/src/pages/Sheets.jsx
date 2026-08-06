import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle2, ArrowRight, Shield, Search } from 'lucide-react';
import API from '../services/api';

const Sheets = () => {
  const [searchParams] = useSearchParams();
  const examFilter = searchParams.get('exam') || 'All';
  const [sheets, setSheets] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      setLoading(true);
      const res = await API.get('/sheets');
      setSheets(res.data);
    } catch (err) {
      console.error('Fetch sheets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSheets = sheets.filter((s) => {
    const matchesExam = examFilter === 'All' || s.category === examFilter;
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
                          s.description.toLowerCase().includes(search.toLowerCase());
    return matchesExam && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] military-font uppercase">
          Defence Study Sheets 
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Structured roadmap sheets for NDA, CDS, AFCAT, SSB & Revision with progress tracking and notes.
        </p>
      </div>

      {/* Filter & Search Bar */}
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
            placeholder="Filter sheets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs outline-none focus:border-teal-500 text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* Sheets Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-[var(--text-secondary)]">Loading Military Study Sheets...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSheets.map((sheet) => (
            <div key={sheet.id} className="p-6 rounded-2xl glass-card flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-500 text-xs font-bold military-font uppercase">
                    {sheet.category}
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">{sheet.totalTopics} Topics</span>
                </div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] military-font mb-2">{sheet.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">{sheet.description}</p>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-[var(--text-secondary)]">
                    <span>Progress</span>
                    <span className="text-teal-500 font-bold">{sheet.percentage}%</span>
                  </div>
                  <div className="w-full bg-[var(--bg-primary)] h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full transition-all" style={{ width: `${sheet.percentage}%` }} />
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
    </div>
  );
};

export default Sheets;
