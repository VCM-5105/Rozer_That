import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] py-12 text-sm text-[var(--text-secondary)] mt-auto">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-base">
                R
              </div>

              <span className="text-xl font-bold tracking-wider military-font text-[var(--text-primary)]">
                Rozer<span className="text-teal-500">That</span>
              </span>
            </div>

            <p className="text-xs leading-relaxed">
              The ultimate military-themed preparation platform for defence aspirants preparing for NDA, CDS, AFCAT, and CAPF written examinations and SSB interviews.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-3 military-font uppercase tracking-wider text-xs">
              Exams Covered
            </h4>

            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/sheets?exam=NDA"
                  className="hover:text-teal-500 transition"
                >
                  UPSC NDA & NA
                </Link>
              </li>

              <li>
                <Link
                  to="/sheets?exam=CDS"
                  className="hover:text-teal-500 transition"
                >
                  UPSC CDS Examination
                </Link>
              </li>

              <li>
                <Link
                  to="/sheets?exam=AFCAT"
                  className="hover:text-teal-500 transition"
                >
                  IAF AFCAT Entrance
                </Link>
              </li>

              <li>
                <Link
                  to="/sheets?exam=CAPF"
                  className="hover:text-teal-500 transition"
                >
                  CAPF Assistant Commandant
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-3 military-font uppercase tracking-wider text-xs">
              Study Sheets
            </h4>

            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/sheets/mission-nda"
                  className="hover:text-teal-500 transition"
                >
                  Mission NDA Roadmap
                </Link>
              </li>

              <li>
                <Link
                  to="/sheets/operation-cds"
                  className="hover:text-teal-500 transition"
                >
                  Operation CDS Arsenal
                </Link>
              </li>

              <li>
                <Link
                  to="/sheets/falcon-afcat"
                  className="hover:text-teal-500 transition"
                >
                  Falcon AFCAT Flight Path
                </Link>
              </li>

              <li>
                <Link
                  to="/sheets/officers-roadmap"
                  className="hover:text-teal-500 transition"
                >
                  Officer's SSB Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] mb-3 military-font uppercase tracking-wider text-xs">
              Motto & Commitment
            </h4>

            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs italic text-teal-400">
              "Service Before Self — Seva Parmo Dharma"
            </div>
          </div>
        </div>

        
        <div className="mt-10 pt-6 border-t border-[var(--border-color)]">
          
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            
            
            <p className="text-xs text-[var(--text-secondary)]">
              Developed by{' '}
              <span className="font-semibold text-[var(--text-primary)]">
                Vipul Chandra Mishra
              </span>
            </p>

            
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Follow me
              </span>

              
              <a
                href="https://www.linkedin.com/in/vipul5105"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vipul Chandra Mishra on LinkedIn"
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-teal-500 hover:border-teal-500 hover:bg-teal-500/10 transition-all duration-300"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>

              
              <a
                href="https://github.com/VCM-5105"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vipul Chandra Mishra on GitHub"
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-teal-500 hover:border-teal-500 hover:bg-teal-500/10 transition-all duration-300"
              >
                <FaGithub className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
