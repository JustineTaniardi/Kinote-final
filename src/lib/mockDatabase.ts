/**
 * Development-mode mock database store
 * This allows testing without a running MySQL database
 * Only active when DATABASE_AVAILABLE=false or database connection fails
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

interface MockUser {
  id: number;
  name: string;
  email: string;
  password: string; // hashed
  isEmailVerified: boolean;
  createdAt: Date;
}

const mockUsers = new Map<string, MockUser>();

// Initialize with demo user
async function initializeMockUsers() {
  const hashedPassword = await bcrypt.hash("test123456", 10);
  mockUsers.set("demo@kinote.local", {
    id: 1,
    name: "Demo User",
    email: "demo@kinote.local",
    password: hashedPassword,
    isEmailVerified: true,
    createdAt: new Date(),
  });
}

// Initialize on load
initializeMockUsers().catch(console.error);

export async function findUserByEmail(email: string): Promise<MockUser | null> {
  return mockUsers.get(email.toLowerCase()) || null;
}

export async function findUserById(id: number): Promise<MockUser | null> {
  for (const user of mockUsers.values()) {
    if (user.id === id) {
      return user;
    }
  }
  return null;
}

export async function createUser(
  name: string,
  email: string,
  password: string
): Promise<MockUser | null> {
  const lowerEmail = email.toLowerCase();

  if (mockUsers.has(lowerEmail)) {
    return null; // User already exists
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: MockUser = {
    id: mockUsers.size + 1,
    name,
    email: lowerEmail,
    password: hashedPassword,
    isEmailVerified: false,
    createdAt: new Date(),
  };

  mockUsers.set(lowerEmail, newUser);
  return newUser;
}

export async function verifyPassword(
  hashedPassword: string,
  plainPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function updateUserVerification(
  email: string,
  isVerified: boolean
): Promise<MockUser | null> {
  const user = mockUsers.get(email.toLowerCase());
  if (user) {
    user.isEmailVerified = isVerified;
    return user;
  }
  return null;
}

export function getAllMockUsers() {
  return Array.from(mockUsers.values()).map(
    ({ password, ...user }) => user
  );
}
