"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Payslip, Employee } from "@/lib/types"
import { Eye, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { toast } = useToast()

  const fetchPayslips = async () => {
    try {
      setLoading(true)
      const url = selectedEmployee === "all" ? "/api/payslips" : `/api/payslips?employeeId=${selectedEmployee}`

      const response = await fetch(url)
      const data = await response.json()
      setPayslips(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payslips",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch("/api/employees")
      const data = await response.json()
      setEmployees(data.filter((e: Employee) => e.isActive))
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    if (employees.length > 0) {
      fetchPayslips()
    }
  }, [selectedEmployee, employees])

  const getEmployeeName = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.name || "Unknown"
  }

  const getEmployeeDetails = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)
  }

  const handleViewDetails = (payslip: Payslip) => {
    setSelectedPayslip(payslip)
    setDetailsOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-8">
            <h1 className="text-2xl font-bold text-foreground">Payslips</h1>
          </div>
        </div>
        <div className="p-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Employee Payslips</CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="employee-filter">Employee:</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger id="employee-filter" className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">Loading payslips...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Gross Salary</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Working Days</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payslips.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No payslips found. Process payroll to generate payslips.
                        </TableCell>
                      </TableRow>
                    ) : (
                      payslips.map((payslip) => (
                        <TableRow key={payslip.id} id={`payslip-row-${payslip.id}`}>
                          <TableCell className="font-medium">{getEmployeeName(payslip.employeeId)}</TableCell>
                          <TableCell>{payslip.period}</TableCell>
                          <TableCell>{formatCurrency(payslip.grossSalary)}</TableCell>
                          <TableCell className="text-destructive">-{formatCurrency(payslip.totalDeductions)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(payslip.netSalary)}</TableCell>
                          <TableCell>
                            {payslip.presentDays}/{payslip.workingDays}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(payslip)}
                                id={`view-payslip-${payslip.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline" id={`download-payslip-${payslip.id}`}>
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payslip Details</DialogTitle>
            <DialogDescription>Detailed breakdown of salary components</DialogDescription>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Employee Name</p>
                    <p className="font-semibold text-foreground">{getEmployeeName(selectedPayslip.employeeId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Employee ID</p>
                    <p className="font-semibold text-foreground">
                      {getEmployeeDetails(selectedPayslip.employeeId)?.employeeId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Period</p>
                    <p className="font-semibold text-foreground">{selectedPayslip.period}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Working Days</p>
                    <p className="font-semibold text-foreground">
                      {selectedPayslip.presentDays} / {selectedPayslip.workingDays}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Earnings</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic Salary</span>
                    <span className="font-medium text-foreground">{formatCurrency(selectedPayslip.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">HRA</span>
                    <span className="font-medium text-foreground">{formatCurrency(selectedPayslip.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Special Allowance</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(selectedPayslip.specialAllowance)}
                    </span>
                  </div>
                  {selectedPayslip.bonus > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bonus</span>
                      <span className="font-medium text-foreground">{formatCurrency(selectedPayslip.bonus)}</span>
                    </div>
                  )}
                  {selectedPayslip.variablePay > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Variable Pay</span>
                      <span className="font-medium text-foreground">{formatCurrency(selectedPayslip.variablePay)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="font-semibold text-foreground">Gross Salary</span>
                    <span className="font-semibold text-foreground">{formatCurrency(selectedPayslip.grossSalary)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Deductions</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Income Tax</span>
                    <span className="font-medium text-destructive">-{formatCurrency(selectedPayslip.incomeTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provident Fund</span>
                    <span className="font-medium text-destructive">
                      -{formatCurrency(selectedPayslip.providentFund)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurance</span>
                    <span className="font-medium text-destructive">-{formatCurrency(selectedPayslip.insurance)}</span>
                  </div>
                  {selectedPayslip.loanDeduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loan Deduction</span>
                      <span className="font-medium text-destructive">
                        -{formatCurrency(selectedPayslip.loanDeduction)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="font-semibold text-foreground">Total Deductions</span>
                    <span className="font-semibold text-destructive">
                      -{formatCurrency(selectedPayslip.totalDeductions)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-foreground">Net Salary</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(selectedPayslip.netSalary)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)} id="close-payslip-details">
                  Close
                </Button>
                <Button id="download-payslip-pdf">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
