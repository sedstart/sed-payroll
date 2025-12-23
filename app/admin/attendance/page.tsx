"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Attendance, Employee } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const [year, month] = selectedMonth.split("-")
      const startDate = `${year}-${month}-01`
      const lastDay = new Date(Number.parseInt(year), Number.parseInt(month), 0).getDate()
      const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}`

      const url =
        selectedEmployee === "all"
          ? `/api/attendance?startDate=${startDate}&endDate=${endDate}`
          : `/api/attendance?employeeId=${selectedEmployee}&startDate=${startDate}&endDate=${endDate}`

      const response = await fetch(url)
      const data = await response.json()
      setAttendance(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch attendance",
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
      fetchAttendance()
    }
  }, [selectedEmployee, selectedMonth, employees])

  const getAttendanceStats = () => {
    const total = attendance.length
    const present = attendance.filter((a) => a.status === "Present").length
    const absent = attendance.filter((a) => a.status === "Absent").length
    const wfh = attendance.filter((a) => a.status === "WFH").length
    const halfDay = attendance.filter((a) => a.status === "Half-day").length

    return { total, present, absent, wfh, halfDay }
  }

  const stats = getAttendanceStats()

  const getEmployeeName = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.name || "Unknown"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "default"
      case "Absent":
        return "destructive"
      case "WFH":
        return "secondary"
      case "Half-day":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center justify-between px-8">
            <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          </div>
        </div>
        <div className="p-8">
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <Card id="stat-total-records">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              </CardContent>
            </Card>
            <Card id="stat-present">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.present}</div>
              </CardContent>
            </Card>
            <Card id="stat-wfh">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Work From Home</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.wfh}</div>
              </CardContent>
            </Card>
            <Card id="stat-absent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.absent}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Attendance Records</CardTitle>
                <div className="flex items-center gap-4">
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
                  <div className="flex items-center gap-2">
                    <Label htmlFor="month-filter">Month:</Label>
                    <Input
                      id="month-filter"
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-40"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p className="text-muted-foreground">Loading attendance...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Overtime Hours</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendance.map((record) => (
                        <TableRow key={record.id} id={`attendance-row-${record.id}`}>
                          <TableCell className="font-medium">{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>{getEmployeeName(record.employeeId)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(record.status)}>{record.status}</Badge>
                          </TableCell>
                          <TableCell>{record.overtimeHours > 0 ? `${record.overtimeHours}h` : "-"}</TableCell>
                          <TableCell className="text-muted-foreground">{record.notes || "-"}</TableCell>
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
