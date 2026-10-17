export interface RuleCategory {
  title: string;
  badge: string;
  badgeColor: string;
  rules: { label: string; detail: string; prohibited?: string }[];
}

export const SUMMARY_RULES: RuleCategory[] = [
  {
    title: '1. Data Protection & Security (DPA)',
    badge: 'Mandatory',
    badgeColor: 'bg-blue-100 text-blue-800',
    rules: [
      {
        label: 'DPA Status',
        detail: 'Must state "DPA completed" ONLY if Name, DOB, and Address/Postcode were verified or pre-call automated security was confirmed.',
        prohibited: 'If verification or confirmed pre-call security is absent, must state "no DPA stated with agent".',
      },
      {
        label: 'Third Party / Authority to Act',
        detail: 'If a third party speaks, must state relationship and whether "Authority to Act" was verified for this call only or ongoing.',
      },
    ],
  },
  {
    title: '2. Direction & Contact Outcome',
    badge: 'Structure',
    badgeColor: 'bg-indigo-100 text-indigo-800',
    rules: [
      {
        label: 'Call Direction',
        detail: 'Must explicitly state "The customer called the company..." (Inbound) or "The company called the customer..." (Outbound).',
      },
      {
        label: 'Internal Calls',
        detail: 'If exclusively between agents, must state "Internal agent consultation", "Internal handover", or "Internal discussion".',
      },
    ],
  },
  {
    title: '3. Numerical Figures & Balances',
    badge: 'Critical Redaction',
    badgeColor: 'bg-red-100 text-red-800',
    rules: [
      {
        label: 'Arrears / Balance Amounts',
        detail: 'State only that "arrears were discussed" or "customer informed of balance".',
        prohibited: 'NEVER include numerical values for current arrears or total balance (e.g. NEVER write "arrears of £460").',
      },
      {
        label: 'Immediate Payments Taken on Call',
        detail: 'Use the phrase "Payment made."',
        prohibited: 'NEVER state the payment amount for payments processed during the call.',
      },
      {
        label: 'Situational & Future Costs (Allowed)',
        detail: 'MUST include specific financial amounts for repairs (e.g. "Turbo failure costing £800"), income loss, or future promises (e.g. "Agreed to pay £100 on Friday").',
      },
    ],
  },
  {
    title: '4. Privacy & Entity Redaction',
    badge: 'Compliance',
    badgeColor: 'bg-amber-100 text-amber-800',
    rules: [
      {
        label: 'Anonymity',
        detail: 'Never include customer names, agent names, or telephone numbers in the summary.',
      },
      {
        label: 'Private Entities',
        detail: 'Redact specific employer names, shops, or garages (e.g., "Customer works for Cedar Lane Distribution" must be redacted to "Customer changed jobs").',
      },
      {
        label: 'Named Advice Bodies (Retain)',
        detail: 'Public debt advice bodies (StepChange, Citizens Advice, MoneyHelper) MUST be explicitly retained by name.',
      },
    ],
  },
  {
    title: '5. Vulnerability & Consent',
    badge: 'Regulatory',
    badgeColor: 'bg-purple-100 text-purple-800',
    rules: [
      {
        label: 'Vulnerability Recording',
        detail: 'State the specific condition or hardship without generalization.',
      },
      {
        label: 'Consent Required',
        detail: 'If agent requested permission to record health/vulnerability and customer agreed, MUST include the exact phrase: "Consent gained to record vulnerability".',
      },
    ],
  },
  {
    title: '6. Tone, Language & Formatting',
    badge: 'Quality',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    rules: [
      {
        label: 'Conciseness & Structure',
        detail: '2 to 5 complete sentences. Objective, professional tone. No bullet points.',
      },
      {
        label: 'British English Only',
        detail: 'Must use UK spelling: "authorised" (not authorized), "centre" (not center), "programme" (not program).',
      },
      {
        label: 'Hold / Silence Hallucinations',
        detail: 'Ignore generic automated speech or hallucinated transcript fragments during hold periods or background silence.',
      },
      {
        label: 'Key Terminology',
        detail: 'Use "next steps" to describe future plans. MUST use phrase "risk of further action" if agent explicitly gave this warning.',
        prohibited: 'Do NOT use "further action" to describe the next plan.',
      },
    ],
  },
];
