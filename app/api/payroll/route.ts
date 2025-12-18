import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET() {
  try {
    const payrollRuns = await dataStore.getPayrollRuns()
    return NextResponse.json(payrollRuns)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payroll runs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { period, startDate, endDate } = body

    const payrollRun = {
      id: `payroll-${Date.now()}`,
      period,
      startDate,
      endDate,
      status: "Draft" as const,
    }

    const created = await dataStore.addPayrollRun(payrollRun)

    await dataStore.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "admin",
      action: "CREATE",
      entity: "payroll_run",
      entityId: payrollRun.id,
      changes: payrollRun,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create payroll run" }, { status: 500 })
  }
}
