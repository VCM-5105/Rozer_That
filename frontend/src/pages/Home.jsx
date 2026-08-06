import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Target, BookOpen, Award, Sparkles, ArrowRight, CheckCircle2, Search } from 'lucide-react';
import API from '../services/api';

const Home = ({ onOpenSearch }) => {
  const [dailyQuote, setDailyQuote] = useState(null);
  const [sheets, setSheets] = useState([]);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [quoteRes, sheetsRes] = await Promise.all([
        API.get('/quotes/daily'),
        API.get('/sheets')
      ]);
      setDailyQuote(quoteRes.data);
      setSheets(sheetsRes.data);
    } catch (err) {
      console.error('Home data load error:', err);
    }
  };

  return (
    <div className="space-y-16 py-6">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-8 sm:p-12 text-white shadow-2xl border border-slate-700/50">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider military-font">
            <Shield className="w-4 h-4" /> Premier Defence Aspirants Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight military-font leading-tight">
            Start Your <span className="text-teal-400">Rozer</span> Journey
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Prepare for NDA, CDS, AFCAT, and CAPF examinations with Guided Strategy study sheets, previous year papers, timed mock tests, and personalized progress analytics.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/sheets"
              className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg transition military-font tracking-wider"
            >
              Explore Study Sheets <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/mocktests"
              className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-white font-medium text-sm flex items-center gap-2 transition"
            >
              Take Mock Test
            </Link>
          </div>
        </div>

        {/* Decorative Graphic Elements */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 hidden lg:block opacity-10 pointer-events-none">
          <Shield className="w-96 h-96 text-teal-400" />
        </div>
      </section>

      {/* Daily Motivational Quote Banner */}
      {dailyQuote && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 border border-amber-500/30 shadow-md text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-1.5 text-amber-500 font-bold text-xs uppercase tracking-wider military-font">
            <Sparkles className="w-4 h-4" /> Motivational Quote of the Day
          </div>
          <blockquote className="text-lg sm:text-xl italic font-semibold text-[var(--text-primary)]">
            "{dailyQuote.quote}"
          </blockquote>
          <cite className="text-xs text-[var(--gold-accent)] font-bold block not-italic">— {dailyQuote.author}</cite>
        </motion.div>
      )}

      {/* Exam Categories Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-[var(--text-primary)] military-font uppercase">
            Target Defence Examinations
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">Structured study sheets and exam patterns for every service branch</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'NDA & NA', sub: 'National Defence Academy', desc: 'Maths & GAT for Army, Navy & Air Force wings', color: 'from-amber-500/20 to-orange-500/20', link: '/sheets?exam=NDA' },
            { title: 'CDS Exam', sub: 'Combined Defence Services', desc: 'English, GK, and Elementary Maths for IMA, INA, AFA, OTA', color: 'from-teal-500/20 to-emerald-500/20', link: '/sheets?exam=CDS' },
            { title: 'AFCAT Entry', sub: 'Air Force Common Admission', desc: 'Flying & Ground Duty technical & non-technical branches', color: 'from-sky-500/20 to-blue-500/20', link: '/sheets?exam=AFCAT' },
            { title: 'CAPF (AC)', sub: 'Central Armed Police Forces', desc: 'Assistant Commandant General Ability & Essay Papers', color: 'from-emerald-500/20 to-teal-500/20', link: '/sheets?exam=CAPF' }
          ].map((exam, idx) => (
            <Link
              key={idx}
              to={exam.link}
              className="p-6 rounded-2xl glass-card hover:border-teal-500 transition group flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${exam.color} flex items-center justify-center text-teal-500 mb-4 group-hover:scale-110 transition`}>
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] military-font">{exam.title}</h3>
                <p className="text-xs font-semibold text-teal-500 mb-2">{exam.sub}</p>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{exam.desc}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-[var(--border-color)] text-xs font-semibold text-teal-500 flex items-center gap-1">
                Explore Roadmaps <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Study Sheets Grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-[var(--text-primary)] military-font uppercase">
              Military Study Sheets (TUF Style)
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">Step-by-step topic roadmaps with revision count & notes</p>
          </div>
          <Link to="/sheets" className="text-xs font-bold text-teal-500 hover:underline flex items-center gap-1">
            View All Sheets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sheets.slice(0, 6).map((sheet) => (
            <div key={sheet.id} className="p-6 rounded-2xl glass-card flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-500 text-xs font-bold military-font uppercase">
                    {sheet.category}
                  </span>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">{sheet.totalTopics} Topics</span>
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] military-font mb-2">{sheet.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{sheet.description}</p>
              </div>

              <Link
                to={`/sheets/${sheet.slug}`}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs text-center shadow-md transition"
              >
                Access Roadmap Sheet
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
