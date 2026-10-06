import { Match, Organ, Patient, Vehicle, Hospital, Jurisdiction, Route, User, Notification } from '../models/index.js';
import { writeAuditLog } from './auditLogService.js';
import { emitToUser, emitToRole } from '../realtime/io.js';
import { calculateHaversineDistanceKm } from './matchingEngine.js';

export async function generateRoute(matchId) {
  const match = await Match.findById(matchId)
    .populate('organ_id')
    .populate('patient_id');
  if (!match) throw new Error('Match not found');

  const organ = await Organ.findById(match.organ_id);
  const patient = await Patient.findById(match.patient_id);
  if (!organ || !patient) throw new Error('Organ or patient missing for match');

  const donorHospital = await Hospital.findById(organ.donor_hospital_id);
  const recipientHospital = await Hospital.findById(patient.registered_hospital_id);

  let vehicle = await Vehicle.findOne({ status: 'Idle' });
  if (!vehicle) {
    // If no vehicle is currently marked idle, find any vehicle or assign first
    vehicle = await Vehicle.findOne();
    if (!vehicle) {
      await writeAuditLog({
        relatedMatchId: matchId,
        eventType: 'RouteGenerationFailed',
        details: `No emergency transit vehicle registered in municipal database for match ${match.code}.`,
      });
      return null;
    }
  }

  // Calculate real distance & travel time based on coordinates
  const distanceKm = calculateHaversineDistanceKm(
    donorHospital?.location_lat || 13.0827,
    donorHospital?.location_lng || 80.2707,
    recipientHospital?.location_lat || 13.0604,
    recipientHospital?.location_lng || 80.2496
  );

  // Average green corridor transit speed ~55 km/h + 4 min corridor staging
  const estimatedTravelMinutes = Math.max(10, Math.round((distanceKm / 55) * 60 + 4));
  const viabilityTimeLimit = Math.max(0, organ.viability_window_minutes - estimatedTravelMinutes);

  // Generate real intermediate waypoints along the route
  const startLat = donorHospital?.location_lat || 13.0827;
  const startLng = donorHospital?.location_lng || 80.2707;
  const endLat = recipientHospital?.location_lat || 13.0604;
  const endLng = recipientHospital?.location_lng || 80.2496;

  const jurisdictions = await Jurisdiction.find().sort({ sequence_hint: 1 });

  const waypoints = [
    {
      name: `${donorHospital?.name || 'Donor Base'} (Departure Dock)`,
      lat: startLat,
      lng: startLng,
      type: 'origin',
      status: 'Departed',
      cleared: true,
    },
  ];

  const routeJurisdictions = [];
  let seq = 1;

  for (const j of jurisdictions) {
    const fraction = seq / (jurisdictions.length + 1);
    const jLat = startLat + (endLat - startLat) * fraction;
    const jLng = startLng + (endLng - startLng) * fraction;

    waypoints.push({
      name: `${j.name} (Corridor Post)`,
      lat: j.lat || jLat,
      lng: j.lng || jLng,
      type: 'jurisdiction',
      status: seq === 1 ? 'Signals Preempted' : 'Upcoming',
      cleared: seq === 1,
      sequence_order: seq,
    });

    routeJurisdictions.push({
      jurisdiction_id: j._id,
      sequence_order: seq,
      alert_sent_at: new Date(),
      exit_confirmed_at: null,
      congestion_flagged: false,
    });

    const policeOfficers = await User.find({ role: 'POLICE', jurisdiction_id: j._id });
    const minutesOut = Math.max(2, Math.round(3 + (seq - 1) * (estimatedTravelMinutes / (jurisdictions.length || 1))));

    for (const officer of policeOfficers) {
      const message = `Incoming green corridor alert: vehicle ${vehicle.code} approaching for match ${match.code}, ~${minutesOut} min out.`;
      await Notification.create({
        recipient_id: officer._id,
        message,
        type: 'CorridorAlert',
        data: { matchCode: match.code, vehicleCode: vehicle.code, minutesOut },
      });
      emitToUser(officer._id.toString(), 'corridor:alert', {
        matchCode: match.code,
        vehicleCode: vehicle.code,
        jurisdictionName: j.name,
        sequenceOrder: seq,
        minutesOut,
        message,
      });
    }

    seq++;
  }

  waypoints.push({
    name: `${recipientHospital?.name || 'Recipient OR'} (Arrival Ramp)`,
    lat: endLat,
    lng: endLng,
    type: 'destination',
    status: 'Destination',
    cleared: false,
  });

  const route = await Route.create({
    match_id: match._id,
    vehicle_id: vehicle._id,
    from_hospital_id: donorHospital?._id,
    to_hospital_id: recipientHospital?._id,
    estimated_travel_time_minutes: estimatedTravelMinutes,
    distance_km: distanceKm,
    viability_time_limit_minutes: viabilityTimeLimit,
    waypoints,
    route_jurisdictions: routeJurisdictions,
    status: 'Active',
  });

  // Update vehicle and organ status
  await Vehicle.findByIdAndUpdate(vehicle._id, {
    status: 'Assigned',
    current_location_lat: startLat,
    current_location_lng: startLng,
  });
  await Organ.findByIdAndUpdate(organ._id, { status: 'InTransit' });

  // Notify driver
  if (vehicle.driver_id) {
    const driverMessage = `Assigned to emergency match ${match.code}. Transporting ${organ.organ_type} to ${recipientHospital?.name}. Distance: ${distanceKm} km, ETA: ${estimatedTravelMinutes} min.`;
    await Notification.create({
      recipient_id: vehicle.driver_id,
      message: driverMessage,
      type: 'RouteAssigned',
      data: { routeId: route._id, matchCode: match.code },
    });
    emitToUser(vehicle.driver_id.toString(), 'route:generated', {
      routeId: route._id,
      matchCode: match.code,
      vehicleCode: vehicle.code,
      message: driverMessage,
      distanceKm,
      estimatedTravelMinutes,
    });
  }

  // Broadcast route activation to Police and Ambulance roles
  emitToRole('POLICE', 'route:active', { routeId: route._id, matchCode: match.code, vehicleCode: vehicle.code });
  emitToRole('AMBULANCE', 'route:active', { routeId: route._id, matchCode: match.code, vehicleCode: vehicle.code });

  await writeAuditLog({
    relatedMatchId: matchId,
    eventType: 'RouteGenerated',
    details: `Green corridor route ${route._id} generated for match ${match.code}: vehicle ${vehicle.code}, real distance ${distanceKm} km, calculated ETA ${estimatedTravelMinutes} min, crossing ${jurisdictions.length} jurisdiction(s).`,
  });

  return route;
}

