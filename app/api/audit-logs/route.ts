import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET() {
  try {
    const logs = await dataStore.getAuditLogs()
    return NextResponse.json(logs)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    )
  }
}
