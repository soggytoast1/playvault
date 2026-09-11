import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

const COOKIE_NAME = "pv_session"
const SESSION_DAYS = 30

export type SessionUser = {
  id: string
  username: string
  role: "user" | "admin"
  avatarEmoji?: string
  avatarColor?: string
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "playvault-dev-secret-fallback-key"
  return new TextEncoder().encode(secret)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret())

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      id: payload.id as string,
      username: payload.username as string,
      role: payload.role as "user" | "admin",
      avatarEmoji: payload.avatarEmoji as string | undefined,
      avatarColor: payload.avatarColor as string | undefined,
    }
  } catch {
    return null
  }
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  return session?.role === "admin"
}

/** Validate admin credentials against env config (login-only, no registration). */
export function checkAdminCredentials(username: string, password: string): boolean {
  const adminUser = process.env.ADMIN_USERNAME || "admin"
  const adminPass = process.env.ADMIN_PASSWORD
  if (!adminPass) return false
  return username === adminUser && password === adminPass
}
