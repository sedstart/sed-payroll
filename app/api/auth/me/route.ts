import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifySessionToken } from "@/lib/auth"

export async function GET() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session")?.value

  if (!sessionToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const user = verifySessionToken(sessionToken)

  if (!user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 })
  }

  return NextResponse.json({ user })
}
