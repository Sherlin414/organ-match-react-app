import { User, Route, Jurisdiction, Vehicle, Match } from '../models/index.js';
import { emitToRole } from '../realtime/io.js';
import { writeAuditLog } from '../services/auditLogService.js';

export async function myCorridorAlerts(req, res) {
  const officer = await User.findById(req.user.id);

  const activeRoutes = await Route.find({ status: 'Active' })
    .populate('vehicle_id')
    .populate('match_id')
    .populate('route_jurisdictions.jurisdiction_id')
    .sort({ created_at: -1 });

  const totalJurisdictions = await Jurisdiction.countDocuments();
  const alerts = [];

  for (const route of activeRoutes) {
    const match = route.match_id || {};
    const vehicle = route.vehicle_id || {};

    for (const rj of route.route_jurisdictions || []) {
      const jurisdictionId = rj.jurisdiction_id?._id?.toString() || rj.jurisdiction_id?.toString();

      // Match officer's jurisdiction if they have one assigned, or include all if general police
      const matchesOfficer = !officer?.jurisdiction_id || officer.jurisdiction_id.toString() === jurisdictionId;

      if (matchesOfficer && !rj.exit_confirmed_at) {
        const jName = rj.jurisdiction_id?.name || 'Sector Traffic Control';
        const minutesOut = Math.max(2, 3 + (rj.sequence_order - 1) * 5);
        const isFirst = rj.sequence_order === 1;
        const isLast = Number(rj.sequence_order) === Number(totalJurisdictions);

        alerts.push({
          id: rj._id.toString(),
          route_id: route._id.toString(),
          route_status: route.status,
          match_code: match.code || 'MTC-ACTIVE',
          vehicle_code: vehicle.code || 'AMB-114',
          jurisdiction_name: jName,
          sequence_order: rj.sequence_order,
          total_jurisdictions: totalJurisdictions,
          minutes_out: minutesOut,
          entry_point: isFirst ? 'Donor hospital corridor entry' : `Handoff from Sector ${rj.sequence_order - 1} checkpoint`,
          exit_point: isLast ? 'Recipient hospital emergency ramp' : `Handoff to Sector ${rj.sequence_order + 1} checkpoint`,
          signal_count: 3 + rj.sequence_order,
          alert_sent_at: rj.alert_sent_at,
          congestion_flagged: rj.congestion_flagged,
          congestion_details: rj.congestion_details,
        });
      }
    }
  }

  res.json({ alerts });
}

export async function clearSignals(req, res) {
  const { id } = req.params;

  const route = await Route.findOne({ 'route_jurisdictions._id': id });
  if (!route) return res.status(404).json({ message: 'Corridor alert not found.' });

  const sub = route.route_jurisdictions.id(id);
  if (sub) {
    sub.exit_confirmed_at = new Date();
    await route.save();
  }

  await writeAuditLog({
    relatedMatchId: route.match_id,
    eventType: 'SignalPreempted',
    details: `Green wave override confirmed & all sector traffic signals locked green by police officer ${req.user.id}.`,
  });

  emitToRole('POLICE', 'signals:cleared', { alertId: id, routeId: route._id });
  emitToRole('AMBULANCE', 'signals:cleared', { alertId: id, routeId: route._id });

  res.json({ success: true, message: 'Signals cleared to green along corridor sector.' });
}

export async function flagCongestion(req, res) {
  const { id } = req.params;
  const { description } = req.body;

  const route = await Route.findOne({ 'route_jurisdictions._id': id });
  if (!route) return res.status(404).json({ message: 'Corridor alert not found.' });

  const sub = route.route_jurisdictions.id(id);
  if (sub) {
    sub.congestion_flagged = true;
    sub.congestion_details = description || 'Congestion flagged';
    await route.save();
  }

  await writeAuditLog({
    relatedMatchId: route.match_id,
    eventType: 'CorridorCongestionFlagged',
    details: `Traffic congestion flagged along corridor sector by police officer ${req.user.id}: ${description || 'Civilian vehicle buildup'}.`,
  });

  emitToRole('POLICE', 'congestion:flagged', { alertId: id, description });
  emitToRole('AMBULANCE', 'congestion:flagged', { alertId: id, description });

  res.json({ success: true, message: `Congestion flagged: ${description || 'no details provided'}` });
}
