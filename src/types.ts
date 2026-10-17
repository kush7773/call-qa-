// ─── Transcript ──────────────────────────────────────────────────────────────

export type Speaker = 'Agent' | 'Customer' | 'System';

export interface TranscriptTurn {
  id: string;        // e.g. "T01"
  timestamp: string; // e.g. "00:00"
  speaker: Speaker;
  text: string;
}

// ─── Annotations ─────────────────────────────────────────────────────────────

/** Four mutually-exclusive annotation kinds that an evaluator can apply. */
export type AnnotationKind =
  | 'accurate'      // ✓ green  – span is correct and supported
  | 'hallucination' // ✗ red    – AI invented or contradicted the transcript
  | 'omission'      // ⚠ yellow – something required by the rules is absent
  | 'rule_breach';  // ⚡ purple – fact is right but a rule was violated

export type Severity = 'definite' | 'uncertain';

export interface Annotation {
  id: string;
  kind: AnnotationKind;
  /** The exact span of summary text selected. Empty string for omissions. */
  summaryText: string;
  /** Transcript turn IDs linked as supporting evidence. */
  evidenceTurnIds: string[];
  note: string;
  severity: Severity;
  createdAt: string;
}

// ─── Review session ───────────────────────────────────────────────────────────

export type Verdict = 'accurate' | 'inaccurate' | 'needs_review';

export interface ReviewSession {
  callId: string;
  annotations: Annotation[];
  verdict: Verdict | null;
  completedAt: string | null;
}

// ─── Call data ────────────────────────────────────────────────────────────────

export interface RawCallRecord {
  id: string;
  call_date: string;
  estimated_duration: string;
  /** Raw multi-line string; parsed into TranscriptTurn[] at load time. */
  transcript: string;
  summary: string;
}

export interface CallRecord extends RawCallRecord {
  turns: TranscriptTurn[];
}
