/**
 * Shared store for pending registrations during email verification
 * In production, this should be stored in Redis or a database
 */

interface PendingRegistration {
  name: string;
  email: string;
  password: string;
  token: string;
  expiresAt: Date;
}

const pendingRegistrations = new Map<string, PendingRegistration>();
let cleanupIntervalId: NodeJS.Timeout | null = null;

/**
 * Start the cleanup interval (should be called once)
 */
export function startCleanupInterval(): void {
  if (cleanupIntervalId !== null) {
    return; // Already running
  }

  cleanupIntervalId = setInterval(() => {
    cleanupExpiredRegistrations();
  }, 60 * 1000); // Run every minute

  // Unref the interval so it doesn't prevent process exit
  cleanupIntervalId.unref();
}

/**
 * Stop the cleanup interval (useful for testing)
 */
export function stopCleanupInterval(): void {
  if (cleanupIntervalId !== null) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
}

/**
 * Store pending registration
 */
export function storePendingRegistration(
  email: string,
  data: PendingRegistration
): void {
  // Ensure cleanup interval is running
  if (cleanupIntervalId === null) {
    startCleanupInterval();
  }

  pendingRegistrations.set(email.toLowerCase(), data);
}

/**
 * Get pending registration
 */
export function getPendingRegistration(email: string): PendingRegistration | undefined {
  return pendingRegistrations.get(email.toLowerCase());
}

/**
 * Remove pending registration
 */
export function removePendingRegistration(email: string): void {
  pendingRegistrations.delete(email.toLowerCase());
}

/**
 * Clean up expired registrations
 */
export function cleanupExpiredRegistrations(): void {
  const now = new Date();
  const expiredEmails: string[] = [];

  for (const [email, registration] of pendingRegistrations.entries()) {
    if (registration.expiresAt < now) {
      expiredEmails.push(email);
    }
  }

  expiredEmails.forEach((email) => {
    pendingRegistrations.delete(email);
  });

  if (expiredEmails.length > 0) {
    console.log(`🧹 Cleaned up ${expiredEmails.length} expired registration(s)`);
  }
}

/**
 * Get all pending registrations (useful for debugging)
 */
export function getAllPendingRegistrations(): Array<{ email: string; expiresAt: Date }> {
  return Array.from(pendingRegistrations.entries()).map(([email, data]) => ({
    email,
    expiresAt: data.expiresAt,
  }));
}
