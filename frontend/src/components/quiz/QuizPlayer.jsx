import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import API from '../../services/api';
import { useGuestGuard } from '../../context/GuestGuardContext';

const QuizPlayer = ({ quizId, onBack }) => {
  const { requireAuth } = useGuestGuard();
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!quiz || timeRemaining <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, timeRemaining, submitted]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/quizzes/${quizId}`);
      setQuiz(res.data);
      setTimeRemaining(res.data.duration_minutes * 60);
    } catch (err) {
      console.error('Quiz fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIdx) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleSubmitQuiz = async () => {
    requireAuth(async () => {
      try {
        const timeSpent = quiz.duration_minutes * 60 - timeRemaining;
        const res = await API.post(`/quizzes/${quizId}/submit`, {
          userAnswers,
          timeSpentSeconds: Math.max(1, timeSpent)
        });
        setResults(res.data);
        setSubmitted(true);
      } catch (err) {
        console.error('Quiz evaluation error:', err);
      }
    }, 'record quiz results in your history');
  };

  if (loading) {
    return <div className="py-16 text-center text-[var(--text-secondary)]">Loading Quiz Arsenal...</div>;
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Quiz failed to load.</p>
        <button onClick={onBack} className="px-4 py-2 bg-teal-600 text-white rounded-xl">Back to Quizzes</button>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIdx];
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm">
        <div>
          <button onClick={onBack} className="text-xs text-teal-500 font-semibold mb-1 flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-3 h-3" /> Back to Quizzes
          </button>
          <h2 className="font-bold text-lg text-[var(--text-primary)] military-font">{quiz.title}</h2>
        </div>

        {!submitted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 animate-pulse" />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Quiz Body */}
      {!submitted ? (
        <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-lg">
          {/* Progress Indicator */}
          <div className="flex justify-between items-center text-xs font-semibold text-[var(--text-secondary)] mb-4">
            <span>Question {currentIdx + 1} of {quiz.total_questions}</span>
            <span>Subject: {quiz.subject}</span>
          </div>

          <div className="w-full bg-[var(--bg-primary)] h-2 rounded-full mb-6 overflow-hidden">
            <div
              className="bg-teal-500 h-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / quiz.total_questions) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">
            {currentQ.question}
          </h3>

          {/* Options Grid */}
          <div className="space-y-3 mb-8">
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

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((prev) => prev - 1)}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] disabled:opacity-40 text-sm font-medium hover:bg-[var(--bg-primary)]"
            >
              Previous
            </button>

            {currentIdx < quiz.total_questions - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium flex items-center gap-1 shadow-md"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-lg military-font tracking-wider"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="p-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-[var(--text-primary)] military-font uppercase mb-1">
              Quiz Completed Cadet!
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Here is your performance breakdown</p>

            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)]">Score</p>
                <p className="text-2xl font-bold text-teal-500">{results.score} / {results.totalQuestions}</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)]">Accuracy</p>
                <p className="text-2xl font-bold text-amber-500">{results.accuracy}%</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <p className="text-xs text-[var(--text-secondary)]">Correct</p>
                <p className="text-2xl font-bold text-emerald-500">{results.correctCount}</p>
              </div>
            </div>

            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-md transition"
            >
              Continue Preparation
            </button>
          </div>

          {/* Detailed Explanations */}
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-lg space-y-6">
            <h4 className="font-bold text-lg text-[var(--text-primary)] military-font uppercase border-b border-[var(--border-color)] pb-3">
              Detailed Question Analysis & Solutions
            </h4>

            {results.breakdown.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-3">
                <div className="flex items-start justify-between">
                  <h5 className="font-semibold text-sm text-[var(--text-primary)]">
                    Q{idx + 1}. {item.question}
                  </h5>
                  {item.isCorrect ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-500 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-red-500 font-bold px-2 py-0.5 rounded bg-red-500/10">
                      <XCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  {item.options.map((opt, oIdx) => {
                    let style = 'text-[var(--text-secondary)]';
                    if (oIdx === item.correctOption) style = 'text-emerald-400 font-bold';
                    else if (oIdx === item.selectedOption && !item.isCorrect) style = 'text-red-400 line-through';

                    return (
                      <div key={oIdx} className={`p-2 rounded ${oIdx === item.correctOption ? 'bg-emerald-500/10 border border-emerald-500/30' : ''}`}>
                        {String.fromCharCode(65 + oIdx)}. {opt} {oIdx === item.correctOption && ' (Correct Answer)'}
                      </div>
                    );
                  })}
                </div>

                {item.explanation && (
                  <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300">
                    <span className="font-bold text-teal-400">Explanation:</span> {item.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuizPlayer;
