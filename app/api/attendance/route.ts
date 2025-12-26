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

  const employeeFilter =
    user.role === "admin"
      ? url.searchParams.get("employeeId")
      : user.employeeId

  const startDate = url.searchParams.get("startDate")
  const endDate = url.searchParams.get("endDate")

  const records = await redis.hGetAll("payroll:attendance")

  let attendance = Object.values(records).map(
    (r) => JSON.parse(r) as Attendance
  )

  // 🔐 Role isolation
  if (employeeFilter) {
    attendance = attendance.filter(
      (a) => a.employeeId === employeeFilter
    )
  }

  // 📅 Date filtering (admin page depends on this)
  if (startDate && endDate) {
    attendance = attendance.filter(
      (a) => a.date >= startDate && a.date <= endDate
    )
  }

  return NextResponse.json(attendance)
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

  await redis.hSet(
  "payroll:attendance",
  attendance.id,
  JSON.stringify(attendance)
  )

  return NextResponse.json(attendance, { status: 201 })
}
