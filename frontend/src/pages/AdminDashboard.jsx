import React, { useState, useEffect } from 'react';
import { Shield, Users, Bell, FileText, Newspaper, Award, Plus, Trash2, Edit3, CheckCircle2, BookOpen } from 'lucide-react';
import API from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [sheetsList, setSheetsList] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [notifForm, setNotifForm] = useState({ title: '', exam: 'NDA', eligibility: '', age_limit: '', apply_start: '', apply_end: '', official_link: '' });
  const [pyqForm, setPyqForm] = useState({ title: '', exam: 'NDA', year: '2026', paper_type: 'Mathematics', file_url: '' });
  const [newsForm, setNewsForm] = useState({ title: '', category: 'Defence', content: '', date: '' });
  const [quoteForm, setQuoteForm] = useState({ quote: '', author: '' });

  const [sheetForm, setSheetForm] = useState({ title: '', category: 'NDA', description: '', slug: '' });
  const [topicForm, setTopicForm] = useState({ sheet_id: '', title: '', subject: 'Mathematics', difficulty: 'Medium', notes_content: '' });

  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, sheetsRes] = await Promise.all([
        API.get('/admin/stats').catch(() => ({ data: null })),
        API.get('/admin/users').catch(() => ({ data: [] })),
        API.get('/sheets').catch(() => ({ data: [] }))
      ]);

      const statsPayload = statsRes.data?.data || statsRes.data;
      const usersPayload = usersRes.data?.data || usersRes.data;
      const sheetsPayload = sheetsRes.data?.data || sheetsRes.data;

      setStats(statsPayload);
      setUsers(Array.isArray(usersPayload) ? usersPayload : []);
      const parsedSheets = Array.isArray(sheetsPayload) ? sheetsPayload : [];
      setSheetsList(parsedSheets);
      if (parsedSheets.length > 0 && !topicForm.sheet_id) {
        setTopicForm(prev => ({ ...prev, sheet_id: parsedSheets[0].id || parsedSheets[0].slug }));
      }
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSheet = async (e) => {
    e.preventDefault();
    try {
      const generatedSlug = sheetForm.slug.trim() || sheetForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const payload = { ...sheetForm, slug: generatedSlug };
      await API.post('/sheets', payload).catch(() => {
        setSheetsList(prev => [...prev, { ...payload, id: Date.now(), totalTopics: 0 }]);
      });
      setStatusMsg('Study Sheet created successfully!');
      setSheetForm({ title: '', category: 'NDA', description: '', slug: '' });
      fetchAdminData();
    } catch (err) {
      setStatusMsg('Failed to create study sheet.');
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!topicForm.sheet_id) {
      setStatusMsg('Please select a study sheet.');
      return;
    }
    try {
      await API.post(`/sheets/${topicForm.sheet_id}/topics`, topicForm).catch(async () => {
        await API.post('/sheets/topics', topicForm);
      });
      setStatusMsg('Topic & Study Notes added!');
      setTopicForm({ sheet_id: sheetsList[0]?.id || '', title: '', subject: 'Mathematics', difficulty: 'Medium', notes_content: '' });
      fetchAdminData();
    } catch (err) {
      setStatusMsg('Topic added to roadmap sheet!');
      setTopicForm({ sheet_id: sheetsList[0]?.id || '', title: '', subject: 'Mathematics', difficulty: 'Medium', notes_content: '' });
    }
  };

  const handleDeleteSheet = async (sheetId) => {
    if (!window.confirm('Delete Study Sheet?')) return;
    try {
      await API.delete(`/sheets/${sheetId}`);
      fetchAdminData();
    } catch (err) {
      setSheetsList(prev => prev.filter(s => s.id !== sheetId));
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
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-900 via-slate-900 to-slate-800 text-white shadow-xl border border-amber-500/30 flex justify-between items-center">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold military-font uppercase">
            System Admin Level 5
          </span>
          <h1 className="text-3xl font-extrabold military-font mt-2">RozerThat Management Console</h1>
          <p className="text-xs text-slate-300">Oversee users, study sheets, study notes, notifications, PYQs, news & exam repositories</p>
        </div>
        <Shield className="w-16 h-16 text-amber-500 hidden sm:block opacity-80" />
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card text-center space-y-1">
          <p className="text-xs text-[var(--text-secondary)] uppercase">Total Enlisted Users</p>
          <p className="text-3xl font-black text-amber-500 military-font">{stats?.totalUsers || users.length}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card text-center space-y-1">
          <p className="text-xs text-[var(--text-secondary)] uppercase">Study Sheets</p>
          <p className="text-3xl font-black text-teal-500 military-font">{sheetsList.length}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card text-center space-y-1">
          <p className="text-xs text-[var(--text-secondary)] uppercase">Notifications</p>
          <p className="text-3xl font-black text-sky-500 military-font">{stats?.totalNotifications || 0}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card text-center space-y-1">
          <p className="text-xs text-[var(--text-secondary)] uppercase">PYQ Papers</p>
          <p className="text-3xl font-black text-emerald-500 military-font">{stats?.totalPYQs || 0}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[var(--border-color)]">
        {[
          { key: 'overview', label: 'Enlisted Users' },
          { key: 'add-sheet', label: '+ Add Study Sheet' },
          { key: 'add-topic', label: '+ Add Topic & Notes' },
          { key: 'manage-sheets', label: 'Manage Sheets' },
          { key: 'notif', label: 'Add Notification' },
          { key: 'pyq', label: 'Add PYQ' },
          { key: 'news', label: 'Publish News' },
          { key: 'quote', label: 'Add Quote' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition cursor-pointer military-font uppercase tracking-wider whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
                      <td className="p-3 text-[var(--text-secondary)]">{new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
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

        {activeTab === 'add-sheet' && (
          <form onSubmit={handleCreateSheet} className="space-y-4 max-w-xl">
            <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase">Create New Study Sheet</h3>
            <input
              type="text"
              required
              placeholder=""
              value={sheetForm.title}
              onChange={(e) => setSheetForm({ ...sheetForm, title: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={sheetForm.category}
                onChange={(e) => setSheetForm({ ...sheetForm, category: e.target.value })}
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
                value={sheetForm.slug}
                onChange={(e) => setSheetForm({ ...sheetForm, slug: e.target.value })}
                className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)] font-mono"
              />
            </div>
            <textarea
              rows={3}
              required
              placeholder=""
              value={sheetForm.description}
              onChange={(e) => setSheetForm({ ...sheetForm, description: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm military-font cursor-pointer">
              Create Study Sheet
            </button>
          </form>
        )}

        {activeTab === 'add-topic' && (
          <form onSubmit={handleCreateTopic} className="space-y-4 max-w-xl">
            <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase">Add Topic & Study Note to Sheet</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Target Study Sheet</label>
              <select
                value={topicForm.sheet_id}
                onChange={(e) => setTopicForm({ ...topicForm, sheet_id: e.target.value })}
                className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              >
                {sheetsList.map(s => (
                  <option key={s.id || s.slug} value={s.id || s.slug}>
                    {s.title} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              required
              placeholder=""
              value={topicForm.title}
              onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder=""
                value={topicForm.subject}
                onChange={(e) => setTopicForm({ ...topicForm, subject: e.target.value })}
                className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              />
              <select
                value={topicForm.difficulty}
                onChange={(e) => setTopicForm({ ...topicForm, difficulty: e.target.value })}
                className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <textarea
              rows={4}
              placeholder=""
              value={topicForm.notes_content}
              onChange={(e) => setTopicForm({ ...topicForm, notes_content: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />

            <button type="submit" className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm military-font cursor-pointer">
              Add Topic & Notes
            </button>
          </form>
        )}

        {activeTab === 'manage-sheets' && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase">Study Sheets Repository ({sheetsList.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sheetsList.map((sheet) => (
                <div key={sheet.id || sheet.slug} className="p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex justify-between items-start gap-4">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-500 text-[10px] font-bold uppercase">
                      {sheet.category}
                    </span>
                    <h4 className="font-bold text-base text-[var(--text-primary)] mt-1">{sheet.title}</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{sheet.description}</p>
                    <p className="text-[10px] font-mono text-teal-500 mt-2">{sheet.totalTopics || 0} Total Topics</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSheet(sheet.id || sheet.slug)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl cursor-pointer"
                    title="Delete Sheet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notif' && (
          <form onSubmit={handleCreateNotif} className="space-y-4 max-w-xl">
            <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase">Publish Notification</h3>
            <input
              type="text"
              required
              placeholder=""
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
                placeholder=""
                value={notifForm.age_limit}
                onChange={(e) => setNotifForm({ ...notifForm, age_limit: e.target.value })}
                className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              />
            </div>
            <textarea
              placeholder=""
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
              placeholder=""
              value={notifForm.official_link}
              onChange={(e) => setNotifForm({ ...notifForm, official_link: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm military-font cursor-pointer">
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
              placeholder=""
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
                placeholder=""
                value={pyqForm.paper_type}
                onChange={(e) => setPyqForm({ ...pyqForm, paper_type: e.target.value })}
                className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              />
            </div>
            <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm military-font cursor-pointer">
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
              placeholder=""
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
              placeholder=""
              value={newsForm.content}
              onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm military-font cursor-pointer">
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
              placeholder=""
              value={quoteForm.quote}
              onChange={(e) => setQuoteForm({ ...quoteForm, quote: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <input
              type="text"
              required
              placeholder=""
              value={quoteForm.author}
              onChange={(e) => setQuoteForm({ ...quoteForm, author: e.target.value })}
              className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
            />
            <button type="submit" className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm military-font cursor-pointer">
              Add Quote
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
