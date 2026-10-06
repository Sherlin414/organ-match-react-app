import bcrypt from 'bcryptjs';
import { User, Hospital, Patient } from '../models/index.js';
import { signToken } from '../middleware/auth.js';

const PRIVILEGED_ROLES = ['SYSTEM_ADMIN', 'POLICE', 'AMBULANCE'];

const EDITABLE_FIELDS_BY_ROLE = {
  PATIENT: ['name', 'contact_number'],
  DOCTOR: ['name', 'contact_number', 'license_number'],
  HOSPITAL_ADMIN: ['name', 'contact_number'],
  DONOR_COORDINATOR: ['name', 'contact_number'],
  SYSTEM_ADMIN: ['name', 'contact_number', 'organization_name'],
  AMBULANCE: ['name', 'contact_number', 'license_id'],
  POLICE: ['name', 'contact_number', 'station_name'],
};

function toPublicUser(userDoc) {
  if (!userDoc) return null;
  const obj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete obj.password_hash;
  obj.id = (obj._id || obj.id)?.toString();
  return obj;
}

export async function register(req, res) {
  const {
    name,
    email,
    password,
    role,
    contactNumber,
    hospitalName,
    registeredHospital,
    adminAuthKey,
    ...roleFields
  } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Name, email, password, and role are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedRole = role.toUpperCase();

  // Guard privileged roles from unauthorized self-registration
  if (PRIVILEGED_ROLES.includes(normalizedRole)) {
    const requiredKey = process.env.ADMIN_REGISTRATION_KEY || 'organmatch-admin-pass-2026';
    if (!adminAuthKey || adminAuthKey.trim() !== requiredKey) {
      return res.status(403).json({
        message: `Self-registration for privileged role '${normalizedRole}' requires a valid Administrative Authorization Key. Contact the System Administrator.`,
      });
    }
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email address already exists.' });
  }

  let hospitalId = null;
  const hospitalNameToResolve = hospitalName || registeredHospital;
  if (hospitalNameToResolve) {
    let hosp = await Hospital.findOne({ name: hospitalNameToResolve.trim() });
    if (!hosp) {
      hosp = await Hospital.create({
        name: hospitalNameToResolve.trim(),
        type: 'both',
        address: 'Medical District',
      });
    }
    hospitalId = hosp._id;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password_hash: passwordHash,
    role: normalizedRole,
    contact_number: contactNumber || null,
    hospital_id: hospitalId,
    license_number: roleFields.licenseNumber || null,
    organization_name: roleFields.organizationName || null,
    license_id: roleFields.licenseId || null,
    station_name: roleFields.stationName || null,
    organ_needed: normalizedRole === 'PATIENT' ? (roleFields.organNeeded || 'Kidney') : null,
    blood_type: normalizedRole === 'PATIENT' ? (roleFields.bloodType || 'O+') : null,
    urgency_score: normalizedRole === 'PATIENT' ? (Number(roleFields.urgencyScore) || 75.0) : null,
    registered_hospital_name: normalizedRole === 'PATIENT' ? (hospitalNameToResolve || null) : null,
    waitlist_status: normalizedRole === 'PATIENT' ? 'Waiting' : null,
  });

  // Automatically register patient record if role is PATIENT
  if (normalizedRole === 'PATIENT' && hospitalId) {
    const count = await Patient.countDocuments();
    const code = `P-${10000 + count + 1}`;
    await Patient.create({
      code,
      name: name.trim(),
      organ_needed: roleFields.organNeeded || 'Kidney',
      blood_type: roleFields.bloodType || 'O+',
      urgency_score: Number(roleFields.urgencyScore) || 75.0,
      registered_hospital_id: hospitalId,
      registered_by: newUser._id,
      waitlist_status: 'Waiting',
    });
  }

  const token = signToken(newUser);
  res.status(201).json({ token, user: toPublicUser(newUser) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id).populate('hospital_id').populate('jurisdiction_id');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: toPublicUser(user) });
}

export async function updateProfile(req, res) {
  const allowedFields = EDITABLE_FIELDS_BY_ROLE[req.user.role] || [];
  const updates = {};

  for (const [key, value] of Object.entries(req.body)) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(snakeKey)) {
      updates[snakeKey] = value;
    }
  }

  if (req.body.password) {
    updates.password_hash = await bcrypt.hash(req.body.password, 10);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No editable fields were provided.' });
  }

  const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true });
  res.json({ user: toPublicUser(user) });
}

export async function googleLogin(req, res) {
  const { email, name, role = 'PATIENT', googleId, credential } = req.body;
  if (!email && !credential) {
    return res.status(400).json({ message: 'Email or Google credential is required.' });
  }

  try {
    let resolvedEmail = email?.toLowerCase().trim();
    let resolvedName = name;
    let resolvedGoogleId = googleId;

    // If client sent Google GIS credential JWT, parse payload safely
    if (credential) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          resolvedEmail = payload.email?.toLowerCase().trim();
          resolvedName = payload.name || payload.given_name || resolvedName;
          resolvedGoogleId = payload.sub || resolvedGoogleId;
        }
      } catch (err) {
        console.warn('Could not decode GIS credential token, using body email if provided');
      }
    }

    if (!resolvedEmail) {
      return res.status(400).json({ message: 'Could not resolve email from Google credential.' });
    }

    let user = await User.findOne({ email: resolvedEmail });
    if (user) {
      // User exists: log in with their registered role from MongoDB
      if (resolvedGoogleId && !user.google_id) {
        user.google_id = resolvedGoogleId;
        await user.save();
      }
      const token = signToken(user);
      return res.json({ token, user: toPublicUser(user) });
    }

    // New Google user: do not allow self-registering as privileged role without authorization
    const requestedRole = (role || 'PATIENT').toUpperCase();
    const finalRole = PRIVILEGED_ROLES.includes(requestedRole) ? 'PATIENT' : requestedRole;

    const dummyPasswordHash = await bcrypt.hash(`oauth-${Date.now()}-${resolvedEmail}`, 10);
    user = await User.create({
      name: resolvedName || resolvedEmail.split('@')[0],
      email: resolvedEmail,
      password_hash: dummyPasswordHash,
      role: finalRole,
      google_id: resolvedGoogleId,
      waitlist_status: finalRole === 'PATIENT' ? 'Waiting' : null,
      organ_needed: finalRole === 'PATIENT' ? 'Kidney' : null,
      blood_type: finalRole === 'PATIENT' ? 'O+' : null,
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    return res.status(500).json({ message: 'Google authentication error: ' + err.message });
  }
}
