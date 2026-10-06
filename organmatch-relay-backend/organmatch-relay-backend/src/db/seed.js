import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

// Simple deterministic-ish HLA marker generator: 6 marker "slots" (like the
// 6-antigen HLA-A/B/DR match panel used in real transplant matching), each
// drawn from a small pool so overlaps happen often enough to matter.
function randomHlaMarkers() {
  const pool6 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const shuffled = [...pool6].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6);
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [stXavier] } = await client.query(
      `INSERT INTO hospitals (name, location_lat, location_lng, type, address)
       VALUES ('St. Xavier Medical Center', 13.0827, 80.2707, 'donor', 'Chennai, TN')
       RETURNING id`
    );
    const { rows: [cityGeneral] } = await client.query(
      `INSERT INTO hospitals (name, location_lat, location_lng, type, address)
       VALUES ('City General Hospital', 13.0604, 80.2496, 'recipient', 'Chennai, TN')
       RETURNING id`
    );

    // ---------- Three jurisdictions along the donor -> recipient corridor ----------
    const { rows: [sector12] } = await client.query(
      `INSERT INTO jurisdictions (name, control_room_contact, sequence_hint)
       VALUES ('Sector 12 Traffic Control', '+91 44 2222 1111', 1)
       RETURNING id`
    );
    const { rows: [sector7] } = await client.query(
      `INSERT INTO jurisdictions (name, control_room_contact, sequence_hint)
       VALUES ('Sector 7 Traffic Control', '+91 44 2222 2222', 2)
       RETURNING id`
    );
    const { rows: [mgRoad] } = await client.query(
      `INSERT INTO jurisdictions (name, control_room_contact, sequence_hint)
       VALUES ('MG Road Junction Control', '+91 44 2222 3333', 3)
       RETURNING id`
    );

    const passwordHash = await bcrypt.hash('password123', 10);

    const { rows: [doctor] } = await client.query(
      `INSERT INTO users (name, email, password_hash, role, contact_number, hospital_id, license_number)
       VALUES ('Dr. Fatima Rahman', 'doctor@organmatch.dev', $1, 'DOCTOR', '+91 98450 11122', $2, 'MED-88213')
       RETURNING id`,
      [passwordHash, stXavier.id]
    );

    await client.query(
      `INSERT INTO users (name, email, password_hash, role, contact_number, hospital_id)
       VALUES ('Kavya Suresh', 'admin@organmatch.dev', $1, 'HOSPITAL_ADMIN', '+91 90000 11223', $2)`,
      [passwordHash, cityGeneral.id]
    );

    await client.query(
      `INSERT INTO users (name, email, password_hash, role, contact_number, hospital_id)
       VALUES ('Rahul Verma', 'donor@organmatch.dev', $1, 'DONOR_COORDINATOR', '+91 99887 66554', $2)`,
      [passwordHash, stXavier.id]
    );

    await client.query(
      `INSERT INTO users (name, email, password_hash, role, contact_number, organization_name)
       VALUES ('Ananya Iyer', 'sysadmin@organmatch.dev', $1, 'SYSTEM_ADMIN', '+91 91234 56780', 'National Organ Registry')`,
      [passwordHash]
    );

    const { rows: [ambulanceDriver] } = await client.query(
      `INSERT INTO users (name, email, password_hash, role, contact_number, license_id)
       VALUES ('Suresh Kumar', 'ambulance@organmatch.dev', $1, 'AMBULANCE', '+91 97865 43221', 'DL-44219')
       RETURNING id`,
      [passwordHash]
    );

    // Three police officers, one per jurisdiction, so the cascading handoff
    // is genuinely observable across three different logins.
    await client.query(
      `INSERT INTO users (name, email, password_hash, role, contact_number, station_name, jurisdiction_id)
       VALUES ('Inspector Vikram Singh', 'police@organmatch.dev', $1, 'POLICE', '+91 90111 22334', 'Sector 12 Traffic Control', $2)`,
      [passwordHash, sector12.id]
    );
    await client.query(
      `INSERT INTO users (name, email, password_hash, role, contact_number, station_name, jurisdiction_id)
       VALUES ('Inspector Meena Pillai', 'police2@organmatch.dev', $1, 'POLICE', '+91 90111 33445', 'Sector 7 Traffic Control', $2)`,
      [passwordHash, sector7.id]
    );
    await client.query(
      `INSERT INTO users (name, email, password_hash, role, contact_number, station_name, jurisdiction_id)
       VALUES ('Inspector Arjun Reddy', 'police3@organmatch.dev', $1, 'POLICE', '+91 90111 44556', 'MG Road Junction Control', $2)`,
      [passwordHash, mgRoad.id]
    );

    const { rows: [patientUser] } = await client.query(
      `INSERT INTO users (name, email, password_hash, role, contact_number, organ_needed, blood_type, urgency_score, registered_hospital_name, waitlist_status)
       VALUES ('Arjun Menon', 'patient@organmatch.dev', $1, 'PATIENT', '+91 98765 43210', 'Kidney', 'O+', 92.4, 'City General Hospital', 'Matched')
       RETURNING id`,
      [passwordHash]
    );

    await client.query(
      `INSERT INTO vehicles (code, registration_number, status, driver_id)
       VALUES ('AMB-114', 'TN-09-AB-4521', 'Idle', $1)`,
      [ambulanceDriver.id]
    );

    // ---------- Patients (waitlist), each with HLA markers ----------
    const patients = [
      ['P-10432', patientUser.id, 'Arjun Menon', 'Kidney', 'O+', 92.4, 'Matched'],
      ['P-10388', doctor.id, 'Priya Nair', 'Liver', 'B+', 78.1, 'Waiting'],
      ['P-10391', doctor.id, 'Rohan Das', 'Heart', 'A-', 74.6, 'Waiting'],
      ['P-10402', doctor.id, 'Meera Iyer', 'Kidney', 'AB+', 61.2, 'Waiting'],
      ['P-10375', doctor.id, 'Sanjay Kapoor', 'Lung', 'O-', 58.9, 'Waiting'],
    ];
    for (const [code, registeredBy, name, organ, blood, urgency, status] of patients) {
      await client.query(
        `INSERT INTO patients (code, name, organ_needed, blood_type, urgency_score, registered_hospital_id, registered_by, waitlist_status, hla_markers)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [code, name, organ, blood, urgency, cityGeneral.id, registeredBy, status, randomHlaMarkers()]
      );
    }

    await client.query('COMMIT');
    console.log('Database seeded successfully.');
    console.log('3 jurisdictions seeded: Sector 12 -> Sector 7 -> MG Road Junction');
    console.log('Demo login: any *@organmatch.dev account, password: password123');
    console.log('Police accounts: police@ (Sector 12), police2@ (Sector 7), police3@ (MG Road)');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});
