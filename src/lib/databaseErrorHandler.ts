/**
 * Database connection error handler untuk development
 * Memberikan pesan error yang jelas saat MySQL tidak berjalan
 */

export function getDatabaseErrorResponse() {
  return {
    message: "Database connection failed. Please ensure MySQL is running.",
    hint: "Run: docker compose up -d",
    status: 503, // Service Unavailable
  };
}

export function isDatabaseConnectionError(error: any): boolean {
  const errorString = String(error);
  return (
    errorString.includes("Can't reach database server") ||
    errorString.includes("connect ECONNREFUSED") ||
    errorString.includes("PrismaClientInitializationError")
  );
}
