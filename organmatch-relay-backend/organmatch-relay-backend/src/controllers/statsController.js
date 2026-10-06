import { pool } from '../db/pool.js';
import { verifyChainIntegrity } from '../services/auditLogService.js';

export async function listAuditLog(req, res) {
  const { rows } = await pool.query(
    `SELECT al.*, m.code AS match_code
     FROM audit_logs al
     LEFT JOIN matches m ON m.id = al.related_match_id
     ORDER BY al.timestamp DESC LIMIT 50`
  );
  const chainValid = await verifyChainIntegrity();
  res.json({ entries: rows, chainValid });
}

export async function networkStats(req, res) {
  const [{ rows: [activeMatches] }, { rows: [patientsWaiting] }, { rows: [hospitals] }] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS count FROM matches WHERE status IN ('Proposed', 'Confirmed')`),
    pool.query(`SELECT COUNT(*)::int AS count FROM patients WHERE waitlist_status = 'Waiting'`),
    pool.query(`SELECT COUNT(*)::int AS count FROM hospitals`),
  ]);

  const { rows: [avgTime] } = await pool.query(
    `SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (confirmed_at - created_at)) / 60), 0)::numeric(6,1) AS avg_minutes
     FROM matches WHERE confirmed_at IS NOT NULL`
  );

  res.json({
    stats: [
      { label: 'Active Matches', value: String(activeMatches.count) },
      { label: 'Patients Waiting', value: String(patientsWaiting.count) },
      { label: 'Hospitals Connected', value: String(hospitals.count) },
      { label: 'Avg. Match Time', value: `${avgTime.avg_minutes} min` },
    ],
  });
}
