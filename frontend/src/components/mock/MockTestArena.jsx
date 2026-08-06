import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Shield, Flag, Award, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import API from '../../services/api';
import { useGuestGuard } from '../../context/GuestGuardContext';

const MockTestArena = ({ mockId, onBack }) => {
  const { requireAuth } = useGuestGuard();
  const [mock, setMock] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMock();
  }, [mockId]);

  useEffect(() => {
    if (!mock || timeRemaining <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitMock();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mock, timeRemaining, submitted]);

  const fetchMock = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/mocktests/${mockId}`);
      setMock(res.data);
      setTimeRemaining(res.data.duration_minutes * 60);
    } catch (err) {
      console.error('Mock test fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, optionIdx) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const toggleReviewMark = (qId) => {
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmitMock = async () => {
    requireAuth(async () => {
      try {
        const timeSpent = mock.duration_minutes * 60 - timeRemaining;
        const res = await API.post(`/mocktests/${mockId}/submit`, {
          userAnswers,
          timeSpentSeconds: Math.max(1, timeSpent)
        });
        setResults(res.data);
        setSubmitted(true);
      } catch (err) {
        console.error('Mock evaluation error:', err);
      }
    }, 'submit full mock test and save scorecard in history');
  };

  if (loading) return <div className="py-16 text-center text-[var(--text-secondary)]">Initializing Exam Hall Arena...</div>;

  if (!mock) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Mock test failed to load.</p>
        <button onClick={onBack} className="px-4 py-2 bg-teal-600 text-white rounded-xl">Return to Mock List</button>
      </div>
    );
  }

  const currentQ = mock.questions[currentIdx];
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Exam Header */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl bg-[var(--bg-primary)] hover:bg-teal-500/10 text-teal-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-xl text-[var(--text-primary)] military-font">{mock.title}</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Exam: <span className="text-amber-500 font-semibold">{mock.exam}</span> • Correct: +{mock.positive_marks} • Wrong: -{mock.negative_marks}
            </p>
          </div>
        </div>

        {!submitted && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono font-extrabold text-lg">
            <Clock className="w-5 h-5 animate-pulse" />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        )}
      </div>

      {!submitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Arena */}
          <div className="lg:col-span-3 p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-lg flex flex-col justify-between min-h-[480px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
                <span className="text-xs font-bold text-teal-500 uppercase tracking-wider">
                  Question {currentIdx + 1} of {mock.total_questions} ({currentQ.section || 'General'})
                </span>
                <button
                  onClick={() => toggleReviewMark(currentQ.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    markedForReview[currentQ.id]
                      ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-amber-500'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" /> {markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}
                </button>
              </div>

              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
                {currentQ.question}
              </h3>

              <div className="space-y-3 mb-6">
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQ.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ.id, optIdx)}
                      className={`w-full text-left p-4 rounded-xl border font-medium text-sm transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-teal-500/15 border-teal-500 text-teal-400 font-bold shadow-md'
                          : 'bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-teal-500/50 text-[var(--text-primary)]'
                      }`}
                    >
                      <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${isSelected ? 'border-teal-500 bg-teal-500 text-white' : 'border-[var(--border-color)]'}`}>
                        {isSelected && '✓'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] disabled:opacity-40 text-sm font-medium hover:bg-[var(--bg-primary)]"
              >
                Previous
              </button>

              <div className="flex items-center gap-3">
                {currentIdx < mock.total_questions - 1 ? (
                  <button
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium flex items-center gap-1 shadow-md"
                  >
                    Next Question <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitMock}
                    className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-lg military-font tracking-wider"
                  >
                    Submit Test Paper
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Palette Sidebar */}
          <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-lg space-y-4">
            <h4 className="font-bold text-sm text-[var(--text-primary)] military-font uppercase">Question Palette</h4>
            
            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
              {mock.questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isReview = markedForReview[q.id];
                const isCurrent = idx === currentIdx;

                let bgClass = 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-color)]';
                if (isCurrent) bgClass = 'ring-2 ring-teal-500 border-teal-500 font-bold';
                else if (isReview) bgClass = 'bg-amber-500/20 text-amber-500 border-amber-500/40';
                else if (isAnswered) bgClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold';

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 w-full rounded-lg border text-xs flex items-center justify-center transition cursor-pointer ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-[var(--border-color)] space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500"></span> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500"></span> Marked for Review
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[var(--bg-primary)] border border-[var(--border-color)]"></span> Unvisited
              </div>
            </div>

            <button
              onClick={handleSubmitMock}
              className="w-full py-2.5 mt-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider military-font shadow-md"
            >
              Finish & Submit Test
            </button>
          </div>
        </div>
      ) : (
        /* Scorecard Modal View */
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          <div className="p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-extrabold text-[var(--text-primary)] military-font uppercase mb-1">
              Official Mock Test Scorecard
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-8">Detailed result breakdown evaluated with standard defense rules</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)]">Final Score</p>
                <p className="text-2xl font-extrabold text-teal-500">{results.score} / {results.totalMarks}</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)]">Accuracy</p>
                <p className="text-2xl font-extrabold text-amber-500">{results.accuracy}%</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)]">Correct Answers</p>
                <p className="text-2xl font-extrabold text-emerald-500">+{results.correctCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)]">Wrong Answers</p>
                <p className="text-2xl font-extrabold text-red-500">-{results.wrongCount}</p>
              </div>
            </div>

            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-md transition"
            >
              Back to Mock Test List
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MockTestArena;
