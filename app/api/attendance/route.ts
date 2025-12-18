import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import type { Attendance } from "@/lib/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId") || undefined
    const startDate = searchParams.get("startDate") || undefined
    const endDate = searchParams.get("endDate") || undefined

    const attendance = await dataStore.getAttendance(employeeId, startDate, endDate)
    return NextResponse.json(attendance)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const attendance: Attendance = {
      id: `att-${body.employeeId}-${body.date}`,
      ...body,
    }
    const created = await dataStore.addAttendance(attendance)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create attendance" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const updated = await dataStore.updateAttendance(id, updates)

    if (!updated) {
      return NextResponse.json({ error: "Attendance not found" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 })
  }
}
