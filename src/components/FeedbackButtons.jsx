/**
 * Feedback Buttons Component
 * Allows users to confirm or correct AI identification results
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, MessageSquare, Send, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { userDataService } from '../services/userDataService.js';

export const FeedbackButtons = ({ plant, identificationId }) => {
  const { currentUser } = useAuth();
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctName, setCorrectName] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedType, setSubmittedType] = useState(null);
  const [submissionError, setSubmissionError] = useState('');

  const buildFeedbackPayload = (type) => ({
    type,
    correctName: type === 'correct' ? correctName.trim() : null,
    comments: type === 'correct' ? comments.trim() : 'User confirmed identification',
    plantSnapshot: {
      commonName: plant?.commonName || null,
      scientificName: plant?.scientificName || null,
      confidence: plant?.xaiMeta?.confidence ?? plant?.confidenceScore ?? null,
      verificationStatus: plant?.verificationStatus || 'unverified',
      verificationLevel: plant?.verificationLevel || 'none',
      dataSource: plant?.dataSource || 'ai_inference_only',
      conservationStatus: plant?.conservationStatus || null,
      candidateRank: plant?.hbdoMeta?.candidateRank || 1,
      candidateId: plant?.hbdoMeta?.candidateId || null,
    },
    hbdoSnapshot: plant?.hbdoMeta ? {
      pipeline: plant.hbdoMeta.pipeline,
      version: plant.hbdoMeta.version,
      identificationId: plant.hbdoMeta.identificationId || identificationId,
      pipelineSessionId: plant.hbdoMeta.pipelineSessionId || null,
      candidateId: plant.hbdoMeta.candidateId || null,
      retrieval: plant.hbdoMeta.retrieval || null,
      validation: plant.hbdoMeta.validation || null,
      fallbackReasoning: plant.hbdoMeta.fallbackReasoning || null,
      enrichment: plant.hbdoMeta.enrichment || null,
    } : null,
    xaiSnapshot: plant?.xaiMeta ? {
      confidence: plant.xaiMeta.confidence ?? plant?.confidenceScore ?? null,
      inferenceLatencyMs: plant.xaiMeta.inferenceLatencyMs || null,
      modelName: plant.xaiMeta.modelName || null,
      verificationLevel: plant.xaiMeta.verificationLevel || null,
      retrievalSource: plant.xaiMeta.retrievalSource || null,
      matchTier: plant.xaiMeta.matchTier || null,
      fallbackStrategy: plant.xaiMeta.fallbackStrategy || null,
      featureImportance: plant.xaiMeta.featureImportance || [],
    } : null,
  });

  const handleConfirm = async () => {
    if (!currentUser || !identificationId) return;

    try {
      setSubmitting(true);
      setSubmissionError('');
      await userDataService.submitFeedback(currentUser.uid, identificationId, buildFeedbackPayload('confirm'));
      setSubmittedType('confirm');
      setTimeout(() => setSubmittedType(null), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmissionError('Unable to submit verified feedback right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCorrect = async () => {
    if (!currentUser || !correctName.trim() || !identificationId) return;

    try {
      setSubmitting(true);
      setSubmissionError('');
      await userDataService.submitFeedback(currentUser.uid, identificationId, buildFeedbackPayload('correct'));
      setSubmittedType('correct');
      setShowCorrection(false);
      setCorrectName('');
      setComments('');
      setTimeout(() => setSubmittedType(null), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmissionError('Unable to submit verified feedback right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!identificationId) return null;

  if (!currentUser) {
    return (
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare size={14} className="text-[#00FF41]" />
          <p className="text-xs font-black uppercase tracking-wider text-[#00FF41]/70">
            Verified Feedback Capture
          </p>
        </div>
        <p className="text-sm text-[var(--cream)]/70 leading-relaxed">
          Sign in to submit authenticated feedback for training review and future model improvement.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <p className="text-xs font-black uppercase tracking-wider text-[var(--cream)]/60">
          Is this identification correct?
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={submitting || submittedType === 'confirm'}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 hover:bg-green-500/30 disabled:bg-green-500/10 border border-green-400/30 rounded-xl text-green-300 font-bold transition-all"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : submittedType === 'confirm' ? (
            <>
              <CheckCircle size={16} />
              <span>Confirmed!</span>
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              <span>Correct</span>
            </>
          )}
        </button>

        <button
          onClick={() => setShowCorrection(!showCorrection)}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 rounded-xl text-orange-300 font-bold transition-all"
        >
          <XCircle size={16} />
          <span>Incorrect</span>
        </button>
      </div>

      <AnimatePresence>
        {showCorrection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[var(--cream)]/70 mb-2">
                  What is the correct plant name?
                </label>
                <input
                  type="text"
                  value={correctName}
                  onChange={(e) => setCorrectName(e.target.value)}
                  placeholder="e.g., Aloe Vera"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-[var(--cream)] placeholder-[var(--cream)]/30 focus:outline-none focus:border-[var(--golden-soil)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[var(--cream)]/70 mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Any additional details..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-[var(--cream)] placeholder-[var(--cream)]/30 focus:outline-none focus:border-[var(--golden-soil)] transition-all resize-none"
                />
              </div>

              <button
                onClick={handleCorrect}
                disabled={!correctName.trim() || submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--golden-soil)] hover:bg-[var(--golden-soil)]/90 disabled:bg-[var(--golden-soil)]/50 text-[var(--forest-green)] font-black uppercase tracking-wider rounded-lg transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Correction</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {submissionError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500/15 border border-orange-400/20 rounded-lg text-orange-200 text-sm"
        >
          <MessageSquare size={14} />
          <span>{submissionError}</span>
        </motion.div>
      )}

      {submittedType && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-lg text-green-300 text-sm"
        >
          <MessageSquare size={14} />
          <span>
            {submittedType === 'confirm'
              ? 'Authenticated confirmation captured for training review.'
              : 'Authenticated correction captured for training review.'}
          </span>
        </motion.div>
      )}
    </div>
  );
};
