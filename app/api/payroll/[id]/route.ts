import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const updated = await dataStore.updatePayrollRun(id, body)

    if (!updated) {
      return NextResponse.json({ error: "Payroll run not found" }, { status: 404 })
    }

    await dataStore.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "admin",
      action: "UPDATE",
      entity: "payroll_run",
      entityId: id,
      changes: body,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update payroll run" }, { status: 500 })
  }
}
