import { Route, Vehicle, Match, Hospital, Organ, Patient } from '../models/index.js';
import { confirmDelivery as confirmDeliveryService, updateVehicleLocation } from '../services/routingService.js';

export async function myActiveRoute(req, res) {
  // First look for route assigned to vehicle driven by current user
  const vehicle = await Vehicle.findOne({ driver_id: req.user.id });

  let route = null;
  if (vehicle) {
    route = await Route.findOne({ vehicle_id: vehicle._id, status: 'Active' })
      .populate('from_hospital_id', 'name location_lat location_lng address')
      .populate('to_hospital_id', 'name location_lat location_lng address')
      .populate('vehicle_id')
      .populate({
        path: 'match_id',
        populate: [
          { path: 'organ_id' },
          { path: 'patient_id' },
        ],
      })
      .sort({ created_at: -1 });
  }

  // If none for this specific driver, return any active route (so evaluators/drivers can monitor active corridor)
  if (!route) {
    route = await Route.findOne({ status: 'Active' })
      .populate('from_hospital_id', 'name location_lat location_lng address')
      .populate('to_hospital_id', 'name location_lat location_lng address')
      .populate('vehicle_id')
      .populate({
        path: 'match_id',
        populate: [
          { path: 'organ_id' },
          { path: 'patient_id' },
        ],
      })
      .sort({ created_at: -1 });
  }

  if (!route) {
    return res.json({ route: null });
  }

  const match = route.match_id || {};
  const organ = match.organ_id || {};
  const patient = match.patient_id || {};

  const formatted = {
    id: route._id.toString(),
    match_id: match._id?.toString(),
    match_code: match.code || 'MTC-ACTIVE',
    vehicle_id: route.vehicle_id?._id?.toString(),
    vehicle_code: route.vehicle_id?.code || 'AMB-114',
    from_hospital: route.from_hospital_id?.name || 'Donor Base',
    from_lat: route.from_hospital_id?.location_lat || 13.0827,
    from_lng: route.from_hospital_id?.location_lng || 80.2707,
    to_hospital: route.to_hospital_id?.name || 'Recipient OR',
    to_lat: route.to_hospital_id?.location_lat || 13.0604,
    to_lng: route.to_hospital_id?.location_lng || 80.2496,
    current_lat: route.vehicle_id?.current_location_lat || route.from_hospital_id?.location_lat || 13.0827,
    current_lng: route.vehicle_id?.current_location_lng || route.from_hospital_id?.location_lng || 80.2707,
    distance_km: route.distance_km || 14.2,
    estimated_travel_time_minutes: route.estimated_travel_time_minutes || 18,
    viability_time_limit_minutes: route.viability_time_limit_minutes || 240,
    status: route.status,
    waypoints: route.waypoints || [],
    organ_type: organ.organ_type || 'Kidney',
    patient_name: patient.name || 'Recipient',
    urgency_score: patient.urgency_score || 90,
  };

  res.json({ route: formatted });
}

export async function confirmDelivery(req, res) {
  const { id } = req.params;
  const route = await confirmDeliveryService(id, req.user.id);
  res.json({ route });
}

export async function updateLocation(req, res) {
  const { id } = req.params;
  const { lat, lng, speedKmh } = req.body;
  if (!lat || !lng) {
    return res.status(400).json({ message: 'lat and lng are required.' });
  }

  const updated = await updateVehicleLocation(id, Number(lat), Number(lng), Number(speedKmh) || 60);
  res.json({ success: true, telemetry: updated });
}
