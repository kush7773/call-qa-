import { useState, useCallback, useEffect } from 'react';
import type { ReviewSession, Annotation, AnnotationKind, Severity, Verdict } from '../types';

const STORAGE_KEY = 'soundsense-qa-sessions-v1';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadSessions(): Record<string, ReviewSession> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ReviewSession>) : {};
  } catch {
    return {};
  }
}

function persistSessions(sessions: Record<string, ReviewSession>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

function makeId(): string {
  return `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function emptySession(callId: string): ReviewSession {
  return { callId, annotations: [], verdict: null, completedAt: null };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseReviewsReturn {
  sessions: Record<string, ReviewSession>;
  getSession: (callId: string) => ReviewSession;
  /** Creates a new annotation and returns its generated ID. */
  addAnnotation: (
    callId: string,
    kind: AnnotationKind,
    summaryText: string,
    severity?: Severity,
  ) => string;
  updateAnnotation: (callId: string, annotationId: string, patch: Partial<Annotation>) => void;
  deleteAnnotation: (callId: string, annotationId: string) => void;
  /** Toggles a transcript turn ID on/off in the annotation's evidence list. */
  toggleEvidenceTurn: (callId: string, annotationId: string, turnId: string) => void;
  setVerdict: (callId: string, verdict: Verdict) => void;
  submitReview: (callId: string) => void;
  clearReview: (callId: string) => void;
}

export function useReviews(): UseReviewsReturn {
  const [sessions, setSessions] = useState<Record<string, ReviewSession>>(loadSessions);

  // Persist to localStorage on every change
  useEffect(() => {
    persistSessions(sessions);
  }, [sessions]);

  const getSession = useCallback(
    (callId: string): ReviewSession => sessions[callId] ?? emptySession(callId),
    [sessions],
  );

  // ── Annotation CRUD ─────────────────────────────────────────────────────────

  const addAnnotation = useCallback(
    (callId: string, kind: AnnotationKind, summaryText: string, severity: Severity = 'definite'): string => {
      const id = makeId();
      const annotation: Annotation = {
        id,
        kind,
        summaryText,
        evidenceTurnIds: [],
        note: '',
        severity,
        createdAt: new Date().toISOString(),
      };
      setSessions(prev => {
        const session = prev[callId] ?? emptySession(callId);
        return {
          ...prev,
          [callId]: { ...session, annotations: [...session.annotations, annotation] },
        };
      });
      return id;
    },
    [],
  );

  const updateAnnotation = useCallback(
    (callId: string, annotationId: string, patch: Partial<Annotation>): void => {
      setSessions(prev => {
        const session = prev[callId];
        if (!session) return prev;
        return {
          ...prev,
          [callId]: {
            ...session,
            annotations: session.annotations.map(a =>
              a.id === annotationId ? { ...a, ...patch } : a,
            ),
          },
        };
      });
    },
    [],
  );

  const deleteAnnotation = useCallback((callId: string, annotationId: string): void => {
    setSessions(prev => {
      const session = prev[callId];
      if (!session) return prev;
      return {
        ...prev,
        [callId]: {
          ...session,
          annotations: session.annotations.filter(a => a.id !== annotationId),
        },
      };
    });
  }, []);

  // ── Evidence linking ────────────────────────────────────────────────────────

  const toggleEvidenceTurn = useCallback(
    (callId: string, annotationId: string, turnId: string): void => {
      setSessions(prev => {
        const session = prev[callId];
        if (!session) return prev;
        return {
          ...prev,
          [callId]: {
            ...session,
            annotations: session.annotations.map(a => {
              if (a.id !== annotationId) return a;
              const already = a.evidenceTurnIds.includes(turnId);
              return {
                ...a,
                evidenceTurnIds: already
                  ? a.evidenceTurnIds.filter(id => id !== turnId)
                  : [...a.evidenceTurnIds, turnId],
              };
            }),
          },
        };
      });
    },
    [],
  );

  // ── Verdict / session lifecycle ─────────────────────────────────────────────

  const setVerdict = useCallback((callId: string, verdict: Verdict): void => {
    setSessions(prev => {
      const session = prev[callId] ?? emptySession(callId);
      // Toggle off if same verdict clicked again
      const next = session.verdict === verdict ? null : verdict;
      return { ...prev, [callId]: { ...session, verdict: next } };
    });
  }, []);

  const submitReview = useCallback((callId: string): void => {
    setSessions(prev => {
      const session = prev[callId];
      if (!session) return prev;
      return { ...prev, [callId]: { ...session, completedAt: new Date().toISOString() } };
    });
  }, []);

  const clearReview = useCallback((callId: string): void => {
    setSessions(prev => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [callId]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    sessions,
    getSession,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    toggleEvidenceTurn,
    setVerdict,
    submitReview,
    clearReview,
  };
}
