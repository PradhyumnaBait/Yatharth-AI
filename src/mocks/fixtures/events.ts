import { FieldEvent } from '@/services/types';

export const HERO_EVENTS: FieldEvent[] = [
  {
    id: 'E-2091',
    source: 'voice',
    timestamp: '08:42 AM',
    rawText: 'Line 24-XX ki spool 17 welding complete ho gayi hai.',
    authorName: 'Rahul Patil',
    authorRole: 'Field Supervisor',
    authorPhone: '+91 98201 44102',
    authorCrew: 'Welding Crew B',
    thumbnailUrl: '/images/thumb-welding.jpg',
    status: 'Review',
    queueTier: 'Review',
    confidence: 94,
    suggestedActivityId: 'PIP-24-017',
    suggestedActivityName: 'Weld Piping System 24-XX',
    extractedInfo: {
      action: 'Welding',
      object: 'Spool 17',
      location: 'Line 24-XX',
      status: 'Completed',
    },
    reasons: [
      { label: 'Piping', matchedText: 'Line 24-XX' },
      { label: 'Line 24-XX', matchedText: 'Line 24-XX' },
      { label: 'Welding', matchedText: 'welding' },
      { label: 'Active activity', matchedText: 'In progress' },
    ],
    logicCheckStatus: 'Passed',
    logicCheckMessage: 'Predecessor PIP-24-016 complete. Retained Logic validated.',
    isAccumulator: true,
    accumulatorDetails: {
      current: 16,
      total: 42,
      unit: 'spools',
      percentOld: 38,
      percentNew: 40,
    },
  },
  {
    id: 'E-2092',
    source: 'voice',
    timestamp: '09:17 AM',
    rawText: 'KP 184.2 pe do sau meter trenching ho gayi.',
    authorName: 'Dinesh Rathod',
    authorRole: 'Civil Supervisor',
    authorCrew: 'Civil Crew',
    thumbnailUrl: '/images/thumb-trenching.jpg',
    status: 'Review',
    queueTier: 'Review',
    confidence: 78,
    suggestedActivityId: 'CIV-12-003',
    suggestedActivityName: 'Excavate Trench KP 180.0–185.0',
    extractedInfo: {
      action: 'Trenching',
      location: 'KP 184.2',
      quantity: '200',
      unit: 'm',
      status: 'In progress',
    },
    reasons: [
      { label: 'Trenching', matchedText: 'trenching' },
      { label: 'KP 184.2 range', matchedText: 'KP 184.2' },
    ],
    logicCheckStatus: 'Passed',
    isAccumulator: true,
    accumulatorDetails: {
      current: 4600,
      total: 5000,
      unit: 'm',
      percentOld: 92,
      percentNew: 96,
    },
  },
  {
    id: 'E-2093',
    source: 'excel',
    timestamp: '07:30 AM',
    rawText: '24XX-SP-012 Coating 100%',
    authorName: 'Contractor B',
    authorRole: 'Subcontractor Lead',
    status: 'Review',
    queueTier: 'Warning',
    confidence: 82,
    suggestedActivityId: 'PIP-24-018',
    suggestedActivityName: 'NDT & Coating Line 24-XX',
    extractedInfo: {
      action: 'Coating',
      object: '24XX-SP-012',
      status: 'Complete',
    },
    reasons: [
      { label: 'Coating', matchedText: 'Coating' },
      { label: 'Line 24-XX', matchedText: '24XX' },
    ],
    logicCheckStatus: 'Warning',
    logicCheckMessage: 'PIP-24-017 is not complete. Approving starts PIP-24-018 out of sequence (Retained Logic).',
  },
  {
    id: 'E-2094',
    source: 'voice',
    timestamp: '10:05 AM',
    rawText: '24 inch manifold ke saare joints weld ho gaye.',
    authorName: 'Imran Sheikh',
    authorRole: 'Welding Foreman',
    authorCrew: 'Welding Crew B',
    status: 'Review',
    queueTier: 'Review',
    confidence: 88,
    extractedInfo: {
      action: 'Welding',
      object: '24" manifold joints',
      status: 'Complete',
    },
    reasons: [
      { label: '24" manifold', matchedText: '24 inch manifold' },
      { label: 'Welding', matchedText: 'weld' },
    ],
    logicCheckStatus: 'Passed',
    isDistribute: true,
    distributeActivities: [
      { id: 'PIP-30-005', name: 'Weld Joint M-01-J1', confidence: 88 },
      { id: 'PIP-30-006', name: 'Weld Joint M-01-J2', confidence: 88 },
      { id: 'PIP-30-007', name: 'Weld Joint M-01-J3', confidence: 88 },
    ],
  },
  {
    id: 'E-2095',
    source: 'voice',
    timestamp: '06:45 AM',
    rawText: 'Pig launcher ki foundation ka PCC curing shuru hai.',
    authorName: 'Dinesh Rathod',
    authorRole: 'Civil Supervisor',
    authorCrew: 'Civil Crew',
    status: 'Unmatched',
    queueTier: 'Unmatched',
    confidence: 41,
    suggestedActivityId: 'CIV-15-001',
    suggestedActivityName: 'Pig Launcher Excavation (Best guess 41%)',
    extractedInfo: {
      action: 'Curing',
      object: 'PCC Foundation',
      location: 'Pig launcher',
      status: 'In progress',
    },
    reasons: [],
    logicCheckStatus: 'Failed',
    logicCheckMessage: 'Confidence below review threshold (41% < 60%). No matching WBS activity found.',
  },
  {
    id: 'E-2096',
    source: 'voice',
    timestamp: '11:15 AM',
    rawText: 'Kal se crane nahi aayi, lowering ruka hua hai.',
    authorName: 'Suresh Yadav',
    authorRole: 'Piping Foreman',
    authorCrew: 'Piping Crew A',
    status: 'Delay',
    queueTier: 'Delay',
    confidence: 90,
    suggestedActivityId: 'PIP-24-021',
    suggestedActivityName: 'Lower Pipe KP 181.0–183.0',
    delayCategory: 'Equipment / crane',
    daysLost: 2,
    extractedInfo: {
      action: 'Lowering',
      status: 'Delay',
    },
    reasons: [
      { label: 'Lowering', matchedText: 'lowering' },
      { label: 'Crane unavailable', matchedText: 'crane nahi aayi' },
    ],
    logicCheckStatus: 'Passed',
  },
  {
    id: 'E-2097',
    source: 'excel',
    timestamp: '08:00 AM',
    rawText: 'String Pipe Line 24-XX 100%',
    authorName: 'Contractor A',
    authorRole: 'Subcontractor Lead',
    status: 'Review',
    queueTier: 'Warning',
    confidence: 96,
    suggestedActivityId: 'PIP-24-010',
    suggestedActivityName: 'String Pipe Line 24-XX',
    isConflict: true,
    conflictEventId: 'E-2098',
    extractedInfo: {
      action: 'Stringing',
      location: 'Line 24-XX',
      status: 'Complete',
    },
    reasons: [{ label: 'Conflict with E-2098', matchedText: 'String Pipe Line 24-XX' }],
    logicCheckStatus: 'Warning',
    logicCheckMessage: 'Two contractors report 100% on PIP-24-010 on different dates.',
  },
  {
    id: 'E-2098',
    source: 'excel',
    timestamp: '08:15 AM',
    rawText: 'String Pipe Line 24-XX 100%',
    authorName: 'Contractor B',
    authorRole: 'Subcontractor Lead',
    status: 'Review',
    queueTier: 'Warning',
    confidence: 96,
    suggestedActivityId: 'PIP-24-010',
    suggestedActivityName: 'String Pipe Line 24-XX',
    isConflict: true,
    conflictEventId: 'E-2097',
    extractedInfo: {
      action: 'Stringing',
      location: 'Line 24-XX',
      status: 'Complete',
    },
    reasons: [{ label: 'Conflict with E-2097', matchedText: 'String Pipe Line 24-XX' }],
    logicCheckStatus: 'Warning',
    logicCheckMessage: 'Two contractors report 100% on PIP-24-010 on different dates.',
  },
  {
    id: 'E-2101',
    source: 'voice',
    timestamp: '07:15 AM',
    rawText: 'F/R/P chalu hai',
    authorName: 'Rahul Patil',
    authorRole: 'Field Supervisor',
    status: 'Unmatched',
    queueTier: 'Unmatched',
    confidence: 52,
    extractedInfo: {
      action: 'Fabrication / Rework / Punch',
      status: 'In progress',
    },
    reasons: [],
    logicCheckStatus: 'Failed',
    logicCheckMessage: 'Unrecognized task scope. Requires planner decision or clarification.',
  },
  {
    id: 'E-2102',
    source: 'excel',
    timestamp: '07:45 AM',
    rawText: 'SP-031 rework',
    authorName: 'Contractor B',
    authorRole: 'Subcontractor Lead',
    status: 'Unmatched',
    queueTier: 'Unmatched',
    confidence: 47,
    extractedInfo: {
      action: 'Rework',
      object: 'SP-031',
    },
    reasons: [],
    logicCheckStatus: 'Failed',
  },
  {
    id: 'E-2103',
    source: 'voice',
    timestamp: '11:45 AM',
    rawText: 'Barish ki wajah se trench mein paani bhar gaya, kaam band.',
    authorName: 'Dinesh Rathod',
    authorRole: 'Civil Supervisor',
    status: 'Delay',
    queueTier: 'Delay',
    confidence: 84,
    suggestedActivityId: 'CIV-12-003',
    suggestedActivityName: 'Excavate Trench KP 180.0–185.0',
    delayCategory: 'Weather',
    daysLost: 1,
    extractedInfo: {
      action: 'Dewatering required',
      status: 'Delay',
    },
    reasons: [{ label: 'Rain / flooding', matchedText: 'barish' }],
    logicCheckStatus: 'Passed',
  },
  {
    id: 'E-2104',
    source: 'pdf',
    timestamp: '12:00 PM',
    rawText: 'Coating work halted awaiting RFI-0387 approval on field joint coating spec.',
    authorName: 'Quality Inspector',
    authorRole: 'QA/QC Lead',
    status: 'Delay',
    queueTier: 'Delay',
    confidence: 91,
    suggestedActivityId: 'PIP-24-018',
    suggestedActivityName: 'NDT & Coating Line 24-XX',
    delayCategory: 'RFI / engineering',
    daysLost: 2,
    extractedInfo: {
      action: 'Hold',
      status: 'Delay',
    },
    reasons: [{ label: 'RFI pending', matchedText: 'RFI-0387' }],
    logicCheckStatus: 'Passed',
  },
];

