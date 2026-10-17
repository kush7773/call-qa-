import { useState, useCallback } from 'react';
import {
  ChevronUp, ChevronDown, Trash2, RotateCcw,
  CheckCheck, Link2, Download,
} from 'lucide-react';
import { KIND_CONFIG } from './SummaryPane';
import type { Annotation, AnnotationKind, Verdict } from '../types';

// ─── Verdict config ───────────────────────────────────────────────────────────

const VERDICT_CONFIG: Record<Verdict, { label: string; activeCls: string; inactiveCls: string }> = {
  accurate: {
    label: '✓ Accurate',
    activeCls: 'bg-green-600 text-white border-green-600 shadow-sm',
    inactiveCls: 'border-slate-200 text-slate-500 hover:bg-green-50 hover:border-green-300 hover:text-green-700',
  },
  inaccurate: {
    label: '✗ Inaccurate',
    activeCls: 'bg-red-600 text-white border-red-600 shadow-sm',
    inactiveCls: 'border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-300 hover:text-red-700',
  },
  needs_review: {
    label: '? Needs Review',
    activeCls: 'bg-amber-500 text-white border-amber-500 shadow-sm',
    inactiveCls: 'border-slate-200 text-slate-500 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700',
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface AuditBannerProps {
  callId: string;
  annotations: Annotation[];
  verdict: Verdict | null;
  completedAt: string | null;
  activeAnnotationId: string | null;
  onActivate: (id: string | null) => void;
  onUpdateNote: (id: string, note: string) => void;
  onUpdateSeverity: (id: string, severity: 'definite' | 'uncertain') => void;
  onDelete: (id: string) => void;
  onSetVerdict: (verdict: Verdict) => void;
  onSubmit: () => void;
  onClear: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AuditBanner({
  callId: _callId,
  annotations,
  verdict,
  completedAt,
  activeAnnotationId,
  onActivate,
  onUpdateNote,
  onUpdateSeverity,
  onDelete,
  onSetVerdict,
  onSubmit,
  onClear,
}: AuditBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Counts by kind
  const counts = (Object.keys(KIND_CONFIG) as AnnotationKind[]).reduce(
    (acc, k) => ({ ...acc, [k]: annotations.filter(a => a.kind === k).length }),
    {} as Record<AnnotationKind, number>,
  );
  const totalIssues = counts.hallucination + counts.omission + counts.rule_breach;

  // Auto-expand when first annotation is added
  const handleToggle = useCallback(() => setIsExpanded(e => !e), []);

  return (
    <footer className="border-t border-slate-200 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.06)] z-10">
      {/* ── Expanded panel ─────────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="border-b border-slate-100 max-h-60 overflow-y-auto">
          {annotations.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-slate-400 italic">
              No annotations yet — select text in the summary or click "Add Omission".
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {annotations.map(ann => {
                const { icon: Icon, highlightCls, label } = KIND_CONFIG[ann.kind];
                const isActive = ann.id === activeAnnotationId;

                return (
                  <div
                    key={ann.id}
                    className={`flex items-start gap-3 px-4 py-3 text-xs transition-colors ${
                      isActive ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Kind icon */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold shrink-0 ${highlightCls}`}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Summary text snippet */}
                      {ann.summaryText ? (
                        <p className="text-slate-600 truncate" title={ann.summaryText}>
                          "{ann.summaryText.slice(0, 90)}{ann.summaryText.length > 90 ? '…' : ''}"
                        </p>
                      ) : (
                        <p className="text-slate-400 italic">Omission (no span selected)</p>
                      )}

                      {/* Note field */}
                      <input
                        type="text"
                        value={ann.note}
                        onChange={e => onUpdateNote(ann.id, e.target.value)}
                        placeholder="Add evaluator note…"
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      />

                      {/* Evidence turn chips + severity toggle */}
                      <div className="flex items-center flex-wrap gap-1.5">
                        {ann.evidenceTurnIds.map(tid => (
                          <span
                            key={tid}
                            className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-mono text-[10px]"
                          >
                            {tid}
                          </span>
                        ))}
                        {ann.evidenceTurnIds.length === 0 && (
                          <span className="text-[10px] text-slate-300 italic">no evidence linked</span>
                        )}
                        {/* Severity pill */}
                        <button
                          onClick={() =>
                            onUpdateSeverity(ann.id, ann.severity === 'definite' ? 'uncertain' : 'definite')
                          }
                          className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                            ann.severity === 'definite'
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'
                          }`}
                          title="Toggle definite / uncertain"
                        >
                          {ann.severity === 'definite' ? 'Definite' : 'Uncertain'}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 self-start pt-0.5">
                      {/* Evidence-link toggle */}
                      <button
                        onClick={() => onActivate(isActive ? null : ann.id)}
                        title={isActive ? 'Stop citing turns' : 'Click transcript turns to cite evidence'}
                        className={`p-1.5 rounded-md transition-colors ${
                          isActive
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => onDelete(ann.id)}
                        title="Delete annotation"
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Bottom bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        {/* Left: expand + count badges */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            <span>
              {annotations.length === 0
                ? 'No annotations'
                : `${annotations.length} annotation${annotations.length !== 1 ? 's' : ''}`}
              {totalIssues > 0 && (
                <span className="ml-1 text-red-500">· {totalIssues} issue{totalIssues !== 1 ? 's' : ''}</span>
              )}
            </span>
          </button>

          {/* Kind count badges */}
          <div className="flex items-center gap-1.5">
            {(Object.keys(KIND_CONFIG) as AnnotationKind[]).map(kind => {
              const n = counts[kind];
              if (!n) return null;
              const { icon: Icon, highlightCls } = KIND_CONFIG[kind];
              return (
                <span
                  key={kind}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${highlightCls}`}
                >
                  <Icon className="w-3 h-3" />
                  {n}
                </span>
              );
            })}
          </div>
        </div>

        {/* Right: verdict + submit */}
        <div className="flex items-center gap-1.5">
          {/* Verdict buttons */}
          {(Object.keys(VERDICT_CONFIG) as Verdict[]).map(v => {
            const { label, activeCls, inactiveCls } = VERDICT_CONFIG[v];
            const selected = verdict === v;
            return (
              <button
                key={v}
                onClick={() => onSetVerdict(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  selected ? activeCls : inactiveCls
                }`}
              >
                {label}
              </button>
            );
          })}

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* Reset */}
          <button
            onClick={() => { if (confirm('Reset all annotations for this call?')) onClear(); }}
            title="Reset review"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Submit — downloads JSON + marks complete */}
          <button
            onClick={onSubmit}
            disabled={!verdict}
            title={!verdict ? 'Select a verdict before submitting' : 'Submit review and download JSON'}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {completedAt ? (
              <>
                <Download className="w-3.5 h-3.5" />
                Re-export
              </>
            ) : (
              <>
                <CheckCheck className="w-3.5 h-3.5" />
                Submit Review
              </>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
}
