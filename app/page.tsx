import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, Calendar, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      id: "stat-employees",
      title: "Total Employees",
      value: "6",
      change: "+2 this month",
      icon: Users,
    },
    {
      id: "stat-payroll",
      title: "Monthly Payroll",
      value: "$456,000",
      change: "+4.5% from last month",
      icon: DollarSign,
    },
    {
      id: "stat-leaves",
      title: "Pending Leaves",
      value: "0",
      change: "All approved",
      icon: Calendar,
    },
    {
      id: "stat-growth",
      title: "Average Salary",
      value: "$76,000",
      change: "+2.1% from last year",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="border-b border-border bg-card">
          <div className="flex h-16 items-center px-8">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          </div>
        </div>
        <div className="p-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.id} id={stat.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card id="card-recent-activity">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Users className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">New employee added</p>
                      <p className="text-xs text-muted-foreground">David Kim joined Engineering department</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Payroll processed</p>
                      <p className="text-xs text-muted-foreground">December 2024 payroll completed</p>
                    </div>
                    <span className="text-xs text-muted-foreground">1d ago</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Leave approved</p>
                      <p className="text-xs text-muted-foreground">Sarah Johnson - 3 days casual leave</p>
                    </div>
                    <span className="text-xs text-muted-foreground">3d ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="card-quick-actions">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <button
                    id="action-add-employee"
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
                  >
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Add Employee</p>
                      <p className="text-xs text-muted-foreground">Onboard a new team member</p>
                    </div>
                  </button>
                  <button
                    id="action-process-payroll"
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
                  >
                    <DollarSign className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Process Payroll</p>
                      <p className="text-xs text-muted-foreground">Run monthly payroll cycle</p>
                    </div>
                  </button>
                  <button
                    id="action-mark-attendance"
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
                  >
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Mark Attendance</p>
                      <p className="text-xs text-muted-foreground">Record today's attendance</p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
