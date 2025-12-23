// app/api/attendance/route.ts
import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"
import { getCurrentUser } from "@/lib/auth"
import type { Attendance } from "@/lib/types"
import { randomUUID } from "crypto"

/**
 * GET /api/attendance
 *
 * Admin:
 *   - Can fetch all attendance
 *   - Or filter by ?employeeId=
 *
 * Employee:
 *   - Can fetch ONLY their own attendance
 */
export async function GET(req: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const redis = await getRedisClient()
  const url = new URL(req.url)

  let employeeId: string | null = null

  if (user.role === "admin") {
    // Admin can optionally filter by employeeId
    employeeId = url.searchParams.get("employeeId")
  } else {
    // Employee can ONLY access their own data
    employeeId = user.employeeId ?? null
  }

  // Fetch all attendance keys
  const keys = await redis.keys("attendance:*")
  const records: Attendance[] = []

  for (const key of keys) {
    const value = await redis.get(key)
    if (!value) continue

    const attendance = JSON.parse(value) as Attendance

    // Enforce isolation
    if (employeeId && attendance.employeeId !== employeeId) {
      continue
    }

    records.push(attendance)
  }

  return NextResponse.json(records)
}

/**
 * POST /api/attendance
 *
 * Admin:
 *   - Can create attendance for any employee
 *
 * Employee:
 *   - Can create attendance ONLY for themselves
 *   - employeeId from client is IGNORED
 */
export async function POST(req: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const redis = await getRedisClient()
  const body = await req.json()

  let employeeId: string | undefined

  if (user.role === "admin") {
    employeeId = body.employeeId
    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId is required for admin" },
        { status: 400 }
      )
    }
  } else {
    // 🔐 HARD OVERRIDE for employees
    employeeId = user.employeeId
  }

  const attendance: Attendance = {
    id: randomUUID(),
    employeeId: employeeId!,
    date: body.date,
    status: body.status,
    overtimeHours: body.overtimeHours ?? 0,
    notes: body.notes,
  }

  await redis.set(
    `attendance:${attendance.id}`,
    JSON.stringify(attendance)
  )

  return NextResponse.json(attendance, { status: 201 })
}
