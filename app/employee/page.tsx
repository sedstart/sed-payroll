import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRedisClient } from "@/lib/redis"
import type { Attendance, Payslip } from "@/lib/types"

export default async function EmployeeDashboard() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  if (user.role !== "employee") redirect("/")

  const redis = await getRedisClient()

  // ---- Attendance (current month) ----
  const attendanceKeys = await redis.keys("attendance:*")
  let presentDays = 0
  let absentDays = 0

  for (const key of attendanceKeys) {
    const value = await redis.get(key)
    if (!value) continue

    const record = JSON.parse(value) as Attendance
    if (record.employeeId !== user.employeeId) continue

    if (record.status === "Present") presentDays++
    if (record.status === "Absent") absentDays++
  }

  // ---- Last payslip ----
  const payslipKeys = await redis.keys("payslip:*")
  let lastPayslip: Payslip | null = null

  for (const key of payslipKeys) {
    const value = await redis.get(key)
    if (!value) continue

    const payslip = JSON.parse(value) as Payslip
    if (payslip.employeeId !== user.employeeId) continue

    if (!lastPayslip || payslip.period > lastPayslip.period) {
      lastPayslip = payslip
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Attendance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">Present days: <strong>{presentDays}</strong></p>
            <p className="text-sm">Absent days: <strong>{absentDays}</strong></p>
          </CardContent>
        </Card>

        {/* Last Payslip */}
        <Card>
          <CardHeader>
            <CardTitle>Last Payslip</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lastPayslip ? (
              <>
                <p className="text-sm">Period: <strong>{lastPayslip.period}</strong></p>
                <p className="text-sm">Net Salary: <strong>₹{lastPayslip.netSalary}</strong></p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No payslip available yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
