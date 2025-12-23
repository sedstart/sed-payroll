import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getRedisClient } from "@/lib/redis"
import type { Payslip } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function EmployeePayslipsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "employee") redirect("/")

  const redis = await getRedisClient()
  const keys = await redis.keys("payslip:*")
  const payslips: Payslip[] = []

  for (const key of keys) {
    const value = await redis.get(key)
    if (!value) continue

    const payslip = JSON.parse(value) as Payslip
    if (payslip.employeeId === user.employeeId) {
      payslips.push(payslip)
    }
  }

  payslips.sort((a, b) => b.period.localeCompare(a.period))

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Payslips</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Gross Salary</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Salary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payslips.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.period}</TableCell>
                <TableCell>₹{p.grossSalary}</TableCell>
                <TableCell>₹{p.totalDeductions}</TableCell>
                <TableCell className="font-semibold">
                  ₹{p.netSalary}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {payslips.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            No payslips available yet.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
