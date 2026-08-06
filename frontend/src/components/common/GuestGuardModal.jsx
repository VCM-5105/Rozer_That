import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, LogIn, UserPlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGuestGuard } from '../../context/GuestGuardContext';

const GuestGuardModal = () => {
  const { isModalOpen, actionName, closeModal } = useGuestGuard();

  if (!isModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 text-center"
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 military-font uppercase tracking-wider">
            Cadet Authentication Required
          </h3>

          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Guest cadets can read study sheets and articles freely. However, to <span className="font-semibold text-teal-500">{actionName || 'access personal tracking'}</span>, please log in or create a student account.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              onClick={closeModal}
              className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium flex items-center justify-center gap-2 shadow-lg transition"
            >
              <LogIn className="w-4 h-4" /> Log In to Continue
            </Link>

            <Link
              to="/register"
              onClick={closeModal}
              className="w-full py-3 px-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-teal-500 text-[var(--text-primary)] font-medium flex items-center justify-center gap-2 transition"
            >
              <UserPlus className="w-4 h-4" /> Create Free Student Account
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GuestGuardModal;
