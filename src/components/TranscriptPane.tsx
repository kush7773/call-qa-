import { MousePointerClick } from 'lucide-react';
import type { TranscriptTurn } from '../types';

interface TranscriptPaneProps {
  turns: TranscriptTurn[];
  /** ID of the annotation currently being evidence-linked (or null). */
  activeAnnotationId: string | null;
  /** Turn IDs already cited for the active annotation. */
  citedTurnIds: string[];
  onCiteTurn: (turnId: string) => void;
}

const BUBBLE_CLS: Record<TranscriptTurn['speaker'], string> = {
  Agent:    'bg-slate-100 text-slate-800 self-start',
  Customer: 'bg-indigo-50  text-indigo-900 self-end',
  System:   'bg-amber-50   text-amber-800  self-center italic text-center w-full text-xs',
};

const LABEL_CLS: Record<TranscriptTurn['speaker'], string> = {
  Agent:    'text-slate-400',
  Customer: 'text-indigo-400',
  System:   'text-amber-400',
};

const ALIGN_CLS: Record<TranscriptTurn['speaker'], string> = {
  Agent:    'items-start',
  Customer: 'items-end',
  System:   'items-center',
};

export default function TranscriptPane({
  turns,
  activeAnnotationId,
  citedTurnIds,
  onCiteTurn,
}: TranscriptPaneProps) {
  const evidenceMode = activeAnnotationId !== null;

  return (
    <section className="flex flex-col h-full overflow-hidden bg-white">
      {/* Pane header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200">
        <h2 className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
          Transcript
        </h2>
        {evidenceMode && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 animate-pulse">
            <MousePointerClick className="w-3 h-3" />
            Click turns to cite evidence
          </span>
        )}
      </div>

      {/* Turns */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {turns.map(turn => {
          const cited = citedTurnIds.includes(turn.id);
          const clickable = evidenceMode && turn.speaker !== 'System';

          return (
            <div key={turn.id} className={`flex flex-col gap-0.5 ${ALIGN_CLS[turn.speaker]}`}>
              {/* Turn meta */}
              <div className={`flex items-center gap-1.5 text-[10px] font-medium px-1 ${LABEL_CLS[turn.speaker]}`}>
                <span className="font-mono">{turn.id}</span>
                <span className="text-slate-200">·</span>
                <span>{turn.speaker}</span>
                <span className="text-slate-200">·</span>
                <span className="font-mono">{turn.timestamp}</span>
                {cited && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-600 font-semibold">
                    cited
                  </span>
                )}
              </div>

              {/* Bubble */}
              <div
                onClick={clickable ? () => onCiteTurn(turn.id) : undefined}
                className={[
                  'max-w-[88%] px-3 py-2 rounded-xl text-sm leading-relaxed transition-all',
                  BUBBLE_CLS[turn.speaker],
                  clickable ? 'cursor-pointer hover:brightness-95' : '',
                  cited ? 'ring-2 ring-indigo-400 ring-offset-1' : '',
                ].filter(Boolean).join(' ')}
              >
                {turn.text}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
