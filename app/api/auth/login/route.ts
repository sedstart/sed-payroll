// app/api/auth/login/route.ts
import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"
import { verifyPassword } from "@/lib/password"
import { createSession } from "@/lib/session"
import type { User } from "@/lib/types"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      )
    }

    const redis = await getRedisClient()

    // 1️⃣ Find userId by email
    const userId = await redis.get(`user:email:${email}`)
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // 2️⃣ Load user
    const userJson = await redis.get(`user:${userId}`)
    if (!userJson) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const user = JSON.parse(userJson) as User

    // 3️⃣ Verify password
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // 4️⃣ Create session
    await createSession(user.id)

    // 5️⃣ Respond with role (client will redirect)
    return NextResponse.json({
      success: true,
      role: user.role,
    })
  } catch (error) {
    console.error("[LOGIN_ERROR]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
