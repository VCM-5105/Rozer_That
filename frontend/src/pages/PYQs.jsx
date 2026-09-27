import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Filter, Search, Plus, Upload, FileUp, CheckCircle2, X } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const PYQs = () => {
  const { isAdmin } = useAuth();
  const [pyqs, setPyqs] = useState([]);
  const [examFilter, setExamFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPyq, setNewPyq] = useState({ title: '', exam: 'NDA', year: '2026', paper_type: 'Mathematics', file_url: '', fileName: '' });

  useEffect(() => {
    fetchPYQs();
  }, [examFilter, yearFilter]);

  const fetchPYQs = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/pyqs?exam=${examFilter}&year=${yearFilter}`);
      const payload = res.data?.data || res.data;
      setPyqs(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Fetch PYQs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setNewPyq(prev => ({
        ...prev,
        file_url: uploadEvent.target.result,
        fileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePYQ = async (e) => {
    e.preventDefault();
    try {
      await API.post('/pyqs', newPyq).catch(() => {
        setPyqs(prev => [
          { ...newPyq, id: Date.now(), download_count: 0 },
          ...prev
        ]);
      });
      setIsModalOpen(false);
      setNewPyq({ title: '', exam: 'NDA', year: '2026', paper_type: 'Mathematics', file_url: '', fileName: '' });
      fetchPYQs();
    } catch (err) {
      console.error('Create PYQ error:', err);
    }
  };

  const handleDownload = async (id, fileUrl, title) => {
    try {
      await API.post(`/pyqs/${id}/download`).catch(() => {});
      fetchPYQs();

      if (fileUrl && fileUrl !== '#') {
        if (fileUrl.startsWith('data:')) {
          const a = document.createElement('a');
          a.href = fileUrl;
          a.download = `${(title || 'PYQ_Paper').replace(/[^a-zA-Z0-9]+/g, '_')}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          window.open(fileUrl, '_blank');
        }
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] military-font uppercase flex items-center gap-2">
            <FileText className="w-8 h-8 text-teal-500" /> Previous Year Question Papers (PYQs)
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Download past official question papers categorized by exam branch (NDA, CDS, AFCAT) and year.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition cursor-pointer military-font uppercase tracking-wider whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Upload PYQ PDF
          </button>
        )}
      </div>

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
                <span className="text-[10px] text-[var(--text-secondary)]">Downloaded: <strong className="text-teal-500">{paper.download_count || 0}x</strong></span>
                
                <button
                  onClick={() => handleDownload(paper.id, paper.file_url, paper.title)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer military-font tracking-wider"
                >
                  <Download className="w-3.5 h-3.5" /> Download Paper
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase">Upload PYQ Question Paper PDF</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePYQ} className="space-y-4">
              <input
                type="text"
                required
                placeholder=""
                value={newPyq.title}
                onChange={(e) => setNewPyq({ ...newPyq, title: e.target.value })}
                className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              />

              <div className="grid grid-cols-3 gap-4">
                <select
                  value={newPyq.exam}
                  onChange={(e) => setNewPyq({ ...newPyq, exam: e.target.value })}
                  className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
                >
                  <option value="NDA">NDA</option>
                  <option value="CDS">CDS</option>
                  <option value="AFCAT">AFCAT</option>
                  <option value="CAPF">CAPF</option>
                </select>
                <input
                  type="number"
                  value={newPyq.year}
                  onChange={(e) => setNewPyq({ ...newPyq, year: e.target.value })}
                  className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
                />
                <input
                  type="text"
                  placeholder=""
                  value={newPyq.paper_type}
                  onChange={(e) => setNewPyq({ ...newPyq, paper_type: e.target.value })}
                  className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-primary)] border-2 border-dashed border-amber-500/40 space-y-3">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-amber-500" /> Select PDF File (e.g. pyq-2021.pdf)
                </label>
                
                <div className="flex items-center gap-3">
                  <label htmlFor="modal-pyq-file" className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md military-font uppercase">
                    <FileUp className="w-4 h-4" /> Choose File
                  </label>
                  <input
                    id="modal-pyq-file"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                  <span className="text-xs text-[var(--text-secondary)] font-mono">
                    {newPyq.fileName ? newPyq.fileName : 'No file chosen'}
                  </span>
                </div>

                {newPyq.fileName && (
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Selected PDF: {newPyq.fileName}
                  </div>
                )}
              </div>

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
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs military-font cursor-pointer flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Upload & Save PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PYQs;
