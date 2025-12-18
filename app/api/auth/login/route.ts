import { NextResponse } from "next/server"
import { validateCredentials, createSessionToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Validate credentials
    const user = validateCredentials(username, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create session token
    const token = createSessionToken(user)

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
    })

    // Set HTTP-only cookie for security
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