export async function confirmDelivery(routeId, userId) {
  const route = await Route.findById(routeId);
  if (!route) throw new Error('Route not found');

  route.status = 'Completed';
  await route.save();

  await Vehicle.findByIdAndUpdate(route.vehicle_id, { status: 'Idle' });

  const match = await Match.findById(route.match_id);
  if (match) {
    await Organ.findByIdAndUpdate(match.organ_id, { status: 'Delivered' });
    await Patient.findByIdAndUpdate(match.patient_id, { waitlist_status: 'Transplanted' });

    await writeAuditLog({
      relatedMatchId: match._id,
      eventType: 'MatchDelivered',
      details: `Match ${match.code} organ delivered to destination OR successfully by user ${userId}.`,
    });

    const patient = await Patient.findById(match.patient_id);
    if (patient) {
      const admins = await User.find({
        role: 'HOSPITAL_ADMIN',
        hospital_id: patient.registered_hospital_id,
      });
      for (const admin of admins) {
        emitToUser(admin._id.toString(), 'delivery:confirmed', {
          matchCode: match.code,
          message: `Match ${match.code} delivered to Trauma Operating Room. Transplant surgery commencing.`,
        });
      }
      if (patient.registered_by) {
        emitToUser(patient.registered_by.toString(), 'delivery:confirmed', {
          matchCode: match.code,
          message: `Organ successfully delivered for patient ${patient.name}.`,
        });
      }
    }
  }

  emitToRole('HOSPITAL_ADMIN', 'delivery:completed', { routeId });
  emitToRole('DOCTOR', 'delivery:completed', { routeId });

  return route;
}

export async function updateVehicleLocation(routeId, lat, lng, speedKmh = 65) {
  const route = await Route.findById(routeId);
  if (!route) throw new Error('Route not found');

  await Vehicle.findByIdAndUpdate(route.vehicle_id, {
    current_location_lat: lat,
    current_location_lng: lng,
  });

  const payload = {
    routeId,
    vehicleId: route.vehicle_id,
    lat,
    lng,
    speedKmh,
    timestamp: new Date().toISOString(),
  };

  // Broadcast live location to all interested roles
  emitToRole('AMBULANCE', 'ambulance:location', payload);
  emitToRole('POLICE', 'ambulance:location', payload);
  emitToRole('HOSPITAL_ADMIN', 'ambulance:location', payload);
  emitToRole('DOCTOR', 'ambulance:location', payload);
  emitToRole('PATIENT', 'ambulance:location', payload);

  return payload;
}
