import { useState, useCallback } from 'react';
import { calls } from './data/calls';
import { useReviews } from './hooks/useReviews';
import Header from './components/Header';
import TranscriptPane from './components/TranscriptPane';
import SummaryPane from './components/SummaryPane';
import AuditBanner from './components/AuditBanner';
import type { AnnotationKind, Verdict } from './types';

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
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
    // Download review as JSON
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
    </div>
  );
}
