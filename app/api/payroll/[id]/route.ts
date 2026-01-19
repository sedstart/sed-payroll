import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { getCurrentUser } from "@/lib/auth"

/**
 * PUT /api/payroll/[id]
 * Admin only
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()

  // 🔐 Admin only
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  try {
    const { id } = await params   // ✅ FIX
    const body = await request.json()

    const updated = await dataStore.updatePayrollRun(id, body)

    if (!updated) {
      return NextResponse.json(
        { error: "Payroll run not found" },
        { status: 404 }
      )
    }

    await dataStore.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "admin", // ✅ real admin
      action: "UPDATE",
      entity: "payroll_run",
      entityId: id,
      changes: body,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("UPDATE PAYROLL ERROR:", error)
    return NextResponse.json(
      { error: "Failed to update payroll run" },
      { status: 500 }
    )
  }
}
