import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Circle, Bookmark, FileText, RotateCcw, ArrowLeft, BookOpen, ExternalLink, Plus, Trash2, X } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import NotesModal from '../components/sheets/NotesModal';

const SheetDetail = () => {
  const { slug } = useParams();
  const { isAdmin, isAuthenticated } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNotesTopic, setActiveNotesTopic] = useState(null);

  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', subject: 'Mathematics', difficulty: 'Medium', notes_content: '' });

  useEffect(() => {
    fetchSheetDetail();
  }, [slug]);

  const fetchSheetDetail = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/sheets/${slug}`);
      const payload = res.data?.data || res.data;
      setData(payload);
    } catch (err) {
      console.error('Fetch sheet detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompletion = async (topicId) => {
    try {
      await API.post(`/sheets/topics/${topicId}/toggle`).catch(() => {});
      setData(prev => {
        if (!prev || !prev.topics) return prev;
        return {
          ...prev,
          topics: prev.topics.map(t => t.id === topicId ? { ...t, isCompleted: !t.isCompleted } : t)
        };
      });
    } catch (err) {
      console.error('Toggle completion error:', err);
    }
  };

  const handleToggleBookmark = async (topicId) => {
    try {
      await API.post(`/sheets/topics/${topicId}/bookmark`).catch(() => {});
      setData(prev => {
        if (!prev || !prev.topics) return prev;
        return {
          ...prev,
          topics: prev.topics.map(t => t.id === topicId ? { ...t, isBookmarked: !t.isBookmarked } : t)
        };
      });
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleIncrementRevision = async (topicId) => {
    try {
      await API.post(`/sheets/topics/${topicId}/revise`).catch(() => {});
      setData(prev => {
        if (!prev || !prev.topics) return prev;
        return {
          ...prev,
          topics: prev.topics.map(t => t.id === topicId ? { ...t, revisionCount: (t.revisionCount || 0) + 1 } : t)
        };
      });
    } catch (err) {
      console.error('Revision increment error:', err);
    }
  };

  const handleSaveNotes = async (notesText) => {
    if (!activeNotesTopic) return;
    try {
      await API.post(`/sheets/topics/${activeNotesTopic.id}/notes`, { notes: notesText }).catch(() => {});
      setData(prev => {
        if (!prev || !prev.topics) return prev;
        return {
          ...prev,
          topics: prev.topics.map(t => t.id === activeNotesTopic.id ? { ...t, userNotes: notesText } : t)
        };
      });
      setActiveNotesTopic(null);
    } catch (err) {
      console.error('Save note error:', err);
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    const sheetId = data?.sheet?.id || slug;
    try {
      await API.post(`/sheets/${sheetId}/topics`, newTopic).catch(() => {
        return API.post('/sheets/topics', { ...newTopic, sheet_id: sheetId });
      });
      setIsAddTopicModalOpen(false);
      setNewTopic({ title: '', subject: 'Mathematics', difficulty: 'Medium', notes_content: '' });
      fetchSheetDetail();
    } catch (err) {
      if (data && Array.isArray(data.topics)) {
        setData(prev => ({
          ...prev,
          topics: [...prev.topics, { ...newTopic, id: Date.now(), isCompleted: false, isBookmarked: false, revisionCount: 0 }]
        }));
      }
      setIsAddTopicModalOpen(false);
      setNewTopic({ title: '', subject: 'Mathematics', difficulty: 'Medium', notes_content: '' });
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Delete topic from sheet?')) return;
    try {
      await API.delete(`/sheets/topics/${topicId}`).catch(() => {});
      if (data && Array.isArray(data.topics)) {
        setData(prev => ({
          ...prev,
          topics: prev.topics.filter(t => t.id !== topicId)
        }));
      }
    } catch (err) {
      console.error('Delete topic error:', err);
    }
  };

  if (loading) return <div className="py-16 text-center text-[var(--text-secondary)]">Loading Roadmap Topics...</div>;

  if (!data) return <div className="py-16 text-center text-red-500">Study Sheet not found.</div>;

  const { sheet = {}, topics = [], completedTopics = 0, totalTopics = 0, percentage = 0 } = data || {};
  const topicList = Array.isArray(topics) ? topics : [];

  return (
    <div className="space-y-8">
      <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
        <Link to="/sheets" className="text-xs font-bold text-teal-500 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to All Study Sheets
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-500 text-xs font-bold military-font uppercase">
              {sheet?.category || 'Defence'} Arsenal
            </span>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] military-font mt-2">{sheet?.title}</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{sheet?.description}</p>
          </div>

          <div className="w-full md:w-64 space-y-1.5 p-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <div className="flex justify-between text-xs font-semibold text-[var(--text-secondary)]">
              <span>Overall Completion</span>
              <span className="text-teal-500 font-bold">{percentage}%</span>
            </div>
            <div className="w-full bg-[var(--bg-card)] h-2.5 rounded-full overflow-hidden border border-[var(--border-color)]">
              <div className="bg-teal-500 h-full transition-all" style={{ width: `${percentage}%` }} />
            </div>
            <p className="text-[10px] text-right text-[var(--text-secondary)] font-mono">{completedTopics} / {totalTopics} Completed</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
          <h2 className="font-bold text-xl text-[var(--text-primary)] military-font uppercase">
            Topic Execution Checklist ({topicList.length} Topics)
          </h2>

          {isAdmin && (
            <button
              onClick={() => setIsAddTopicModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer military-font uppercase"
            >
              <Plus className="w-4 h-4" /> Add Topic & Notes
            </button>
          )}
        </div>

        <div className="space-y-3">
          {topicList.map((topic, index) => (
            <div
              key={topic.id}
              className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                topic.isCompleted
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-teal-500/50'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <button
                  onClick={() => handleToggleCompletion(topic.id)}
                  className="mt-0.5 text-teal-500 hover:scale-110 transition cursor-pointer"
                  title="Toggle Topic Completion"
                >
                  {topic.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-6 h-6 text-[var(--text-secondary)] hover:text-teal-500" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-[var(--text-primary)]">
                      {index + 1}. {topic.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-500">
                      {topic.subject}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        topic.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : topic.difficulty === 'Hard'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {topic.difficulty}
                    </span>
                  </div>

                  {topic.notes_content && (
                    <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] p-2.5 rounded-lg border border-[var(--border-color)] leading-relaxed">
                      💡 <strong>Study Note:</strong> {topic.notes_content}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                <button
                  onClick={() => handleIncrementRevision(topic.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:border-teal-500 hover:text-teal-500 transition cursor-pointer"
                  title="Increment Revision Counter"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revised: <strong className="text-teal-500">{topic.revisionCount || 0}x</strong></span>
                </button>

                <button
                  onClick={() => setActiveNotesTopic(topic)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    topic.userNotes
                      ? 'bg-teal-500/20 border-teal-500 text-teal-400 font-bold'
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-teal-500'
                  }`}
                  title="Personal Notes"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{topic.userNotes ? 'Edit Notes' : 'Notes'}</span>
                </button>

                <button
                  onClick={() => handleToggleBookmark(topic.id)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    topic.isBookmarked
                      ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-amber-500'
                  }`}
                  title="Bookmark Topic"
                >
                  <Bookmark className="w-4 h-4" />
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteTopic(topic.id)}
                    className="p-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                    title="Delete Topic (Admin)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeNotesTopic && (
        <NotesModal
          isOpen={!!activeNotesTopic}
          onClose={() => setActiveNotesTopic(null)}
          topicTitle={activeNotesTopic.title}
          initialNotes={activeNotesTopic.userNotes}
          onSave={handleSaveNotes}
        />
      )}

      {isAddTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase">Add Topic & Study Note</h3>
              <button onClick={() => setIsAddTopicModalOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTopic} className="space-y-4">
              <input
                type="text"
                required
                placeholder=""
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder=""
                  value={newTopic.subject}
                  onChange={(e) => setNewTopic({ ...newTopic, subject: e.target.value })}
                  className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
                />

                <select
                  value={newTopic.difficulty}
                  onChange={(e) => setNewTopic({ ...newTopic, difficulty: e.target.value })}
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
                value={newTopic.notes_content}
                onChange={(e) => setNewTopic({ ...newTopic, notes_content: e.target.value })}
                className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none text-[var(--text-primary)]"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTopicModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs military-font cursor-pointer"
                >
                  Add Topic & Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SheetDetail;
