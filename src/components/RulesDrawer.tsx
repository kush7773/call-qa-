import { useState, useMemo } from 'react';
import { X, Search, BookOpen, AlertOctagon, CheckCircle } from 'lucide-react';
import { SUMMARY_RULES } from '../constants/rulesData';

interface RulesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesDrawer({ isOpen, onClose }: RulesDrawerProps) {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return SUMMARY_RULES;
    const q = search.toLowerCase();
    return SUMMARY_RULES.map(cat => ({
      ...cat,
      rules: cat.rules.filter(
        r =>
          r.label.toLowerCase().includes(q) ||
          r.detail.toLowerCase().includes(q) ||
          (r.prohibited && r.prohibited.toLowerCase().includes(q))
      ),
    })).filter(cat => cat.rules.length > 0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Summary Rules Checklist
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            aria-label="Close rules panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search rule (e.g. 'arrears', 'consent', 'StepChange')..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Rules Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No rules matching "{search}"
            </div>
          ) : (
            filteredCategories.map((cat, i) => (
              <div key={i} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700">{cat.title}</h4>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cat.badgeColor}`}
                  >
                    {cat.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  {cat.rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs space-y-1.5"
                    >
                      <div className="flex items-start gap-1.5 font-semibold text-slate-800">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{rule.label}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed pl-5">
                        {rule.detail}
                      </p>
                      {rule.prohibited && (
                        <div className="ml-5 p-1.5 rounded bg-rose-50 border border-rose-100 flex items-start gap-1 text-[11px] text-rose-700">
                          <AlertOctagon className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                          <span>{rule.prohibited}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400">
          Derived from client collection summary specification (UK Car Finance).
        </div>
      </div>
    </div>
  );
}
