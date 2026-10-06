import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM

function getEncryptionKey() {
  const secret = process.env.PATIENT_ENCRYPTION_KEY || process.env.JWT_SECRET || 'fallback-organmatch-secure-key-32bytes!';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt arbitrary clinical data into a secure envelope using AES-256-GCM.
 * Never exposes the key.
 */
export function encryptClinicalData(data) {
  if (data === null || data === undefined) return null;
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const textToEncrypt = typeof data === 'string' ? data : JSON.stringify(data);
  let encrypted = cipher.update(textToEncrypt, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    ciphertext: encrypted,
    tag,
    algorithm: 'AES-256-GCM',
    encryptedAt: new Date().toISOString(),
  };
}

/**
 * Decrypts a clinical data envelope using AES-256-GCM.
 */
export function decryptClinicalData(envelope) {
  if (!envelope || !envelope.ciphertext || !envelope.iv || !envelope.tag) {
    return envelope;
  }
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(envelope.iv, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(Buffer.from(envelope.tag, 'hex'));

    let decrypted = decipher.update(envelope.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (err) {
    console.error('Field decryption failed:', err.message);
    return null;
  }
}
