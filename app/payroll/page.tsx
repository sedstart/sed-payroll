"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PayrollRun, Employee } from "@/lib/types"
import { Plus, Play, Lock, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PayrollPage() {
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchPayrollRuns = async () => {
    try {
      const response = await fetch("/api/payroll")
      const data = await response.json()
      setPayrollRuns(data.sort((a: PayrollRun, b: PayrollRun) => b.id.localeCompare(a.id)))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payroll runs",
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
      setEmployees(data)
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    }
  }

  useEffect(() => {
    fetchPayrollRuns()
    fetchEmployees()
  }, [])

  const handleCreatePayroll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      period: formData.get("period"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
    }

    try {
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to create payroll run")

      toast({
        title: "Payroll run created",
        description: "New payroll run has been created successfully.",
      })

      setCreateDialogOpen(false)
      fetchPayrollRuns()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payroll run",
        variant: "destructive",
      })
    }
  }

  const handleProcessPayroll = async (payrollRunId: string) => {
    setProcessingId(payrollRunId)

    try {
      const response = await fetch("/api/payroll/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payrollRunId }),
      })

      if (!response.ok) throw new Error("Failed to process payroll")

      toast({
        title: "Payroll processed",
        description: "Payroll has been processed and payslips generated.",
      })

      fetchPayrollRuns()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payroll",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const handleLockPayroll = async (payrollRunId: string) => {
    try {
      const response = await fetch(`/api/payroll/${payrollRunId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Locked" }),
      })

      if (!response.ok) throw new Error("Failed to lock payroll")

      toast({
        title: "Payroll locked",
        description: "Payroll run has been locked successfully.",
      })

      fetchPayrollRuns()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to lock payroll",
        variant: "destructive",
      })
    }
  }

  const getDefaultPeriod = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  }

  const getDefaultDates = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const startDate = new Date(year, month, 1).toISOString().split("T")[0]
    const endDate = new Date(year, month + 1, 0).toISOString().split("T")[0]
    return { startDate, endDate }
  }

  const { startDate, endDate } = getDefaultDates()

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-8">
            <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button id="create-payroll-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Payroll Run
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Payroll Run</DialogTitle>
                  <DialogDescription>Set up a new payroll cycle for processing.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePayroll} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="period">Period (YYYY-MM) *</Label>
                    <Input id="period" name="period" type="month" defaultValue={getDefaultPeriod()} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input id="startDate" name="startDate" type="date" defaultValue={startDate} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input id="endDate" name="endDate" type="date" defaultValue={endDate} required />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                      id="cancel-payroll-form"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" id="submit-payroll-form">
                      Create Payroll Run
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="p-8">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Runs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">Loading payroll runs...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processed Date</TableHead>
                      <TableHead>Processed By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRuns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No payroll runs found. Create a new payroll run to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      payrollRuns.map((run) => (
                        <TableRow key={run.id} id={`payroll-row-${run.id}`}>
                          <TableCell className="font-medium">{run.period}</TableCell>
                          <TableCell>{new Date(run.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(run.endDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                run.status === "Locked"
                                  ? "default"
                                  : run.status === "Processed"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {run.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {run.processedDate ? new Date(run.processedDate).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>{run.processedBy || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {run.status === "Draft" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleProcessPayroll(run.id)}
                                  disabled={processingId === run.id}
                                  id={`process-payroll-${run.id}`}
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  {processingId === run.id ? "Processing..." : "Process"}
                                </Button>
                              )}
                              {run.status === "Processed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleLockPayroll(run.id)}
                                  id={`lock-payroll-${run.id}`}
                                >
                                  <Lock className="h-4 w-4 mr-1" />
                                  Lock
                                </Button>
                              )}
                              {run.status === "Locked" && (
                                <Button size="sm" variant="outline" id={`download-payroll-${run.id}`}>
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              )}
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

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card id="payroll-summary-card">
              <CardHeader>
                <CardTitle>Payroll Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Employees</span>
                    <span className="font-semibold text-foreground">{employees.filter((e) => e.isActive).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Payroll Runs</span>
                    <span className="font-semibold text-foreground">{payrollRuns.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processed This Month</span>
                    <span className="font-semibold text-foreground">
                      {payrollRuns.filter((r) => r.status === "Processed" || r.status === "Locked").length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="salary-structures-card">
              <CardHeader>
                <CardTitle>Salary Structures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">Junior Level</p>
                      <p className="text-sm text-muted-foreground">Basic: $30,000 + Benefits</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">Mid Level</p>
                      <p className="text-sm text-muted-foreground">Basic: $50,000 + Benefits</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-foreground">Senior Level</p>
                      <p className="text-sm text-muted-foreground">Basic: $80,000 + Benefits</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
