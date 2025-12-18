"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AuditLog, SalaryStructure } from "@/lib/types"
import { Shield, Clock, DollarSign } from "lucide-react"

export default function SettingsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auditRes, salRes] = await Promise.all([fetch("/api/audit-logs"), fetch("/api/salary-structures")])

        const auditData = await auditRes.json()
        const salData = await salRes.json()

        setAuditLogs(auditData)
        setSalaryStructures(salData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "default"
      case "UPDATE":
        return "secondary"
      case "DELETE":
        return "destructive"
      case "PROCESS":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center px-8">
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          </div>
        </div>
        <div className="p-8">
          <Tabs defaultValue="audit" className="space-y-6">
            <TabsList id="settings-tabs">
              <TabsTrigger value="audit" id="tab-audit">
                Audit Logs
              </TabsTrigger>
              <TabsTrigger value="roles" id="tab-roles">
                User Roles
              </TabsTrigger>
              <TabsTrigger value="salary" id="tab-salary">
                Salary Structures
              </TabsTrigger>
            </TabsList>

            <TabsContent value="audit" className="space-y-6">
              <Card id="audit-logs-card">
                <CardHeader>
                  <CardTitle>System Audit Logs</CardTitle>
                  <CardDescription>Track all system activities and changes</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <p className="text-muted-foreground">Loading audit logs...</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Entity</TableHead>
                          <TableHead>Entity ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No audit logs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          auditLogs.map((log) => (
                            <TableRow key={log.id} id={`audit-log-${log.id}`}>
                              <TableCell className="font-medium">{new Date(log.timestamp).toLocaleString()}</TableCell>
                              <TableCell>{log.userId}</TableCell>
                              <TableCell>
                                <Badge variant={getActionColor(log.action)}>{log.action}</Badge>
                              </TableCell>
                              <TableCell>{log.entity.replace("_", " ")}</TableCell>
                              <TableCell className="text-muted-foreground">{log.entityId}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card id="role-admin">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>Admin</CardTitle>
                        <CardDescription>Full system access</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-muted-foreground">Manage all employees</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-muted-foreground">Process payroll</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-muted-foreground">View all reports</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-muted-foreground">Modify salary structures</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card id="role-hr">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                        <Shield className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <CardTitle>HR</CardTitle>
                        <CardDescription>Human resources management</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                        <span className="text-muted-foreground">Manage employees</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                        <span className="text-muted-foreground">Approve leaves</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                        <span className="text-muted-foreground">Mark attendance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                        <span className="text-muted-foreground">View department reports</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card id="role-manager">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                        <Shield className="h-6 w-6 text-secondary-foreground" />
                      </div>
                      <div>
                        <CardTitle>Manager</CardTitle>
                        <CardDescription>Team management</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-secondary-foreground" />
                        <span className="text-muted-foreground">View team members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-secondary-foreground" />
                        <span className="text-muted-foreground">Approve team leaves</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-secondary-foreground" />
                        <span className="text-muted-foreground">View team attendance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-secondary-foreground" />
                        <span className="text-muted-foreground">View team reports</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card id="role-employee">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                        <Shield className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle>Employee</CardTitle>
                        <CardDescription>Self-service access</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <span className="text-muted-foreground">View own profile</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <span className="text-muted-foreground">Request leaves</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <span className="text-muted-foreground">View own payslips</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <span className="text-muted-foreground">View leave balance</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="salary" className="space-y-6">
              <Card id="salary-structures-card">
                <CardHeader>
                  <CardTitle>Salary Structures</CardTitle>
                  <CardDescription>Manage salary components and structures</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <p className="text-muted-foreground">Loading salary structures...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {salaryStructures.map((structure) => (
                        <Card key={structure.id} id={`salary-structure-${structure.id}`}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                  <DollarSign className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{structure.name}</CardTitle>
                                  <CardDescription className="flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    Effective from {new Date(structure.effectiveFrom).toLocaleDateString()}
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge>Active</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-3">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Basic Components</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Basic Salary</span>
                                    <span className="font-medium text-foreground">
                                      {formatCurrency(structure.basicSalary)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">HRA</span>
                                    <span className="font-medium text-foreground">{formatCurrency(structure.hra)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Special Allowance</span>
                                    <span className="font-medium text-foreground">
                                      {formatCurrency(structure.specialAllowance)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Variable Components</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Bonus</span>
                                    <span className="font-medium text-foreground">
                                      {formatCurrency(structure.bonus)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Variable Pay</span>
                                    <span className="font-medium text-foreground">
                                      {formatCurrency(structure.variablePay)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Employer Contributions</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Provident Fund</span>
                                    <span className="font-medium text-foreground">
                                      {formatCurrency(structure.employerPF)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Insurance</span>
                                    <span className="font-medium text-foreground">
                                      {formatCurrency(structure.insurance)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-foreground">Total CTC (Annual)</span>
                                <span className="text-lg font-bold text-primary">
                                  {formatCurrency(
                                    (structure.basicSalary +
                                      structure.hra +
                                      structure.specialAllowance +
                                      structure.bonus +
                                      structure.variablePay +
                                      structure.employerPF +
                                      structure.insurance) *
                                      12,
                                  )}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
