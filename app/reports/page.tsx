"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Employee, Payslip, SalaryStructure } from "@/lib/types"
import { Users, DollarSign, TrendingUp, Building } from "lucide-react"

export default function ReportsPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, payslipRes, salRes] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/payslips"),
          fetch("/api/salary-structures"),
        ])

        const empData = await empRes.json()
        const payslipData = await payslipRes.json()
        const salData = await salRes.json()

        setEmployees(empData)
        setPayslips(payslipData)
        setSalaryStructures(salData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const getDepartmentStats = () => {
    const departments = new Map<string, { count: number; totalSalary: number }>()

    employees.forEach((emp) => {
      const dept = emp.department
      if (!departments.has(dept)) {
        departments.set(dept, { count: 0, totalSalary: 0 })
      }
      const stats = departments.get(dept)!
      stats.count++

      // Find employee's payslips
      const empPayslips = payslips.filter((p) => p.employeeId === emp.id)
      if (empPayslips.length > 0) {
        const latestPayslip = empPayslips[0]
        stats.totalSalary += latestPayslip.netSalary
      }
    })

    return Array.from(departments.entries()).map(([name, stats]) => ({
      name,
      count: stats.count,
      totalSalary: stats.totalSalary,
      avgSalary: stats.count > 0 ? stats.totalSalary / stats.count : 0,
    }))
  }

  const getTotalPayroll = () => {
    return payslips.reduce((sum, p) => sum + p.netSalary, 0)
  }

  const getTotalDeductions = () => {
    return payslips.reduce((sum, p) => sum + p.totalDeductions, 0)
  }

  const getAverageSalary = () => {
    if (payslips.length === 0) return 0
    return getTotalPayroll() / payslips.length
  }

  const departmentStats = getDepartmentStats()

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center px-8">
            <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          </div>
        </div>
        <div className="p-8">
          {loading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading reports...</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-4 mb-6">
                <Card id="report-total-employees">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{employees.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {employees.filter((e) => e.isActive).length} active
                    </p>
                  </CardContent>
                </Card>

                <Card id="report-total-payroll">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Payroll</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(getTotalPayroll())}</div>
                    <p className="text-xs text-muted-foreground mt-1">Current period</p>
                  </CardContent>
                </Card>

                <Card id="report-avg-salary">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Average Salary</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(getAverageSalary())}</div>
                    <p className="text-xs text-muted-foreground mt-1">Per employee</p>
                  </CardContent>
                </Card>

                <Card id="report-total-deductions">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Deductions</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{formatCurrency(getTotalDeductions())}</div>
                    <p className="text-xs text-muted-foreground mt-1">Tax, PF, Insurance</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card id="department-wise-report">
                  <CardHeader>
                    <CardTitle>Department-wise Salary Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department</TableHead>
                          <TableHead>Employees</TableHead>
                          <TableHead>Total Salary</TableHead>
                          <TableHead>Avg Salary</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departmentStats.map((dept) => (
                          <TableRow key={dept.name}>
                            <TableCell className="font-medium">{dept.name}</TableCell>
                            <TableCell>{dept.count}</TableCell>
                            <TableCell>{formatCurrency(dept.totalSalary)}</TableCell>
                            <TableCell>{formatCurrency(dept.avgSalary)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card id="tax-deduction-report">
                  <CardHeader>
                    <CardTitle>Tax & Deduction Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">Income Tax</p>
                          <p className="text-sm text-muted-foreground">Total tax collected</p>
                        </div>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(payslips.reduce((sum, p) => sum + p.incomeTax, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">Provident Fund</p>
                          <p className="text-sm text-muted-foreground">Employee contributions</p>
                        </div>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(payslips.reduce((sum, p) => sum + p.providentFund, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-foreground">Insurance</p>
                          <p className="text-sm text-muted-foreground">Health insurance premiums</p>
                        </div>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(payslips.reduce((sum, p) => sum + p.insurance, 0))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6" id="ctc-breakdown">
                <CardHeader>
                  <CardTitle>Cost to Company (CTC) Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Salary Structure</TableHead>
                        <TableHead>Basic</TableHead>
                        <TableHead>HRA</TableHead>
                        <TableHead>Allowances</TableHead>
                        <TableHead>Employer PF</TableHead>
                        <TableHead>Insurance</TableHead>
                        <TableHead>Total CTC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salaryStructures.map((structure) => (
                        <TableRow key={structure.id}>
                          <TableCell className="font-medium">{structure.name}</TableCell>
                          <TableCell>{formatCurrency(structure.basicSalary)}</TableCell>
                          <TableCell>{formatCurrency(structure.hra)}</TableCell>
                          <TableCell>{formatCurrency(structure.specialAllowance + structure.bonus)}</TableCell>
                          <TableCell>{formatCurrency(structure.employerPF)}</TableCell>
                          <TableCell>{formatCurrency(structure.insurance)}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(
                              structure.basicSalary +
                                structure.hra +
                                structure.specialAllowance +
                                structure.bonus +
                                structure.variablePay +
                                structure.employerPF +
                                structure.insurance,
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
