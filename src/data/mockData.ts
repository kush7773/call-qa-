export interface TranscriptSegment {
        id: string;
        speaker: 'Agent' | 'Customer';
        timestamp: string;
        text: string;
      }
      
      export interface SummaryClaim {
        id: string;
        claim: string;
        status: 'pending' | 'accurate' | 'inaccurate' | 'omission';
        category: 'Policy' | 'Resolution' | 'Customer Request';
      }
      
      export interface CallData {
        callId: string;
        duration: string;
        confidenceScore: number;
        agentName: string;
        customerName: string;
        transcript: TranscriptSegment[];
        summary: SummaryClaim[];
      }
      
      export const mockCallData: CallData = {
        callId: 'CALL-2026-8842',
        duration: '04:15',
        confidenceScore: 88,
        agentName: 'Sarah Jenkins',
        customerName: 'Alex Rivera',
        transcript: [
          { id: 't1', speaker: 'Agent', timestamp: '00:04', text: 'Thank you for calling Support. My name is Sarah. How can I help you today?' },
          { id: 't2', speaker: 'Customer', timestamp: '00:12', text: 'Hi Sarah, I see a charge of $49 on my account that I didn\'t authorize, and I need a full refund.' },
          { id: 't3', speaker: 'Agent', timestamp: '00:25', text: 'I understand your frustration, Alex. Let me pull up your account. I see the $49 charge from yesterday.' },
          { id: 't4', speaker: 'Agent', timestamp: '00:42', text: 'According to our policy, subscription charges are non-refundable after 24 hours, but I can issue a 50% credit today.' },
          { id: 't5', speaker: 'Customer', timestamp: '00:58', text: 'That is unacceptable. I was told when I signed up that refunds were available within 7 days.' },
          { id: 't6', speaker: 'Agent', timestamp: '01:15', text: 'Let me escalate this to my supervisor. I will put a temporary hold on the account and email you within 24 hours.' }
        ],
        summary: [
          { id: 'c1', claim: 'Customer requested a full refund for an unauthorized $49 charge.', status: 'pending', category: 'Customer Request' },
          { id: 'c2', claim: 'Agent approved a 100% full refund immediately to the original payment method.', status: 'pending', category: 'Resolution' },
          { id: 'c3', claim: 'Agent explained the 24-hour non-refundable policy and offered a 50% credit.', status: 'pending', category: 'Policy' },
          { id: 'c4', claim: 'Agent escalated the issue to a supervisor with a promised 24-hour email follow-up.', status: 'pending', category: 'Resolution' }
        ]
      };