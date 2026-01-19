import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { getCurrentUser } from "@/lib/auth"
import type { PayrollRun } from "@/lib/types"

/**
 * GET /api/payroll
 * Admin only
 */
export async function GET() {
  const user = await getCurrentUser()

  // 🔐 Admin only
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  try {
    const payrollRuns = await dataStore.getPayrollRuns()
    return NextResponse.json(payrollRuns)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch payroll runs" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/payroll
 * Admin only
 * - Prevent duplicate / overlapping payroll periods
 */
export async function POST(request: Request) {
  const user = await getCurrentUser()

  // 🔐 Admin only
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { period, startDate, endDate } = body

    if (!period || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end < start) {
      return NextResponse.json(
        { error: "End date cannot be before start date" },
        { status: 400 }
      )
    }

    // 🔁 Duplicate / overlapping payroll check
    const existingRuns = await dataStore.getPayrollRuns()

    const hasOverlap = existingRuns.some((run) => {
      return (
        run.startDate <= endDate &&
        run.endDate >= startDate
      )
    })

    if (hasOverlap) {
      return NextResponse.json(
        {
          error:
            "A payroll run already exists for the selected date range",
        },
        { status: 409 }
      )
    }

    const payrollRun: PayrollRun = {
      id: `payroll-${Date.now()}`,
      period,
      startDate,
      endDate,
      status: "Draft",
    }

    const created = await dataStore.addPayrollRun(payrollRun)

    await dataStore.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id, // ✅ real admin
      action: "CREATE",
      entity: "payroll_run",
      entityId: payrollRun.id,
      changes: payrollRun,
    })

    return NextResponse.json(created, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Failed to create payroll run" },
      { status: 500 }
    )
  }
}