export function generateSeedEvents(snapshot: 'reference' | 'demo-start' = 'demo-start'): FieldEvent[] {
  const heroCopy: FieldEvent[] = HERO_EVENTS.map((e) => ({ ...e }));

  // In snapshot 'reference', E-2091 starts already Verified!
  if (snapshot === 'reference') {
    const e2091 = heroCopy.find((e) => e.id === 'E-2091');
    if (e2091) {
      e2091.status = 'Verified';
      e2091.queueTier = 'Verified';
      e2091.approvedAt = '2026-09-20T08:45:00+05:30';
      e2091.approvedBy = 'Meera Nair';
    }
  }

  // Count current categories in heroCopy:
  // Delays: E-2096, E-2103, E-2104 -> Exactly 3 delays!
  // In demo-start:
  //   Review-tier: E-2091 (1), E-2092 (1), E-2093 (1), E-2094 (1), E-2097 (1), E-2098 (1) = 6 events
  //   Unmatched-tier: E-2095 (1), E-2101 (1), E-2102 (1) = 3 events
  //   Total Review queue (Review + Unmatched) = 9 events.
  //   We need exactly 12 events in the Review queue for demo-start (9 review + 3 unmatched), so we add 3 more review events.
  //   We need exactly 47 Verified events for demo-start!
  const events: FieldEvent[] = [...heroCopy];

  // Add 3 more review events to hit exactly 12 in the Review queue
  const extraReviewEvents: FieldEvent[] = [
    {
      id: 'E-2088',
      source: 'voice',
      timestamp: '07:10 AM',
      rawText: 'Line 24-XX fit-up joint 14 inspect kar liya gaya hai.',
      authorName: 'Rahul Patil',
      authorRole: 'Field Supervisor',
      status: 'Review',
      queueTier: 'Review',
      confidence: 91,
      suggestedActivityId: 'PIP-24-017',
      suggestedActivityName: 'Weld Piping System 24-XX',
      extractedInfo: { action: 'Fit-up', object: 'Joint 14', location: 'Line 24-XX', status: 'In progress' },
      reasons: [{ label: 'Fit-up', matchedText: 'fit-up' }],
      logicCheckStatus: 'Passed',
    },
    {
      id: 'E-2089',
      source: 'excel',
      timestamp: '07:25 AM',
      rawText: 'Stringing line 24-XX joint padding complete',
      authorName: 'Contractor A',
      authorRole: 'Subcontractor Lead',
      status: 'Review',
      queueTier: 'Review',
      confidence: 85,
      suggestedActivityId: 'PIP-24-010',
      suggestedActivityName: 'String Pipe Line 24-XX',
      extractedInfo: { action: 'Padding', location: 'Line 24-XX' },
      reasons: [{ label: 'Stringing', matchedText: 'Stringing' }],
      logicCheckStatus: 'Passed',
    },
    {
      id: 'E-2090',
      source: 'voice',
      timestamp: '08:12 AM',
      rawText: 'Trench dewatering near culvert KP 182 complete.',
      authorName: 'Dinesh Rathod',
      authorRole: 'Civil Supervisor',
      status: 'Review',
      queueTier: 'Review',
      confidence: 89,
      suggestedActivityId: 'CIV-12-003',
      suggestedActivityName: 'Excavate Trench KP 180.0–185.0',
      extractedInfo: { action: 'Dewatering', location: 'KP 182' },
      reasons: [{ label: 'Trenching', matchedText: 'Trench' }],
      logicCheckStatus: 'Passed',
    },
  ];

  events.push(...extraReviewEvents);

  // In snapshot 'reference', E-2091 is verified, so we add 1 review event to maintain exactly 12 in Review
  if (snapshot === 'reference') {
    events.push({
      id: 'E-2087',
      source: 'voice',
      timestamp: '06:55 AM',
      rawText: 'Section KP 179 pre-trench grading complete.',
      authorName: 'Dinesh Rathod',
      authorRole: 'Civil Supervisor',
      status: 'Review',
      queueTier: 'Review',
      confidence: 88,
      suggestedActivityId: 'CIV-12-002',
      suggestedActivityName: 'Clear & Grade KP 180.0–185.0',
      extractedInfo: { action: 'Grading', location: 'KP 179' },
      reasons: [{ label: 'Grading', matchedText: 'grading' }],
      logicCheckStatus: 'Passed',
    });
  }

  // Generate Verified events to reach exactly 47 Verified in demo-start
  const verifiedCountNeeded = snapshot === 'reference' ? 47 : 47;
  const currentVerified = events.filter((e) => e.status === 'Verified').length;
  const toGenerateVerified = verifiedCountNeeded - currentVerified;

  for (let i = 1; i <= toGenerateVerified; i++) {
    const id = `E-${String(2040 + i).padStart(4, '0')}`;
    const dayOffset = (i % 6) + 1;
    const hour = 8 + (i % 9);
    const minute = (i * 7) % 60;
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} AM`;

    events.push({
      id,
      source: i % 2 === 0 ? 'voice' : 'excel',
      timestamp: timeStr,
      rawText: `Verified progress report for section KP ${(178 + (i % 8) * 1.2).toFixed(1)} verified.`,
      authorName: i % 3 === 0 ? 'Rahul Patil' : i % 3 === 1 ? 'Dinesh Rathod' : 'Suresh Yadav',
      authorRole: 'Supervisor',
      status: 'Verified',
      queueTier: 'Verified',
      confidence: 96,
      suggestedActivityId: 'PIP-24-016',
      suggestedActivityName: 'Install Pipe Line 24-XX',
      extractedInfo: { status: 'Verified' },
      reasons: [{ label: 'Planner verified', matchedText: 'Verified' }],
      logicCheckStatus: 'Passed',
      approvedAt: `2026-09-${String(20 - dayOffset).padStart(2, '0')}T10:00:00+05:30`,
      approvedBy: 'Meera Nair',
    });
  }

  return events;
}
