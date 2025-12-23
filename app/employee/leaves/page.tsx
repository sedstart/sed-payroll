import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getRedisClient } from "@/lib/redis"
import type { Leave } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function EmployeeLeavesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "employee") redirect("/")

  const redis = await getRedisClient()
  const keys = await redis.keys("leave:*")
  const leaves: Leave[] = []

  for (const key of keys) {
    const value = await redis.get(key)
    if (!value) continue

    const leave = JSON.parse(value) as Leave
    if (leave.employeeId === user.employeeId) {
      leaves.push(leave)
    }
  }

  leaves.sort((a, b) => b.startDate.localeCompare(a.startDate))

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Leave Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.leaveType}</TableCell>
                <TableCell>{l.startDate}</TableCell>
                <TableCell>{l.endDate}</TableCell>
                <TableCell>{l.days}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      l.status === "Approved"
                        ? "default"
                        : l.status === "Rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {l.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {leaves.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            No leave requests found.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
