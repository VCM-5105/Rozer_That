import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Filter, Search } from 'lucide-react';
import API from '../services/api';

const PYQs = () => {
  const [pyqs, setPyqs] = useState([]);
  const [examFilter, setExamFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPYQs();
  }, [examFilter, yearFilter]);

  const fetchPYQs = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/pyqs?exam=${examFilter}&year=${yearFilter}`);
      setPyqs(res.data);
    } catch (err) {
      console.error('Fetch PYQs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id, fileUrl) => {
    try {
      await API.post(`/pyqs/${id}/download`);
      fetchPYQs();
      if (fileUrl && fileUrl !== '#') {
        window.open(fileUrl, '_blank');
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] military-font uppercase flex items-center gap-2">
          <FileText className="w-8 h-8 text-teal-500" /> Previous Year Question Papers (PYQs)
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Download past official question papers categorized by exam branch (NDA, CDS, AFCAT) and year.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'NDA', 'CDS', 'AFCAT', 'CAPF'].map((exam) => (
            <button
              key={exam}
              onClick={() => setExamFilter(exam)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                examFilter === exam
                  ? 'bg-teal-600 text-white font-bold shadow-md'
                  : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-teal-500'
              }`}
            >
              {exam}
            </button>
          ))}
        </div>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] text-xs rounded-xl outline-none focus:border-teal-500 font-medium"
        >
          <option value="">All Years (2020 - 2026)</option>
          <option value="2026">2026 Papers</option>
          <option value="2025">2025 Papers</option>
          <option value="2024">2024 Papers</option>
          <option value="2023">2023 Papers</option>
        </select>
      </div>

      {/* PYQ Grid */}
      {loading ? (
        <div className="py-16 text-center text-[var(--text-secondary)]">Loading Question Paper Repository...</div>
      ) : pyqs.length === 0 ? (
        <div className="py-16 text-center text-[var(--text-secondary)]">No PYQ papers matching filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pyqs.map((paper) => (
            <div key={paper.id} className="p-6 rounded-2xl glass-card space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-500 text-xs font-bold military-font uppercase">
                    {paper.exam} • {paper.year}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">{paper.paper_type}</span>
                </div>

                <h3 className="text-lg font-bold text-[var(--text-primary)] military-font">{paper.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Official question paper download archive</p>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
                <span className="text-[10px] text-[var(--text-secondary)]">Downloaded: <strong className="text-teal-500">{paper.download_count}x</strong></span>
                
                <button
                  onClick={() => handleDownload(paper.id, paper.file_url)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer military-font tracking-wider"
                >
                  <Download className="w-3.5 h-3.5" /> Download Paper
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PYQs;
