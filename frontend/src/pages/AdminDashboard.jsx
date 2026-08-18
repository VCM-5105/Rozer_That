import React, { useState, useEffect } from 'react';
import { Shield, Users, Bell, FileText, Newspaper, Award, Plus, Trash2, Edit3, CheckCircle2 } from 'lucide-react';
import API from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Quick Form States
  const [notifForm, setNotifForm] = useState({ title: '', exam: 'NDA', eligibility: '', age_limit: '', apply_start: '', apply_end: '', official_link: '' });
  const [pyqForm, setPyqForm] = useState({ title: '', exam: 'NDA', year: '2026', paper_type: 'Mathematics', file_url: '' });
  const [newsForm, setNewsForm] = useState({ title: '', category: 'Defence', content: '', date: '' });
  const [quoteForm, setQuoteForm] = useState({ quote: '', author: '' });

  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotif = async (e) => {
    e.preventDefault();
    try {
      await API.post('/notifications', notifForm);
      setStatusMsg('Notification published!');
      setNotifForm({ title: '', exam: 'NDA', eligibility: '', age_limit: '', apply_start: '', apply_end: '', official_link: '' });
      fetchAdminData();
    } catch (err) {
      setStatusMsg('Failed to publish notification.');
    }
  };

  const handleCreatePYQ = async (e) => {
    e.preventDefault();
    try {
      await API.post('/pyqs', pyqForm);
      setStatusMsg('PYQ paper created!');
      setPyqForm({ title: '', exam: 'NDA', year: '2026', paper_type: 'Mathematics', file_url: '' });
      fetchAdminData();
    } catch (err) {
      setStatusMsg('Failed to create PYQ.');
    }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    try {
      await API.post('/news', newsForm);
      setStatusMsg('Article published!');
      setNewsForm({ title: '', category: 'Defence', content: '', date: '' });
      fetchAdminData();
    } catch (err) {
      setStatusMsg('Failed to publish article.');
    }
  };

  const handleCreateQuote = async (e) => {
    e.preventDefault();
    try {
      await API.post('/quotes', quoteForm);
      setStatusMsg('Quote added to pool!');
      setQuoteForm({ quote: '', author: '' });
      fetchAdminData();
    } catch (err) {
      setStatusMsg('Failed to add quote.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete user?')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      fetchAdminData();
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  if (loading) return <div className="py-16 text-center text-[var(--text-secondary)]">Loading Commander Admin Operations...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-900 via-slate-900 to-slate-800 text-white shadow-xl border border-amber-500/30 flex justify-between items-center">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold military-font uppercase">
            System Admin Level 5
          </span>
          <h1 className="text-3xl font-extrabold military-font mt-2">RozerThat Management Console</h1>
          <p className="text-xs text-slate-300">Oversee users, study sheets, notifications, PYQs, news & exam repositories</p>
        </div>
        <Shield className="w-16 h-16 text-amber-500 hidden sm:block opacity-80" />
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {statusMsg}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card text-center space-y-1">
          <p className="text-xs text-[var(--text-secondary)] uppercase">Total Enlisted Users</p>
          <p className="text-3xl font-black text-amber-500 military-font">{stats?.totalUsers}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card text-center space-y-1">
          <p className="text-xs text-[var(--text-secondary)] uppercase">Study Sheets</p>
          <p className="text-3xl font-black text-teal-500 military-font">{stats?.totalSheets}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card text-center space-y-1">
          <p className="text-xs text-[var(--text-secondary)] uppercase">Notifications</p>
          <p className="text-3xl font-black text-sky-500 military-font">{stats?.totalNotifications}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card text-center space-y-1">
          <p className="text-xs text-[var(--text-secondary)] uppercase">PYQ Papers</p>
          <p className="text-3xl font-black text-emerald-500 military-font">{stats?.totalPYQs}</p>
        </div>
      </div>

      
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--border-color)]">
        {[
          { key: 'overview', label: 'Enlisted Users' },
          { key: 'notif', label: 'Add Notification' },
          { key: 'pyq', label: 'Add PYQ' },
          { key: 'news', label: 'Publish News' },
          { key: 'quote', label: 'Add Quote' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition cursor-pointer military-font uppercase tracking-wider ${
              activeTab === tab.key
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase">User Directory ({users.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] uppercase font-semibold">
                    <th className="p-3">ID</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Joined Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--bg-primary)]">
                      <td className="p-3 font-mono">{u.id}</td>
                      <td className="p-3 font-bold text-[var(--text-primary)]">{u.username}</td>
                      <td className="p-3 text-[var(--text-secondary)]">{u.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-teal-500/10 text-teal-500'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--text-secondary)]">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-right">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(u.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'notif' && (
          <form onSubmit={handleCreateNotif} className="space-y-4 max-w-xl">
            <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase">Publish Defence Notification</h3>
            <input
              type="text"
              required
              placeholder="Title (e.g. UPSC NDA II 2026 Notification)"
              value={notifForm.title}
              onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={notifForm.exam}
                onChange={(e) => setNotifForm({ ...notifForm, exam: e.target.value })}
                className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              >
                <option value="NDA">NDA</option>
                <option value="CDS">CDS</option>
                <option value="AFCAT">AFCAT</option>
                <option value="CAPF">CAPF</option>
              </select>
              <input
                type="text"
                placeholder="Age Bracket (e.g. 16.5 - 19.5 yrs)"
                value={notifForm.age_limit}
                onChange={(e) => setNotifForm({ ...notifForm, age_limit: e.target.value })}
                className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              />
            </div>
            <textarea
              placeholder="Eligibility criteria summary..."
              value={notifForm.eligibility}
              onChange={(e) => setNotifForm({ ...notifForm, eligibility: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={notifForm.apply_start}
                onChange={(e) => setNotifForm({ ...notifForm, apply_start: e.target.value })}
                className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              />
              <input
                type="date"
                value={notifForm.apply_end}
                onChange={(e) => setNotifForm({ ...notifForm, apply_end: e.target.value })}
                className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              />
            </div>
            <input
              type="text"
              placeholder="Official Link URL (https://...)"
              value={notifForm.official_link}
              onChange={(e) => setNotifForm({ ...notifForm, official_link: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm military-font">
              Publish Circular
            </button>
          </form>
        )}

        {activeTab === 'pyq' && (
          <form onSubmit={handleCreatePYQ} className="space-y-4 max-w-xl">
            <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase">Add PYQ Paper</h3>
            <input
              type="text"
              required
              placeholder="Title (e.g. NDA I 2026 Mathematics Paper)"
              value={pyqForm.title}
              onChange={(e) => setPyqForm({ ...pyqForm, title: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-3 gap-4">
              <select
                value={pyqForm.exam}
                onChange={(e) => setPyqForm({ ...pyqForm, exam: e.target.value })}
                className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              >
                <option value="NDA">NDA</option>
                <option value="CDS">CDS</option>
                <option value="AFCAT">AFCAT</option>
                <option value="CAPF">CAPF</option>
              </select>
              <input
                type="number"
                value={pyqForm.year}
                onChange={(e) => setPyqForm({ ...pyqForm, year: e.target.value })}
                className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              />
              <input
                type="text"
                placeholder="Type (e.g. Maths, GAT)"
                value={pyqForm.paper_type}
                onChange={(e) => setPyqForm({ ...pyqForm, paper_type: e.target.value })}
                className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              />
            </div>
            <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm military-font">
              Create PYQ Record
            </button>
          </form>
        )}

        {activeTab === 'news' && (
          <form onSubmit={handleCreateNews} className="space-y-4 max-w-xl">
            <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase">Publish Current Affairs Article</h3>
            <input
              type="text"
              required
              placeholder="Article Headline"
              value={newsForm.title}
              onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <select
              value={newsForm.category}
              onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            >
              <option value="Defence">Defence</option>
              <option value="National">National</option>
              <option value="International">International</option>
              <option value="Economy">Economy</option>
              <option value="Science">Science</option>
              <option value="Sports">Sports</option>
            </select>
            <textarea
              rows={4}
              required
              placeholder="Article content summary..."
              value={newsForm.content}
              onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm military-font">
              Publish Digest
            </button>
          </form>
        )}

        {activeTab === 'quote' && (
          <form onSubmit={handleCreateQuote} className="space-y-4 max-w-xl">
            <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase">Add Motivational Quote</h3>
            <textarea
              rows={3}
              required
              placeholder="Quote text..."
              value={quoteForm.quote}
              onChange={(e) => setQuoteForm({ ...quoteForm, quote: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <input
              type="text"
              required
              placeholder="Author (e.g. Captain Vikram Batra, PVC)"
              value={quoteForm.author}
              onChange={(e) => setQuoteForm({ ...quoteForm, author: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm military-font">
              Add Quote
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
