/**
 * Temporary storage for pending user registrations
 * In production, use Redis or a proper cache service
 */

interface PendingRegistration {
  name: string;
  email: string;
  password: string; // hashed
  code: string;
  expiresAt: Date;
}

// Store pending registrations in memory (maps email to registration data)
const pendingRegistrations = new Map<string, PendingRegistration>();

// Cleanup expired registrations every minute
setInterval(() => {
  const now = new Date();
  for (const [email, registration] of pendingRegistrations.entries()) {
    if (registration.expiresAt < now) {
      console.log(`🗑️  Cleaning up expired registration for ${email}`);
      pendingRegistrations.delete(email);
    }
  }
}, 60 * 1000); // Every minute

export function addPendingRegistration(
  email: string,
  data: PendingRegistration
): void {
  pendingRegistrations.set(email, data);
  console.log(`📝 Pending registration added for ${email}`);
}

export function getPendingRegistration(email: string): PendingRegistration | undefined {
  return pendingRegistrations.get(email);
}

export function removePendingRegistration(email: string): boolean {
  return pendingRegistrations.delete(email);
}

export function verifyCode(email: string, code: string): boolean {
  const registration = pendingRegistrations.get(email);
  if (!registration) {
    return false;
  }

  // Check if code is expired
  if (registration.expiresAt < new Date()) {
    removePendingRegistration(email);
    return false;
  }

  // Check if code matches
  return registration.code === code;
}
