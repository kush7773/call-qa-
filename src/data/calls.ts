import rawCalls from './calls.json';
import type { RawCallRecord, CallRecord, TranscriptTurn, Speaker } from '../types';

/**
 * Parses a raw transcript string like:
 *   "T01 [00:00] Agent: Hello...\nT02 [00:06] Customer: Hi..."
 * into an array of TranscriptTurn objects.
 */
export function parseTranscript(raw: string): TranscriptTurn[] {
  const turns: TranscriptTurn[] = [];
  // Each turn starts with T## [mm:ss] Speaker:
  const lines = raw.split('\n');

  for (const line of lines) {
    // Match: T01 [00:00] Agent: text  OR  T14 [02:14] Transcript note: text
    const match = line.match(/^(T\d+)\s+\[(\d{2}:\d{2})\]\s+(.+?):\s*(.*)$/);
    if (!match) continue;

    const [, id, timestamp, rawSpeaker, text] = match;

    let speaker: Speaker;
    const lc = rawSpeaker.toLowerCase();
    if (lc === 'agent') {
      speaker = 'Agent';
    } else if (
      lc === 'customer' ||
      lc === 'father' ||
      lc === 'mother' ||
      lc === 'partner'
    ) {
      speaker = 'Customer'; // third-party callers grouped under Customer side
    } else {
      speaker = 'System'; // "Transcript note", "Unclear speaker" etc.
    }

    turns.push({ id, timestamp, speaker, text: text.trim() });
  }

  return turns;
}

/**
 * All 20 calls enriched with parsed transcript turns, sorted by call ID.
 */
export const calls: CallRecord[] = (rawCalls as RawCallRecord[])
  .map((r) => ({ ...r, turns: parseTranscript(r.transcript) }))
  .sort((a, b) => {
    // Sort CALL-001, CALL-002 … CALL-020
    const numA = parseInt(a.id.replace('CALL-', ''), 10);
    const numB = parseInt(b.id.replace('CALL-', ''), 10);
    return numA - numB;
  });
