import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X } from 'lucide-react';
import type { Annotation, AnnotationKind } from '../types';
import { KIND_CONFIG, KIND_ORDER } from '../constants/annotationConfig';

// ─── Text segmentation ────────────────────────────────────────────────────────

type Segment =
  | { plain: true; text: string }
  | { plain: false; text: string; kind: AnnotationKind; id: string; active: boolean };

function buildSegments(summary: string, annotations: Annotation[], activeId: string | null): Segment[] {
  // Collect non-empty summary spans, sorted by position
  const spans = annotations
    .filter(a => a.summaryText.length > 0)
    .map(a => {
      const start = summary.indexOf(a.summaryText);
      return { start, end: start + a.summaryText.length, kind: a.kind, id: a.id, active: a.id === activeId };
    })
    .filter(s => s.start !== -1)
    .sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let pos = 0;

  for (const span of spans) {
    if (span.start < pos) continue; // skip overlaps
    if (span.start > pos) segments.push({ plain: true, text: summary.slice(pos, span.start) });
    segments.push({ plain: false, text: summary.slice(span.start, span.end), kind: span.kind, id: span.id, active: span.active });
    pos = span.end;
  }
  if (pos < summary.length) segments.push({ plain: true, text: summary.slice(pos) });

  return segments;
}

// ─── Popover ──────────────────────────────────────────────────────────────────

interface PopoverState {
  text: string;
  x: number;
  y: number;
}

interface AnnotationPopoverProps {
  popover: PopoverState;
  popoverRef: React.RefObject<HTMLDivElement | null>;
  onAnnotate: (kind: AnnotationKind) => void;
  onDismiss: () => void;
}

function AnnotationPopover({ popover, popoverRef, onAnnotate, onDismiss }: AnnotationPopoverProps) {
  return createPortal(
    <div
      ref={popoverRef}
      onMouseDown={e => e.preventDefault()} // don't lose text selection
      style={{
        position: 'fixed',
        top: popover.y - 10,
        left: Math.min(Math.max(popover.x, 120), window.innerWidth - 120),
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
      }}
      className="flex flex-col gap-2 p-2.5 bg-white rounded-2xl shadow-2xl border border-slate-200 min-w-max"
    >
      {/* Arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-3 h-1.5 overflow-hidden"
        aria-hidden
      >
        <div className="w-3 h-3 bg-white border border-slate-200 rotate-45 translate-y-[-50%] mx-auto" />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        {KIND_ORDER.map(kind => {
          const { icon: Icon, label, popoverCls } = KIND_CONFIG[kind];
          return (
            <button
              key={kind}
              onClick={() => onAnnotate(kind)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${popoverCls}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preview of selected text */}
      <p className="text-[10px] text-slate-400 text-center px-1 truncate max-w-[280px]">
        "{popover.text.length > 70 ? popover.text.slice(0, 70) + '…' : popover.text}"
      </p>
    </div>,
    document.body,
  );
}

// ─── SummaryPane ──────────────────────────────────────────────────────────────

interface SummaryPaneProps {
  summary: string;
  annotations: Annotation[];
  activeAnnotationId: string | null;
  onAddAnnotation: (kind: AnnotationKind, text: string) => void;
  onActivate: (id: string | null) => void;
}

export default function SummaryPane({
  summary,
  annotations,
  activeAnnotationId,
  onAddAnnotation,
  onActivate,
}: SummaryPaneProps) {
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    if (!popover) return;
    const handler = (e: MouseEvent) => {
      if (!popoverRef.current?.contains(e.target as Node)) {
        setPopover(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popover]);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { setPopover(null); return; }
    if (!summaryRef.current?.contains(sel.anchorNode)) { setPopover(null); return; }
    const text = sel.toString().trim();
    if (!text) { setPopover(null); return; }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setPopover({ text, x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  const handleAnnotate = useCallback((kind: AnnotationKind) => {
    if (!popover) return;
    onAddAnnotation(kind, popover.text);
    setPopover(null);
    window.getSelection()?.removeAllRanges();
  }, [popover, onAddAnnotation]);

  const handleAddOmission = useCallback(() => {
    onAddAnnotation('omission', '');
  }, [onAddAnnotation]);

  const segments = buildSegments(summary, annotations, activeAnnotationId);

  return (
    <section className="flex flex-col h-full overflow-hidden border-l border-slate-200 bg-white">
      {/* Pane header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200">
        <h2 className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
          AI Summary
        </h2>
        <button
          onClick={handleAddOmission}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition-colors"
          title="Flag something that should be in the summary but isn't"
        >
          <Plus className="w-3 h-3" />
          Add Omission
        </button>
      </div>

      {/* Summary body — selectable */}
      <div
        ref={summaryRef}
        className="flex-1 overflow-y-auto px-5 py-5 cursor-text select-text"
        onMouseUp={handleMouseUp}
      >
        <p className="text-sm leading-8 text-slate-700">
          {segments.map((seg, i) =>
            seg.plain ? (
              <span key={i}>{seg.text}</span>
            ) : (
              <mark
                key={i}
                onClick={() => onActivate(seg.active ? null : seg.id)}
                className={[
                  'cursor-pointer rounded-sm px-0.5 transition-all',
                  KIND_CONFIG[seg.kind].highlightCls,
                  seg.active ? 'ring-2 ring-offset-1 ring-indigo-500' : '',
                ].join(' ')}
                title={`${KIND_CONFIG[seg.kind].label} — click to focus`}
              >
                {seg.text}
              </mark>
            )
          )}
        </p>
      </div>

      {/* Legend + hint */}
      <div className="flex items-center justify-between px-5 py-2 border-t border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-3">
          {KIND_ORDER.map(k => {
            const { label, dotCls } = KIND_CONFIG[k];
            return (
              <span key={k} className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className={`w-2 h-2 rounded-full ${dotCls}`} />
                {label}
              </span>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 italic">Select text to annotate</p>
      </div>

      {/* Annotation popover (portal) */}
      {popover && (
        <AnnotationPopover
          popover={popover}
          popoverRef={popoverRef}
          onAnnotate={handleAnnotate}
          onDismiss={() => setPopover(null)}
        />
      )}
    </section>
  );
}
