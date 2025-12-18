import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import type { Employee } from "@/lib/types"

export async function GET() {
  try {
    const employees = dataStore.getEmployees()
    return NextResponse.json(employees)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const employee: Employee = {
      id: `emp-${Date.now()}`,
      ...body,
    }
    const created = dataStore.addEmployee(employee)

    dataStore.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "admin",
      action: "CREATE",
      entity: "employee",
      entityId: employee.id,
      changes: employee,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
