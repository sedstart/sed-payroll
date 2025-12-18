// Simple authentication utilities for demo purposes
// In production, use proper password hashing and secure session management

export interface User {
  id: string
  username: string
  role: "admin" | "employee"
  name: string
}

// Hardcoded admin credentials for demo
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123", // In production, this should be hashed
}

export function validateCredentials(username: string, password: string): User | null {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return {
      id: "user-admin",
      username: "admin",
      role: "admin",
      name: "Administrator",
    }
  }
  return null
}

export function createSessionToken(user: User): string {
  // In production, use proper JWT or secure session tokens
  return Buffer.from(JSON.stringify(user)).toString("base64")
}

export function verifySessionToken(token: string): User | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const user = JSON.parse(decoded) as User
    return user
  } catch {
    return null
  }
}
