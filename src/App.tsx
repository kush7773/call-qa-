import { useState, useCallback, useEffect } from 'react';
import { calls } from './data/calls';
import { useReviews } from './hooks/useReviews';
import Header from './components/Header';
import TranscriptPane from './components/TranscriptPane';
import SummaryPane from './components/SummaryPane';
import AuditBanner from './components/AuditBanner';
import RulesDrawer from './components/RulesDrawer';
import type { AnnotationKind, Verdict } from './types';

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  /** ID of the annotation currently active for evidence-turn linking. */
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);

  const {
    sessions,
    getSession,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    toggleEvidenceTurn,
    setVerdict,
    submitReview,
    clearReview,
  } = useReviews();

  const call = calls[currentIndex];
  const session = getSession(call.id);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'Escape') {
        setIsRulesOpen(false);
        setActiveAnnotationId(null);
      } else if (e.key === '[' || (e.altKey && e.key === 'ArrowLeft')) {
        setCurrentIndex(prev => Math.max(0, prev - 1));
        setActiveAnnotationId(null);
      } else if (e.key === ']' || (e.altKey && e.key === 'ArrowRight')) {
        setCurrentIndex(prev => Math.min(calls.length - 1, prev + 1));
        setActiveAnnotationId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Event handlers ──────────────────────────────────────────────────────────

  const handleNavigate = useCallback((index: number) => {
    setCurrentIndex(index);
    setActiveAnnotationId(null); // clear active when switching calls
  }, []);

  const handleAddAnnotation = useCallback(
    (kind: AnnotationKind, summaryText: string) => {
      const id = addAnnotation(call.id, kind, summaryText);
      setActiveAnnotationId(id); // immediately enter evidence-link mode
    },
    [call.id, addAnnotation],
  );

  const handleCiteTurn = useCallback(
    (turnId: string) => {
      if (!activeAnnotationId) return;
      toggleEvidenceTurn(call.id, activeAnnotationId, turnId);
    },
    [call.id, activeAnnotationId, toggleEvidenceTurn],
  );

  const handleUpdateNote = useCallback(
    (annId: string, note: string) => updateAnnotation(call.id, annId, { note }),
    [call.id, updateAnnotation],
  );

  const handleUpdateSeverity = useCallback(
    (annId: string, severity: 'definite' | 'uncertain') =>
      updateAnnotation(call.id, annId, { severity }),
    [call.id, updateAnnotation],
  );

  const handleDelete = useCallback(
    (annId: string) => {
      deleteAnnotation(call.id, annId);
      if (activeAnnotationId === annId) setActiveAnnotationId(null);
    },
    [call.id, deleteAnnotation, activeAnnotationId],
  );

  const handleSetVerdict = useCallback(
    (verdict: Verdict) => setVerdict(call.id, verdict),
    [call.id, setVerdict],
  );

  const handleSubmit = useCallback(() => {
    submitReview(call.id);
    // Download single review as JSON
    const exportData = {
      callId: call.id,
      call_date: call.call_date,
      estimated_duration: call.estimated_duration,
      verdict: session.verdict,
      annotations: session.annotations,
      submittedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `review-${call.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [call, session, submitReview]);

  const handleExportAll = useCallback(() => {
    const reviewedCalls = calls.map(c => {
      const s = sessions[c.id];
      return {
        callId: c.id,
        call_date: c.call_date,
        estimated_duration: c.estimated_duration,
        isCompleted: !!s?.completedAt,
        verdict: s?.verdict ?? null,
        annotationsCount: s?.annotations.length ?? 0,
        annotations: s?.annotations ?? [],
        completedAt: s?.completedAt ?? null,
      };
    });

    const completed = reviewedCalls.filter(c => c.isCompleted);

    const stats = {
      totalCalls: calls.length,
      reviewedCallsCount: completed.length,
      verdictDistribution: {
        accurate: completed.filter(c => c.verdict === 'accurate').length,
        inaccurate: completed.filter(c => c.verdict === 'inaccurate').length,
        needs_review: completed.filter(c => c.verdict === 'needs_review').length,
      },
      annotationsBreakdown: {
        totalAccurateTags: reviewedCalls.flatMap(c => c.annotations).filter(a => a.kind === 'accurate').length,
        totalHallucinations: reviewedCalls.flatMap(c => c.annotations).filter(a => a.kind === 'hallucination').length,
        totalOmissions: reviewedCalls.flatMap(c => c.annotations).filter(a => a.kind === 'omission').length,
        totalRuleBreaches: reviewedCalls.flatMap(c => c.annotations).filter(a => a.kind === 'rule_breach').length,
      },
    };

    const batchReport = {
      exportTitle: 'SoundSense Call QA Evaluation Batch Report',
      exportedAt: new Date().toISOString(),
      statistics: stats,
      calls: reviewedCalls,
    };

    const blob = new Blob([JSON.stringify(batchReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `soundsense-batch-review-report-${new Date().toISOString().split('T')[0]}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [sessions]);

  const handleClear = useCallback(() => {
    clearReview(call.id);
    setActiveAnnotationId(null);
  }, [call.id, clearReview]);

  // Cited turns for the currently active annotation
  const citedTurnIds =
    activeAnnotationId
      ? (session.annotations.find(a => a.id === activeAnnotationId)?.evidenceTurnIds ?? [])
      : [];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <Header
        calls={calls}
        currentIndex={currentIndex}
        sessions={sessions}
        onNavigate={handleNavigate}
        onToggleRules={() => setIsRulesOpen(prev => !prev)}
        onExportAll={handleExportAll}
      />

      <main className="flex flex-1 overflow-hidden">
        {/* Left — Transcript */}
        <div className="w-1/2 overflow-hidden">
          <TranscriptPane
            turns={call.turns}
            activeAnnotationId={activeAnnotationId}
            citedTurnIds={citedTurnIds}
            onCiteTurn={handleCiteTurn}
          />
        </div>

        {/* Right — AI Summary */}
        <div className="w-1/2 overflow-hidden">
          <SummaryPane
            summary={call.summary}
            annotations={session.annotations}
            activeAnnotationId={activeAnnotationId}
            onAddAnnotation={handleAddAnnotation}
            onActivate={setActiveAnnotationId}
          />
        </div>
      </main>

      <AuditBanner
        callId={call.id}
        annotations={session.annotations}
        verdict={session.verdict}
        completedAt={session.completedAt}
        activeAnnotationId={activeAnnotationId}
        onActivate={setActiveAnnotationId}
        onUpdateNote={handleUpdateNote}
        onUpdateSeverity={handleUpdateSeverity}
        onDelete={handleDelete}
        onSetVerdict={handleSetVerdict}
        onSubmit={handleSubmit}
        onClear={handleClear}
      />

      {/* Slide-over Rules Reference Drawer */}
      <RulesDrawer
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
}
