import crypto from 'crypto';
import { AuditLog } from '../models/index.js';

function hashEntry({ previousHash, eventType, timestamp, details }) {
  return crypto
    .createHash('sha256')
    .update(`${previousHash}|${eventType}|${timestamp}|${details || ''}`)
    .digest('hex');
}

export async function writeAuditLog({ relatedMatchId = null, eventType, details = '' }) {
  const last = await AuditLog.findOne().sort({ timestamp: -1 });
  const previousHash = last?.current_hash || '0'.repeat(64);
  const timestamp = new Date().toISOString();
  const currentHash = hashEntry({ previousHash, eventType, timestamp, details });

  const entry = await AuditLog.create({
    related_match_id: relatedMatchId,
    event_type: eventType,
    timestamp: new Date(timestamp),
    previous_hash: previousHash,
    current_hash: currentHash,
    details,
  });

  return entry;
}

export async function verifyChainIntegrity() {
  const rows = await AuditLog.find().sort({ timestamp: 1 });
  let expectedPrevious = '0'.repeat(64);
  for (const entry of rows) {
    if (entry.previous_hash !== expectedPrevious) return false;
    const recomputed = hashEntry({
      previousHash: entry.previous_hash,
      eventType: entry.event_type,
      timestamp: entry.timestamp.toISOString(),
      details: entry.details,
    });
    if (recomputed !== entry.current_hash) return false;
    expectedPrevious = entry.current_hash;
  }
  return true;
}
