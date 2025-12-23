import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"
import { getCurrentUser } from "@/lib/auth"
import type { Leave } from "@/lib/types"
import { randomUUID } from "crypto"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const redis = await getRedisClient()
  const keys = await redis.keys("leave:*")
  const results: Leave[] = []

  for (const key of keys) {
    const value = await redis.get(key)
    if (!value) continue

    const leave = JSON.parse(value) as Leave

    if (user.role === "employee" && leave.employeeId !== user.employeeId) {
      continue
    }

    results.push(leave)
  }

  return NextResponse.json(results)
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()

  const leave: Leave = {
    id: randomUUID(),
    employeeId:
      user.role === "admin" ? body.employeeId : user.employeeId!,
    leaveType: body.leaveType,
    startDate: body.startDate,
    endDate: body.endDate,
    days: body.days,
    reason: body.reason,
    status: "Pending",
  }

  const redis = await getRedisClient()
  await redis.set(`leave:${leave.id}`, JSON.stringify(leave))

  return NextResponse.json(leave, { status: 201 })
}
