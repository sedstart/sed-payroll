import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(request: Request, { params }: { params: Promise<{ employeeId: string }> }) {
  try {
    const { employeeId } = await params
    const balance = await dataStore.getLeaveBalance(employeeId)

    if (!balance) {
      return NextResponse.json({ error: "Leave balance not found" }, { status: 404 })
    }

    return NextResponse.json(balance)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leave balance" }, { status: 500 })
  }
}
