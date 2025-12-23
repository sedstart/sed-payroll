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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Leave, Employee, LeaveBalance } from "@/lib/types"
import { Plus, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [leaveBalances, setLeaveBalances] = useState<Map<string, LeaveBalance>>(new Map())
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchLeaves = async () => {
    try {
      const response = await fetch("/api/leaves")
      const data = await response.json()
      setLeaves(data.sort((a: Leave, b: Leave) => b.id.localeCompare(a.id)))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch leaves",
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

      // Fetch leave balances for all employees
      const balances = new Map<string, LeaveBalance>()
      for (const emp of data) {
        const balanceResponse = await fetch(`/api/leave-balance/${emp.id}`)
        if (balanceResponse.ok) {
          const balance = await balanceResponse.json()
          balances.set(emp.id, balance)
        }
      }
      setLeaveBalances(balances)
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    }
  }

  useEffect(() => {
    fetchLeaves()
    fetchEmployees()
  }, [])

  const handleCreateLeave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const startDate = new Date(formData.get("startDate") as string)
    const endDate = new Date(formData.get("endDate") as string)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const data = {
      employeeId: formData.get("employeeId"),
      leaveType: formData.get("leaveType"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      days,
      reason: formData.get("reason"),
    }

    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to create leave request")

      toast({
        title: "Leave request submitted",
        description: "Leave request has been submitted for approval.",
      })

      setCreateDialogOpen(false)
      fetchLeaves()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create leave request",
        variant: "destructive",
      })
    }
  }

  const handleApproveLeave = async (leaveId: string) => {
    try {
      const response = await fetch("/api/leaves", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leaveId,
          status: "Approved",
          approvedBy: "admin",
        }),
      })

      if (!response.ok) throw new Error("Failed to approve leave")

      toast({
        title: "Leave approved",
        description: "Leave request has been approved.",
      })

      fetchLeaves()
      fetchEmployees()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve leave",
        variant: "destructive",
      })
    }
  }

  const handleRejectLeave = async (leaveId: string) => {
    try {
      const response = await fetch("/api/leaves", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leaveId,
          status: "Rejected",
          approvedBy: "admin",
        }),
      })

      if (!response.ok) throw new Error("Failed to reject leave")

      toast({
        title: "Leave rejected",
        description: "Leave request has been rejected.",
      })

      fetchLeaves()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject leave",
        variant: "destructive",
      })
    }
  }

  const getEmployeeName = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.name || "Unknown"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "default"
      case "Rejected":
        return "destructive"
      case "Pending":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-8">
            <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button id="create-leave-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Leave
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Leave</DialogTitle>
                  <DialogDescription>Submit a new leave request for approval.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateLeave} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee *</Label>
                    <Select name="employeeId" required>
                      <SelectTrigger id="employeeId">
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">Leave Type *</Label>
                    <Select name="leaveType" required>
                      <SelectTrigger id="leaveType">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Sick">Sick</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input id="startDate" name="startDate" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input id="endDate" name="endDate" type="date" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason *</Label>
                    <Textarea id="reason" name="reason" required placeholder="Reason for leave..." />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                      id="cancel-leave-form"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" id="submit-leave-form">
                      Submit Request
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="p-8">
          <div className="grid gap-6 mb-6 md:grid-cols-3">
            <Card id="card-leave-balances">
              <CardHeader>
                <CardTitle>Leave Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees.slice(0, 3).map((emp) => {
                    const balance = leaveBalances.get(emp.id)
                    return (
                      <div key={emp.id} className="p-3 rounded-lg bg-muted/50">
                        <p className="font-medium text-foreground text-sm">{emp.name}</p>
                        {balance && (
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Casual: {balance.casual}</span>
                            <span>Sick: {balance.sick}</span>
                            <span>Paid: {balance.paid}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card id="card-pending-approvals">
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-3xl font-bold text-foreground">
                    {leaves.filter((l) => l.status === "Pending").length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Requests awaiting approval</p>
                </div>
              </CardContent>
            </Card>

            <Card id="card-approved-leaves">
              <CardHeader>
                <CardTitle>Approved This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-3xl font-bold text-foreground">
                    {leaves.filter((l) => l.status === "Approved").length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Approved leave requests</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">Loading leave requests...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No leave requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      leaves.map((leave) => (
                        <TableRow key={leave.id} id={`leave-row-${leave.id}`}>
                          <TableCell className="font-medium">{getEmployeeName(leave.employeeId)}</TableCell>
                          <TableCell>{leave.leaveType}</TableCell>
                          <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                          <TableCell>{leave.days}</TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">{leave.reason}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(leave.status)}>{leave.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {leave.status === "Pending" && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveLeave(leave.id)}
                                  id={`approve-leave-${leave.id}`}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectLeave(leave.id)}
                                  id={`reject-leave-${leave.id}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
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
    </div>
  )
}
