export interface AskResponse {
  answer: string;
  summaryTable?: { headers: string[]; rows: string[][] };
  sourceLine: string;
  actionButton?: { label: string; href: string };
}

export function handleAskQuery(query: string): AskResponse {
  const q = query.toLowerCase();

  if (q.includes('piping') && q.includes('delay')) {
    return {
      answer: 'PIP-24-021 (Lower Pipe KP 181.0–183.0) is delayed by 2 days due to crane unavailability on the critical path.',
      summaryTable: {
        headers: ['Activity ID', 'Activity Name', 'Days Late', 'Critical Path'],
        rows: [
          ['PIP-24-021', 'Lower Pipe KP 181.0–183.0', '2 days', 'Yes'],
          ['PIP-24-018', 'NDT & Coating Line 24-XX', '2 days', 'Yes'],
        ],
      },
      sourceLine: '2 delay events · data date 20 Sep 2026',
      actionButton: { label: 'Open in Schedule', href: '/schedule' },
    };
  }

  if (q.includes('driving') || (q.includes('delay') && q.includes('cause'))) {
    return {
      answer: 'Equipment/crane unavailability is the primary delay driver, causing 11 days lost across 9 events (Lowering-in on critical path).',
      summaryTable: {
        headers: ['Cause', 'Events', 'Days Lost', 'Impact'],
        rows: [
          ['Equipment / crane', '9', '11 days', 'Critical path (Lowering)'],
          ['Weather', '7', '6 days', 'Non-critical (Trenching)'],
          ['RFI / engineering', '5', '4 days', 'Critical path (Coating)'],
        ],
      },
      sourceLine: '27 delay events · data date 20 Sep 2026',
      actionButton: { label: 'Open Analytics', href: '/analytics' },
    };
  }

  if (q.includes('trenching')) {
    return {
      answer: 'Trenching achieved +200 m progress at KP 184.2 today. Overall Trenching physical progress is at 96% (planned 100%).',
      summaryTable: {
        headers: ['Metric', 'Achieved', 'Planned', 'Status'],
        rows: [
          ['Progress Today', '200 m', '150 m', 'On track'],
          ['Phase Total', '96%', '100%', '4% behind plan'],
        ],
      },
      sourceLine: 'Reported by Dinesh Rathod · 09:17 AM',
      actionButton: { label: 'Open in Schedule', href: '/schedule' },
    };
  }

  if (q.includes('out-of-sequence') || q.includes('sequence')) {
    return {
      answer: '1 out-of-sequence execution detected: E-2093 reports coating on PIP-24-018 while predecessor PIP-24-017 is incomplete.',
      summaryTable: {
        headers: ['Event', 'Activity', 'Predecessor', 'P6 Scheduling Mode'],
        rows: [['E-2093', 'PIP-24-018', 'PIP-24-017 (38%)', 'Retained Logic warning']],
      },
      sourceLine: 'Planner Workbench · Queue item #3',
      actionButton: { label: 'Open in Workbench', href: '/workbench' },
    };
  }

  if (q.includes('pending') || q.includes('review') || q.includes('queue')) {
    return {
      answer: '12 events are pending review in the Planner Workbench (9 review-tier, 3 unmatched, 2 carrying warnings).',
      summaryTable: {
        headers: ['Tier', 'Count', 'Oldest Event'],
        rows: [
          ['Review', '9', 'E-2091 (08:42 AM)'],
          ['Unmatched', '3', 'E-2095 (06:45 AM)'],
          ['Warnings', '2', 'E-2093, E-2097'],
        ],
      },
      sourceLine: 'Data Freshness: 00:03 · data date 20 Sep 2026',
      actionButton: { label: 'Open in Workbench', href: '/workbench' },
    };
  }

  if (q.includes('critical path') || q.includes('critical')) {
    return {
      answer: 'Yes, Welding (PIP-24-017) is on the active critical path, feeding into NDT & Coating (PIP-24-018) and Hydrotest (PIP-24-024).',
      summaryTable: {
        headers: ['Critical Sequence', 'Current %', 'Float'],
        rows: [
          ['PIP-24-017 Weld Piping System', '38%', '0 days'],
          ['PIP-24-018 NDT & Coating', '0%', '0 days'],
          ['PIP-24-024 Hydrotest', '0%', '0 days'],
        ],
      },
      sourceLine: 'Baseline: P6 XER v3 · Critical Path Analysis',
      actionButton: { label: 'Open in Schedule', href: '/schedule' },
    };
  }

  return {
    answer: 'I can answer questions about delays, progress by phase, out-of-sequence work, review queue and critical path.',
    sourceLine: 'SchedBridge AI Query Engine · 20 Sep 2026',
  };
}
