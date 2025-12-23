import { NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"
import { getCurrentUser } from "@/lib/auth"
import type { Payslip } from "@/lib/types"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const redis = await getRedisClient()
  const keys = await redis.keys("payslip:*")
  const results: Payslip[] = []

  for (const key of keys) {
    const value = await redis.get(key)
    if (!value) continue

    const payslip = JSON.parse(value) as Payslip

    if (user.role === "employee" && payslip.employeeId !== user.employeeId) {
      continue
    }

    results.push(payslip)
  }

  return NextResponse.json(results)
}
