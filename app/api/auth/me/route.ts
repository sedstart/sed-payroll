// app/api/auth/me/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getRedisClient } from "@/lib/redis"
import type { User } from "@/lib/types"

const SESSION_COOKIE_NAME = "auth_session"

export async function GET() {
  // ✅ cookies() is async in route handlers
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
  }

  const redis = await getRedisClient()

  // session:<token> → userId
  const userId = await redis.get(`session:${token}`)
  if (!userId) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }

  // user:<id> → User
  const userJson = await redis.get(`user:${userId}`)
  if (!userJson) {
    return NextResponse.json({ error: "User not found" }, { status: 401 })
  }

  const user = JSON.parse(userJson) as User

  return NextResponse.json({
    id: user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId ?? null,
  })
}
