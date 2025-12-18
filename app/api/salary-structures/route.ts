import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import type { SalaryStructure } from "@/lib/types"

export async function GET() {
  try {
    const structures = dataStore.getSalaryStructures()
    return NextResponse.json(structures)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch salary structures" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const structure: SalaryStructure = {
      id: `sal-${Date.now()}`,
      ...body,
    }
    const created = dataStore.addSalaryStructure(structure)

    dataStore.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "admin",
      action: "CREATE",
      entity: "salary_structure",
      entityId: structure.id,
      changes: structure,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create salary structure" }, { status: 500 })
  }
}
