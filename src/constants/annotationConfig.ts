import { CheckCircle2, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import type { AnnotationKind } from '../types';

export const KIND_CONFIG = {
  accurate: {
    icon: CheckCircle2,
    label: 'Accurate',
    popoverCls: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
    highlightCls: 'bg-green-100 border-b-2 border-green-400 text-green-900',
    dotCls: 'bg-green-400',
  },
  hallucination: {
    icon: XCircle,
    label: 'Hallucination',
    popoverCls: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200',
    highlightCls: 'bg-red-100 border-b-2 border-red-400 text-red-900',
    dotCls: 'bg-red-400',
  },
  omission: {
    icon: AlertCircle,
    label: 'Omission',
    popoverCls: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200',
    highlightCls: 'bg-yellow-100 border-b-2 border-yellow-400 text-yellow-900',
    dotCls: 'bg-yellow-400',
  },
  rule_breach: {
    icon: ShieldAlert,
    label: 'Rule Breach',
    popoverCls: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200',
    highlightCls: 'bg-purple-100 border-b-2 border-purple-400 text-purple-900',
    dotCls: 'bg-purple-400',
  },
} as const;

export const KIND_ORDER: AnnotationKind[] = ['accurate', 'hallucination', 'omission', 'rule_breach'];
