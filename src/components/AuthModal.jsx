/**
 * Authentication Modal
 * Login and Register forms with Save Soil theme
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, displayName);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-gradient-to-br from-[#8b7355] to-[#6b5444] rounded-3xl shadow-2xl border border-[var(--golden-soil)]/20 overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X size={20} className="text-[var(--cream)]" />
          </button>

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-white/10">
            <h2 className="text-3xl font-black text-[var(--cream)] mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Join PlantDexPro'}
            </h2>
            <p className="text-sm text-[var(--cream)]/60">
              {mode === 'login' 
                ? 'Sign in to access your plant history and favorites'
                : 'Create an account to save your discoveries'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/20 border border-rose-400/30"
              >
                <AlertCircle size={20} className="text-rose-300 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-200">{error}</p>
              </motion.div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[var(--cream)]/70 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--cream)]/40" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    required={mode === 'register'}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[var(--cream)] placeholder-[var(--cream)]/30 focus:outline-none focus:border-[var(--golden-soil)] focus:bg-white/15 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--cream)]/70 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--cream)]/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[var(--cream)] placeholder-[var(--cream)]/30 focus:outline-none focus:border-[var(--golden-soil)] focus:bg-white/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--cream)]/70 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--cream)]/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[var(--cream)] placeholder-[var(--cream)]/30 focus:outline-none focus:border-[var(--golden-soil)] focus:bg-white/15 transition-all"
                />
              </div>
              {mode === 'register' && (
                <p className="text-xs text-[var(--cream)]/50 mt-2">Minimum 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-[var(--golden-soil)] hover:bg-[var(--golden-soil)]/90 disabled:bg-[var(--golden-soil)]/50 text-[var(--forest-green)] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <p className="text-sm text-[var(--cream)]/60">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={toggleMode}
                className="text-[var(--golden-soil)] hover:text-[var(--golden-soil)]/80 font-bold underline transition-colors"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Save Soil Branding */}
          <div className="px-8 pb-6 text-center border-t border-white/10 pt-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--golden-soil)]/40">
              Save Our Soil Initiative
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
