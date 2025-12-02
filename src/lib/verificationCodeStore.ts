/**
 * In-memory store for verification codes during registration
 * In production, this should be stored in Redis or a database
 */

interface VerificationCodeData {
  code: string;
  email: string;
  expiresAt: Date;
}

const verificationCodes = new Map<string, VerificationCodeData>();
let cleanupIntervalId: NodeJS.Timeout | null = null;

/**
 * Start the cleanup interval (should be called once)
 */
export function startCleanupInterval(): void {
  if (cleanupIntervalId !== null) {
    return; // Already running
  }

  cleanupIntervalId = setInterval(() => {
    cleanupExpiredCodes();
  }, 60 * 1000);

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
 * Store verification code in memory
 * @param email - User email
 * @param code - 6-digit verification code
 * @param expirationMinutes - Minutes until code expires (default: 10)
 */
export function storeVerificationCode(
  email: string,
  code: string,
  expirationMinutes: number = 10
): void {
  // Ensure cleanup interval is running
  if (cleanupIntervalId === null) {
    startCleanupInterval();
  }

  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
  verificationCodes.set(email.toLowerCase(), {
    code,
    email,
    expiresAt,
  });
}

/**
 * Verify the code for an email
 * @param email - User email
 * @param code - Code to verify
 * @returns true if code is valid and not expired
 */
export function verifyCode(email: string, code: string): boolean {
  const data = verificationCodes.get(email.toLowerCase());
  
  if (!data) {
    return false;
  }

  // Check if code is expired
  if (data.expiresAt < new Date()) {
    verificationCodes.delete(email.toLowerCase());
    return false;
  }

  // Check if code matches
  if (data.code !== code) {
    return false;
  }

  return true;
}

/**
 * Remove verification code after successful verification
 * @param email - User email
 */
export function removeVerificationCode(email: string): void {
  verificationCodes.delete(email.toLowerCase());
}

/**
 * Clean up expired codes (should be called periodically)
 */
export function cleanupExpiredCodes(): void {
  const now = new Date();
  const expiredEmails: string[] = [];

  for (const [email, data] of verificationCodes.entries()) {
    if (data.expiresAt < now) {
      expiredEmails.push(email);
    }
  }

  expiredEmails.forEach((email) => {
    verificationCodes.delete(email);
  });

  if (expiredEmails.length > 0) {
    console.log(`🧹 Cleaned up ${expiredEmails.length} expired verification code(s)`);
  }
}
