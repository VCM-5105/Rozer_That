import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, Tag, Search } from 'lucide-react';
import API from '../services/api';

const CurrentAffairs = () => {
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, [category]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/news?category=${category}`);
      setNews(res.data);
    } catch (err) {
      console.error('Fetch news error:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Defence', 'National', 'International', 'Economy', 'Science', 'Sports'];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] military-font uppercase flex items-center gap-2">
          <Newspaper className="w-8 h-8 text-teal-500" /> Daily Defence Current Affairs
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          High-yield daily news digest categorized for NDA GAT, CDS General Knowledge, and SSB Current Events.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              category === cat
                ? 'bg-teal-600 text-white font-bold shadow-md'
                : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-teal-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News List */}
      {loading ? (
        <div className="py-16 text-center text-[var(--text-secondary)]">Loading Current Affairs Digest...</div>
      ) : news.length === 0 ? (
        <div className="py-16 text-center text-[var(--text-secondary)]">No news available under {category}.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((item) => (
            <div key={item.id} className="p-6 rounded-2xl glass-card space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-500 font-bold military-font uppercase">
                  {item.category}
                </span>
                <span className="text-[var(--text-secondary)] flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-amber-500" /> {item.date}
                </span>
              </div>

              <h3 className="text-xl font-bold text-[var(--text-primary)] military-font">{item.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrentAffairs;
