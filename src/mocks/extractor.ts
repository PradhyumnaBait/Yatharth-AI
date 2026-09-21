import { ExtractedInfo } from '@/services/types';

export interface ClarificationQuestion {
  field: 'location' | 'object' | 'action';
  question: string;
  chips: string[];
}

export function extractFieldInfo(rawText: string): ExtractedInfo {
  const text = rawText.toLowerCase();
  const info: ExtractedInfo = {};

  // Hero overrides & specific patterns
  if (text.includes('spool 17') && text.includes('line 24-xx')) {
    return {
      action: 'Welding',
      object: 'Spool 17',
      location: 'Line 24-XX',
      status: 'Completed',
    };
  }

  if (text.includes('spool 18') && text.includes('line 24-xx')) {
    return {
      action: 'Welding',
      object: 'Spool 18',
      location: 'Line 24-XX',
      status: 'Completed',
    };
  }

  // Spool N pattern
  const spoolMatch = rawText.match(/spool\s+(\d+)/i);
  if (spoolMatch) {
    info.object = `Spool ${spoolMatch[1]}`;
  } else if (text.includes('spool')) {
    info.object = 'Spool';
  }

  // Joint N pattern
  const jointMatch = rawText.match(/joint\s+(\d+)/i);
  if (jointMatch) {
    info.object = `Joint ${jointMatch[1]}`;
  }

  // Manifold / Pipe pattern
  if (text.includes('manifold')) {
    info.object = '24" Manifold';
  } else if (text.includes('pipe') && !info.object) {
    info.object = 'Pipe String';
  }

  // Line pattern (e.g. Line 24-XX)
  const lineMatch = rawText.match(/line\s+([\w-]+)/i);
  if (lineMatch) {
    info.location = `Line ${lineMatch[1].toUpperCase()}`;
  }

  // KP pattern (e.g. KP 184.2)
  const kpMatch = rawText.match(/kp\s+([\d.]+)/i);
  if (kpMatch) {
    info.location = `KP ${kpMatch[1].toUpperCase()}`;
  }

  // Quantity pattern (e.g. 200 m or do sau meter)
  if (text.includes('do sau meter') || text.includes('200 m') || text.includes('200 meter')) {
    info.quantity = '200';
    info.unit = 'm';
  } else {
    const qtyMatch = rawText.match(/(\d+)\s*(m|meter|spool|joints?)/i);
    if (qtyMatch) {
      info.quantity = qtyMatch[1];
      info.unit = qtyMatch[2].toLowerCase().startsWith('m') ? 'm' : 'spools';
    }
  }

  // Actions
  if (text.includes('weld') || text.includes('welding')) {
    info.action = 'Welding';
  } else if (text.includes('trench') || text.includes('trenching')) {
    info.action = 'Trenching';
  } else if (text.includes('erect') || text.includes('erection')) {
    info.action = 'Erection';
  } else if (text.includes('coating') || text.includes('coat')) {
    info.action = 'Coating';
  } else if (text.includes('lowering') || text.includes('lower')) {
    info.action = 'Lowering';
  } else if (text.includes('string') || text.includes('stringing')) {
    info.action = 'Stringing';
  } else if (text.includes('curing') || text.includes('cure')) {
    info.action = 'Curing';
  } else if (text.includes('hydrotest') || text.includes('pressure test')) {
    info.action = 'Hydrotest';
  }

  // Status with Hindi-English romanised keywords
  // complete/ho gayi/ho gaya/khatam/finished/done → Completed
  // shuru/chalu/start → Started
  // ruka/nahi aayi/barish/rfi/halted/band/delay/stopped → Delay
  if (
    text.includes('ho gayi') ||
    text.includes('ho gaya') ||
    text.includes('khatam') ||
    text.includes('finished') ||
    text.includes('complete') ||
    text.includes('done') ||
    text.includes('100%')
  ) {
    info.status = 'Completed';
  } else if (
    text.includes('ruka') ||
    text.includes('nahi aayi') ||
    text.includes('barish') ||
    text.includes('rfi') ||
    text.includes('halted') ||
    text.includes('band') ||
    text.includes('delay') ||
    text.includes('stopped')
  ) {
    info.status = 'Delay';
  } else if (
    text.includes('shuru') ||
    text.includes('chalu') ||
    text.includes('start')
  ) {
    info.status = 'Started';
  } else {
    info.status = 'In progress';
  }

  return info;
}

export function getClarificationQuestion(info: ExtractedInfo): ClarificationQuestion | null {
  // Delay status reports route directly to the Confirm card's Delay branch for category selection
  if (info.status === 'Delay') {
    return null;
  }

  // If Location is missing
  if (!info.location) {
    return {
      field: 'location',
      question: 'Which line or area was this for?',
      chips: ['Line 24-XX', 'Line 24-YY', 'KP 184.2'],
    };
  }

  // If Object is missing
  if (!info.object) {
    return {
      field: 'object',
      question: 'Which spool or item was being worked on?',
      chips: ['Spool 17', 'Spool 18', 'Line Pipe'],
    };
  }

  return null;
}
