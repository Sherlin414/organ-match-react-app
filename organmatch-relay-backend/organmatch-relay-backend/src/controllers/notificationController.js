import { pool } from '../db/pool.js';

export async function myNotifications(req, res) {
  const { rows } = await pool.query(
    `SELECT * FROM notifications WHERE recipient_id = $1 ORDER BY timestamp DESC LIMIT 20`,
    [req.user.id]
  );
  res.json({ notifications: rows });
}

export async function markRead(req, res) {
  const { id } = req.params;
  const { rows: [notification] } = await pool.query(
    `UPDATE notifications SET is_read = true WHERE id = $1 AND recipient_id = $2 RETURNING *`,
    [id, req.user.id]
  );
  if (!notification) return res.status(404).json({ message: 'Notification not found.' });
  res.json({ notification });
}
