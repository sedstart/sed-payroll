import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getRedisClient } from "@/lib/redis"
import type { Attendance } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function EmployeeAttendancePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "employee") redirect("/")

  const redis = await getRedisClient()
  const keys = await redis.keys("attendance:*")
  const records: Attendance[] = []

  for (const key of keys) {
    const value = await redis.get(key)
    if (!value) continue

    const record = JSON.parse(value) as Attendance
    if (record.employeeId === user.employeeId) {
      records.push(record)
    }
  }

  records.sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Overtime (hrs)</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.overtimeHours}</TableCell>
                <TableCell>{r.notes ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {records.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            No attendance records found.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
