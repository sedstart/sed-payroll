import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import type { Leave } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId") || undefined

    const leaves = dataStore.getLeaves(employeeId)
    return NextResponse.json(leaves)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leaves" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const leave: Leave = {
      id: `leave-${Date.now()}`,
      status: "Pending",
      ...body,
    }
    const created = dataStore.addLeave(leave)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const updated = dataStore.updateLeave(id, updates)

    if (!updated) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 })
    }

    dataStore.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: updates.approvedBy || "admin",
      action: "UPDATE",
      entity: "leave",
      entityId: id,
      changes: updates,
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update leave" }, { status: 500 })
  }
}
