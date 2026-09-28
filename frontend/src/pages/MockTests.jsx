import React, { useState, useEffect } from 'react';
import { Shield, Clock, Award, Play, FileText, CheckCircle2 } from 'lucide-react';
import API from '../services/api';
import MockTestArena from '../components/mock/MockTestArena';

const SAMPLE_CDS_MOCK = {
  id: 'cds-full-mock-1',
  title: 'UPSC CDS II 2026 Full General Knowledge & English Test',
  exam: 'CDS',
  durationMinutes: 120,
  totalMarks: 100,
  positiveMarks: 0.83,
  negativeMarks: 0.27,
  questions: [
    {
      id: 'q1',
      section: 'General Knowledge',
      question: 'Which of the following passes connects Srinagar with Leh in Jammu and Kashmir?',
      options: ['Bara Lacha La', 'Zoji La', 'Rohtang Pass', 'Nathu La'],
      answerIndex: 1,
      explanation: 'Zoji La pass connects Srinagar with Leh.'
    },
    {
      id: 'q2',
      section: 'Defence & Military History',
      question: 'What is the motto of the Indian Armed Forces?',
      options: ['Service Before Self', 'Touch the Sky with Glory', 'Sham No Varunah', 'Valour and Faith'],
      answerIndex: 0,
      explanation: 'Service Before Self is the motto of the Indian Armed Forces.'
    },
    {
      id: 'q3',
      section: 'English',
      question: 'Choose the correct synonym for "TENACIOUS":',
      options: ['Weak', 'Persistent', 'Hesitant', 'Timid'],
      answerIndex: 1,
      explanation: 'Tenacious means persistent or determined.'
    }
  ]
};

const SAMPLE_NDA_MOCK = {
  id: 'nda-maths-mock-1',
  title: 'UPSC NDA I 2026 Mathematics Full Test',
  exam: 'NDA',
  durationMinutes: 150,
  totalMarks: 300,
  positiveMarks: 2.5,
  negativeMarks: 0.83,
  questions: [
    {
      id: 'nq1',
      section: 'Mathematics',
      question: 'What is the value of log10(1000)?',
      options: ['1', '2', '3', '4'],
      answerIndex: 2,
      explanation: 'log10(1000) = log10(10^3) = 3.'
    }
  ]
};

const MockTests = () => {
  const [examFilter, setExamFilter] = useState('All');
  const [mocks, setMocks] = useState([]);
  const [pyqs, setPyqs] = useState([]);
  const [activeMock, setActiveMock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMockData();
  }, [examFilter]);

  const fetchMockData = async () => {
    try {
      setLoading(true);
      const [mockRes, pyqRes] = await Promise.all([
        API.get('/mocktests').catch(() => ({ data: [] })),
        API.get(`/pyqs?exam=${examFilter === 'All' ? '' : examFilter}`).catch(() => ({ data: [] }))
      ]);

      const mockPayload = mockRes.data?.data || mockRes.data;
      const pyqPayload = pyqRes.data?.data || pyqRes.data;

      const parsedMocks = Array.isArray(mockPayload) ? mockPayload : [];
      const parsedPyqs = Array.isArray(pyqPayload) ? pyqPayload : [];

      setMocks(parsedMocks);
      setPyqs(parsedPyqs);
    } catch (err) {
      console.error('Fetch mock error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (activeMock) {
    return <MockTestArena mockId={activeMock.id} mockData={activeMock} onBack={() => setActiveMock(null)} />;
  }

  const allMocksCombined = [
    SAMPLE_CDS_MOCK,
    SAMPLE_NDA_MOCK,
    ...mocks
  ].filter((m) => examFilter === 'All' || m.exam === examFilter);

  const filteredPyqs = pyqs.filter((p) => examFilter === 'All' || p.exam === examFilter);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] military-font uppercase flex items-center gap-2">
          <Shield className="w-8 h-8 text-teal-500" /> Full-Length Defence Mock Exams & PYQ Arena
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Real exam atmosphere with timer countdown, Pause/Resume, negative marking rules, and instant scorecard.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['All', 'CDS', 'NDA', 'AFCAT', 'CAPF'].map((exam) => (
            <button
              key={exam}
              onClick={() => setExamFilter(exam)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer military-font uppercase ${
                examFilter === exam
                  ? 'bg-amber-600 text-white font-bold shadow-md'
                  : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-amber-500'
              }`}
            >
              {exam} Papers
            </button>
          ))}
        </div>

        <span className="text-xs text-[var(--text-secondary)] font-mono">
          Showing {allMocksCombined.length + filteredPyqs.length} Exam Papers
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[var(--text-secondary)]">Loading Exam Hall Arena...</div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="font-bold text-xl text-[var(--text-primary)] military-font uppercase flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Full Length Mock Tests ({allMocksCombined.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allMocksCombined.map((mock) => (
                <div key={mock.id} className="p-6 rounded-2xl glass-card space-y-4 flex flex-col justify-between border border-[var(--border-color)]">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-500 text-xs font-bold military-font uppercase">
                        {mock.exam} Exam
                      </span>
                      <span className="text-xs font-mono text-amber-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {mock.durationMinutes || mock.duration_minutes || 120} Mins
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[var(--text-primary)] military-font">{mock.title}</h3>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                      <div>
                        <p className="text-[var(--text-secondary)]">Marks</p>
                        <p className="font-bold text-[var(--text-primary)]">{mock.totalMarks || mock.total_marks || 100}</p>
                      </div>
                      <div>
                        <p className="text-[var(--text-secondary)]">Correct</p>
                        <p className="font-bold text-emerald-500">+{mock.positiveMarks || mock.positive_marks || 1}</p>
                      </div>
                      <div>
                        <p className="text-[var(--text-secondary)]">Negative</p>
                        <p className="font-bold text-red-500">-{mock.negativeMarks || mock.negative_marks || 0.33}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveMock(mock)}
                    className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer military-font tracking-wider"
                  >
                    <Play className="w-4 h-4 fill-white" /> Open Paper in Mock Arena
                  </button>
                </div>
              ))}
            </div>
          </div>

          {filteredPyqs.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
              <h2 className="font-bold text-xl text-[var(--text-primary)] military-font uppercase flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-500" /> Previous Year Question Papers ({filteredPyqs.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPyqs.map((pyq) => (
                  <div key={pyq.id} className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-500 text-[10px] font-bold military-font uppercase">
                          {pyq.exam} • {pyq.year}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-secondary)]">{pyq.paper_type}</span>
                      </div>
                      <h4 className="font-bold text-base text-[var(--text-primary)] military-font">{pyq.title}</h4>
                    </div>

                    <button
                      onClick={() => setActiveMock({
                        id: pyq.id,
                        title: pyq.title,
                        exam: pyq.exam,
                        durationMinutes: 120,
                        totalMarks: 100,
                        positiveMarks: 1,
                        negativeMarks: 0.33,
                        questions: [
                          {
                            id: 'pyq-q1',
                            section: pyq.paper_type || 'General',
                            question: `Official Question Paper: ${pyq.title} (${pyq.exam} ${pyq.year})`,
                            options: ['Option A', 'Option B', 'Option C', 'Option D'],
                            answerIndex: 0,
                            explanation: 'Official Previous Year Question Paper.'
                          }
                        ]
                      })}
                      className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer military-font uppercase"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Open in Mock Arena
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MockTests;
