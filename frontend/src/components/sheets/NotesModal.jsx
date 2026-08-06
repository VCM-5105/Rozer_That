import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FileText } from 'lucide-react';

const NotesModal = ({ isOpen, onClose, topicTitle, initialNotes, onSave }) => {
  const [notes, setNotes] = useState(initialNotes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(initialNotes || '');
  }, [initialNotes, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave(notes);
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-4">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-teal-500" /> Personal Notes
            </h3>
            <button onClick={onClose} className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-[var(--text-secondary)] mb-3 font-semibold">
            Topic: <span className="text-teal-500">{topicTitle}</span>
          </p>

          <textarea
            rows={6}
            placeholder="Jot down key formulas, shortcuts, trick concepts, or doubts for revision..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-sm outline-none focus:border-teal-500 text-[var(--text-primary)] resize-none"
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--border-color)] hover:bg-[var(--bg-primary)] text-[var(--text-primary)] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotesModal;
