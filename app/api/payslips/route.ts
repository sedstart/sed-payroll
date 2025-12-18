import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId") || undefined
    const payrollRunId = searchParams.get("payrollRunId") || undefined

    const payslips = await dataStore.getPayslips(employeeId, payrollRunId)
    return NextResponse.json(payslips)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payslips" }, { status: 500 })
  }
}
