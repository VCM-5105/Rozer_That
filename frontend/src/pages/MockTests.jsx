import React, { useState, useEffect } from 'react';
import { Shield, Clock, Award, Play } from 'lucide-react';
import API from '../services/api';
import MockTestArena from '../components/mock/MockTestArena';

const MockTests = () => {
  const [mocks, setMocks] = useState([]);
  const [activeMockId, setActiveMockId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMocks();
  }, []);

  const fetchMocks = async () => {
    try {
      setLoading(true);
      const res = await API.get('/mocktests');
      setMocks(res.data);
    } catch (err) {
      console.error('Fetch mock tests error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (activeMockId) {
    return <MockTestArena mockId={activeMockId} onBack={() => setActiveMockId(null)} />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] military-font uppercase flex items-center gap-2">
          <Shield className="w-8 h-8 text-teal-500" /> Full-Length Defence Mock Exams
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Real exam atmosphere with timer, negative marking rules (+2.5 / -0.83), question palette, and detailed scorecard.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[var(--text-secondary)]">Loading Mock Test Hall...</div>
      ) : mocks.length === 0 ? (
        <div className="py-16 text-center text-[var(--text-secondary)]">No mock tests available currently.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mocks.map((mock) => (
            <div key={mock.id} className="p-6 rounded-2xl glass-card space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-500 text-xs font-bold military-font uppercase">
                    {mock.exam} Full Mock
                  </span>
                  <span className="text-xs font-mono text-amber-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {mock.duration_minutes} Minutes
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] military-font">{mock.title}</h3>

                <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                  <div>
                    <p className="text-[var(--text-secondary)]">Total Marks</p>
                    <p className="font-bold text-[var(--text-primary)]">{mock.total_marks}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-secondary)]">Correct Mark</p>
                    <p className="font-bold text-emerald-500">+{mock.positive_marks}</p>
                  </div>
                  <div>
                    <p className="text-[var(--text-secondary)]">Negative Mark</p>
                    <p className="font-bold text-red-500">-{mock.negative_marks}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveMockId(mock.id)}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer military-font tracking-wider"
              >
                <Play className="w-4 h-4 fill-white" /> Enter Mock Test Hall
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MockTests;
