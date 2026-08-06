import React, { useState, useEffect } from 'react';
import { Bell, Calendar, ExternalLink, Download, ShieldAlert, CheckCircle2 } from 'lucide-react';
import API from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [examFilter, setExamFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [examFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/notifications?exam=${examFilter}`);
      setNotifications(res.data);
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] military-font uppercase flex items-center gap-2">
          <Bell className="w-8 h-8 text-amber-500" /> Defence Exam Notifications
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Official recruitment circulars, age limits, eligibility criteria, application timelines & downloadable PDF files.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
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
            {exam} Notifications
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="py-16 text-center text-[var(--text-secondary)]">Loading Defence Circulars...</div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center text-[var(--text-secondary)]">No notifications available for {examFilter}.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-6 rounded-2xl glass-card space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold military-font uppercase">
                    {notif.exam} Official Notice
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" /> Apply: {notif.apply_start} to {notif.apply_end}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] military-font">{notif.title}</h3>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                    <span className="font-bold text-[var(--text-primary)]">Eligibility: </span>
                    <span className="text-[var(--text-secondary)]">{notif.eligibility || 'Refer Official Notification'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                    <span className="font-bold text-[var(--text-primary)]">Age Bracket: </span>
                    <span className="text-[var(--text-secondary)]">{notif.age_limit || 'As per commission guidelines'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex items-center gap-3">
                {notif.official_link && (
                  <a
                    href={notif.official_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium text-center flex items-center justify-center gap-1.5 shadow-md transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Official Portal
                  </a>
                )}

                {notif.pdf_url && notif.pdf_url !== '#' && (
                  <a
                    href={notif.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] hover:border-teal-500 flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-500" /> Download PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
