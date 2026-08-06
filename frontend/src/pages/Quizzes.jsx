import React, { useState, useEffect } from 'react';
import { Award, Clock, ArrowRight, Play } from 'lucide-react';
import API from '../services/api';
import QuizPlayer from '../components/quiz/QuizPlayer';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await API.get('/quizzes');
      setQuizzes(res.data);
    } catch (err) {
      console.error('Fetch quizzes error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (activeQuizId) {
    return <QuizPlayer quizId={activeQuizId} onBack={() => setActiveQuizId(null)} />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] military-font uppercase flex items-center gap-2">
          <Award className="w-8 h-8 text-amber-500" /> Subject-wise Speed Quizzes
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Test your speed & accuracy across Defence GK, Mathematics, General English & Science.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[var(--text-secondary)]">Loading Quiz Arsenal...</div>
      ) : quizzes.length === 0 ? (
        <div className="py-16 text-center text-[var(--text-secondary)]">No active quizzes.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="p-6 rounded-2xl glass-card space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold military-font uppercase">
                    {quiz.subject}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" /> {quiz.duration_minutes} Mins
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] military-font">{quiz.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Timed quiz evaluation with instant detailed breakdown</p>
              </div>

              <button
                onClick={() => setActiveQuizId(quiz.id)}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer military-font tracking-wider"
              >
                <Play className="w-4 h-4 fill-white" /> Start Quiz Session
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quizzes;
