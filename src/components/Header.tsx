import { ChevronLeft, ChevronRight, Clock, Phone, CheckCircle2 } from 'lucide-react';
import type { CallRecord, ReviewSession } from '../types';

interface HeaderProps {
  calls: CallRecord[];
  currentIndex: number;
  sessions: Record<string, ReviewSession>;
  onNavigate: (index: number) => void;
}

function inferDirection(summary: string): 'Inbound' | 'Outbound' {
  return summary.toLowerCase().includes('the company called') ? 'Outbound' : 'Inbound';
}

export default function Header({ calls, currentIndex, sessions, onNavigate }: HeaderProps) {
  const call = calls[currentIndex];
  const direction = inferDirection(call.summary);

  const reviewedCount = calls.filter(c => sessions[c.id]?.completedAt).length;
  const progressPct = Math.round((reviewedCount / calls.length) * 100);

  const formattedDate = new Date(call.call_date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="flex items-center justify-between gap-4 px-5 py-2.5 bg-white border-b border-slate-200 shadow-sm">
      {/* ── Brand + call ID ── */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <Phone className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
            SoundSense QA
          </span>
        </div>

        <div className="h-5 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800">{call.id}</span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              direction === 'Inbound'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {direction}
          </span>
          {sessions[call.id]?.completedAt && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3 h-3" />
              Submitted
            </span>
          )}
        </div>
      </div>

      {/* ── Centre: metadata + progress ── */}
      <div className="flex items-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {call.estimated_duration}
        </span>
        <span className="hidden md:block">{formattedDate}</span>

        {/* Progress bar */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-slate-400 tabular-nums">
            {reviewedCount}/{calls.length} done
          </span>
        </div>
      </div>

      {/* ── Right: call navigator ── */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          disabled={currentIndex === 0}
          aria-label="Previous call"
          className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>
        <span className="text-xs text-slate-400 tabular-nums w-10 text-center">
          {currentIndex + 1} / {calls.length}
        </span>
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          disabled={currentIndex === calls.length - 1}
          aria-label="Next call"
          className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
        <select
          value={currentIndex}
          onChange={e => onNavigate(Number(e.target.value))}
          className="ml-1 text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Jump to call"
        >
          {calls.map((c, i) => {
            const done = !!sessions[c.id]?.completedAt;
            return (
              <option key={c.id} value={i}>
                {done ? '✓ ' : ''}{c.id}
              </option>
            );
          })}
        </select>
      </div>
    </header>
  );
}
