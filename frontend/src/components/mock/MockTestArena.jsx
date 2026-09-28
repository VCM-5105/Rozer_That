import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Shield, Flag, Award, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Pause, Play, X, RotateCcw } from 'lucide-react';
import API from '../../services/api';

const MockTestArena = ({ mockId, mockData, onBack }) => {
  const [mock, setMock] = useState(mockData || null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(!mockData);

  useEffect(() => {
    if (mockData) {
      setMock(mockData);
      setTimeRemaining((mockData.durationMinutes || mockData.duration_minutes || 120) * 60);
      setLoading(false);
    } else if (mockId) {
      fetchMock();
    }
  }, [mockId, mockData]);

  useEffect(() => {
    if (!mock || timeRemaining <= 0 || submitted || isPaused) return;

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
  }, [mock, timeRemaining, submitted, isPaused]);

  const fetchMock = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/mocktests/${mockId}`);
      const payload = res.data?.data || res.data;
      setMock(payload);
      if (payload) {
        const mins = payload.durationMinutes || payload.duration_minutes || 120;
        setTimeRemaining(mins * 60);
      }
    } catch (err) {
      console.error('Mock test fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, optionIdx) => {
    if (submitted || isPaused) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const toggleReviewMark = (qId) => {
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmitMock = async () => {
    try {
      const totalMins = mock.durationMinutes || mock.duration_minutes || 120;
      const timeSpent = totalMins * 60 - timeRemaining;
      
      const res = await API.post(`/mocktests/${mockId || 'pyq-test'}/submit`, {
        userAnswers,
        timeSpentSeconds: Math.max(1, timeSpent)
      }).catch(() => null);

      const payload = res?.data?.data || res?.data;
      if (payload && payload.score !== undefined) {
        setResults(payload);
      } else {
        const questionsList = mock.questions || [];
        let correctCount = 0;
        let wrongCount = 0;
        let attemptedCount = 0;
        const posMarks = mock.positiveMarks || mock.positive_marks || 1;
        const negMarks = mock.negativeMarks || mock.negative_marks || 0.33;

        questionsList.forEach((q) => {
          const sel = userAnswers[q.id || q._id];
          if (sel !== undefined) {
            attemptedCount++;
            if (sel === (q.answerIndex ?? q.correctOption)) correctCount++;
            else wrongCount++;
          }
        });

        const score = Math.max(0, Number((correctCount * posMarks - wrongCount * negMarks).toFixed(2)));
        const totalMarks = mock.totalMarks || mock.total_marks || (questionsList.length * posMarks);
        const accuracy = attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;

        setResults({
          score,
          totalMarks,
          attemptedCount,
          correctCount,
          wrongCount,
          accuracy
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Mock evaluation error:', err);
    }
  };

  if (loading) return <div className="py-16 text-center text-[var(--text-secondary)]">Initializing Exam Hall Arena...</div>;

  if (!mock || !mock.questions || mock.questions.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-amber-500 font-bold">Paper Arena Loading Standard Practice Paper...</p>
        <button onClick={onBack} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold military-font">
          Return to Mock Exam List
        </button>
      </div>
    );
  }

  const questionsList = mock.questions || [];
  const currentQ = questionsList[currentIdx] || questionsList[0];
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const hours = Math.floor(minutes / 60);
  const formattedMins = minutes % 60;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-md gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowExitModal(true)} className="p-2 rounded-xl bg-[var(--bg-primary)] hover:bg-red-500/10 text-red-400 border border-[var(--border-color)] transition cursor-pointer" title="Close / Exit Test">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-xl text-[var(--text-primary)] military-font">{mock.title}</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Exam: <span className="text-amber-500 font-bold">{mock.exam}</span> • Correct: +{mock.positiveMarks || mock.positive_marks || 1} • Negative: -{mock.negativeMarks || mock.negative_marks || 0.33}
            </p>
          </div>
        </div>

        {!submitted && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold military-font uppercase flex items-center gap-1.5 transition cursor-pointer border ${
                isPaused
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-amber-500'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4 fill-amber-400" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-extrabold text-lg ${isPaused ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-teal-500/10 border-teal-500/30 text-teal-400'}`}>
              <Clock className={`w-5 h-5 ${!isPaused ? 'animate-pulse' : ''}`} />
              {hours > 0 ? `${String(hours).padStart(2, '0')}:` : ''}{String(formattedMins).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            <button
              onClick={() => setShowExitModal(true)}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs military-font uppercase transition cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {!submitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-lg flex flex-col justify-between min-h-[480px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-4">
                <span className="text-xs font-bold text-teal-500 uppercase tracking-wider">
                  Question {currentIdx + 1} of {questionsList.length} ({currentQ?.section || 'General'})
                </span>
                <button
                  onClick={() => toggleReviewMark(currentQ.id || currentIdx)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    markedForReview[currentQ.id || currentIdx]
                      ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-amber-500'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" /> {markedForReview[currentQ.id || currentIdx] ? 'Marked for Review' : 'Mark for Review'}
                </button>
              </div>

              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
                {currentQ?.question}
              </h3>

              {isPaused ? (
                <div className="py-12 text-center space-y-3 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]">
                  <Pause className="w-12 h-12 text-amber-500 mx-auto" />
                  <h4 className="text-lg font-bold military-font text-[var(--text-primary)]">Test Execution Paused</h4>
                  <p className="text-xs text-[var(--text-secondary)]">Click Resume at the top to continue answering questions.</p>
                  <button onClick={() => setIsPaused(false)} className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs military-font">
                    Resume Exam
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {(currentQ?.options || []).map((opt, optIdx) => {
                    const qKey = currentQ.id || currentIdx;
                    const isSelected = userAnswers[qKey] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(qKey, optIdx)}
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
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl border border-[var(--border-color)] disabled:opacity-40 text-sm font-medium hover:bg-[var(--bg-primary)] cursor-pointer"
              >
                Previous
              </button>

              <div className="flex items-center gap-3">
                {currentIdx < questionsList.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    Next Question <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitMock}
                    className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-lg military-font tracking-wider cursor-pointer"
                  >
                    Submit Test Paper
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-lg space-y-4">
            <h4 className="font-bold text-sm text-[var(--text-primary)] military-font uppercase">Question Palette</h4>
            
            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto pr-1">
              {questionsList.map((q, idx) => {
                const qKey = q.id || idx;
                const isAnswered = userAnswers[qKey] !== undefined;
                const isReview = markedForReview[qKey];
                const isCurrent = idx === currentIdx;

                let bgClass = 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-color)]';
                if (isCurrent) bgClass = 'ring-2 ring-teal-500 border-teal-500 font-bold text-teal-400';
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
              className="w-full py-2.5 mt-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider military-font shadow-md cursor-pointer"
            >
              Finish & Submit Test
            </button>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
          <div className="p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-extrabold text-[var(--text-primary)] military-font uppercase mb-1">
              Official Mock Test Scorecard
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-8">Detailed result breakdown evaluated with standard exam rules</p>

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
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md transition cursor-pointer military-font"
            >
              Back to Mock Test List
            </button>
          </div>
        </motion.div>
      )}

      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase">Close Test Session?</h3>
            <p className="text-xs text-[var(--text-secondary)]">Are you sure you want to close this mock test? Your progress will be saved.</p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] cursor-pointer"
              >
                Continue Test
              </button>
              <button
                onClick={onBack}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs military-font cursor-pointer"
              >
                Close & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockTestArena;
