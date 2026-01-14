import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import type { Employee } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    // 🔐 Admin only
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const employees = await dataStore.getEmployees()
    return NextResponse.json(employees)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    // 🔐 Admin only
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    const employee: Employee = {
      id: `emp-${Date.now()}`,
      ...body,
    }

    const created = await dataStore.addEmployee(employee)

    await dataStore.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id, 
      action: "CREATE",
      entity: "employee",
      entityId: employee.id,
      changes: employee,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    )
  }
}

