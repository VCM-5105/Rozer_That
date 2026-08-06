import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Circle, Bookmark, FileText, RotateCcw, ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import API from '../services/api';
import { useGuestGuard } from '../context/GuestGuardContext';
import NotesModal from '../components/sheets/NotesModal';

const SheetDetail = () => {
  const { slug } = useParams();
  const { requireAuth } = useGuestGuard();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNotesTopic, setActiveNotesTopic] = useState(null);

  useEffect(() => {
    fetchSheetDetail();
  }, [slug]);

  const fetchSheetDetail = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/sheets/${slug}`);
      setData(res.data);
    } catch (err) {
      console.error('Fetch sheet detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCompletion = (topicId) => {
    requireAuth(async () => {
      try {
        await API.post(`/sheets/topics/${topicId}/toggle`);
        fetchSheetDetail();
      } catch (err) {
        console.error('Toggle completion error:', err);
      }
    }, 'mark topic completed');
  };

  const handleToggleBookmark = (topicId) => {
    requireAuth(async () => {
      try {
        await API.post(`/sheets/topics/${topicId}/bookmark`);
        fetchSheetDetail();
      } catch (err) {
        console.error('Bookmark error:', err);
      }
    }, 'bookmark topic for revision');
  };

  const handleIncrementRevision = (topicId) => {
    requireAuth(async () => {
      try {
        await API.post(`/sheets/topics/${topicId}/revise`);
        fetchSheetDetail();
      } catch (err) {
        console.error('Revision increment error:', err);
      }
    }, 'track revision counts');
  };

  const handleSaveNotes = async (notesText) => {
    if (!activeNotesTopic) return;
    try {
      await API.post(`/sheets/topics/${activeNotesTopic.id}/notes`, { notes: notesText });
      fetchSheetDetail();
    } catch (err) {
      console.error('Save note error:', err);
    }
  };

  if (loading) return <div className="py-16 text-center text-[var(--text-secondary)]">Loading Roadmap Topics...</div>;

  if (!data) return <div className="py-16 text-center text-red-500">Study Sheet not found.</div>;

  const { sheet, topics, completedTopics, totalTopics, percentage } = data;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="p-8 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
        <Link to="/sheets" className="text-xs font-bold text-teal-500 hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to All Study Sheets
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="px-3 py-1 rounded-lg bg-teal-500/10 text-teal-500 text-xs font-bold military-font uppercase">
              {sheet.category} Arsenal
            </span>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)] military-font mt-2">{sheet.title}</h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{sheet.description}</p>
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

      {/* Topics List Table View */}
      <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-xl space-y-4">
        <h2 className="font-bold text-xl text-[var(--text-primary)] military-font uppercase border-b border-[var(--border-color)] pb-3">
          Topic Execution Checklist ({topics.length} Topics)
        </h2>

        <div className="space-y-3">
          {topics.map((topic, index) => (
            <div
              key={topic.id}
              className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                topic.isCompleted
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-teal-500/50'
              }`}
            >
              {/* Left Side Checkbox & Details */}
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
                    <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-card)] p-2 rounded-lg border border-[var(--border-color)] italic">
                      💡 {topic.notes_content}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Side Tools: Revision, Notes, Bookmarks */}
              <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                {/* Revision Counter */}
                <button
                  onClick={() => handleIncrementRevision(topic.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:border-teal-500 hover:text-teal-500 transition cursor-pointer"
                  title="Increment Revision Counter"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revised: <strong className="text-teal-500">{topic.revisionCount}x</strong></span>
                </button>

                {/* Personal Notes */}
                <button
                  onClick={() => {
                    requireAuth(() => setActiveNotesTopic(topic), 'save personal notes');
                  }}
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

                {/* Bookmark Toggle */}
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
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Modal */}
      {activeNotesTopic && (
        <NotesModal
          isOpen={!!activeNotesTopic}
          onClose={() => setActiveNotesTopic(null)}
          topicTitle={activeNotesTopic.title}
          initialNotes={activeNotesTopic.userNotes}
          onSave={handleSaveNotes}
        />
      )}
    </div>
  );
};

export default SheetDetail;
