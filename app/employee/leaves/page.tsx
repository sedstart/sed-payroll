import LeaveRequestForm from "./LeaveRequestForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dataStore } from "@/lib/data-store"
import { getCurrentUser } from "@/lib/auth"

export default async function EmployeeLeavesPage() {
  const user = await getCurrentUser()
  const leaves = await dataStore.getLeavesByEmployeeId(user!.employeeId!)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Leave</CardTitle>
        </CardHeader>
        <CardContent>
          <LeaveRequestForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {leaves.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No leave requests found
            </p>
          ) : (
            <div className="space-y-2">
              {leaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex justify-between text-sm"
                  id={`leave-${leave.id}`}
                >
                  <div>
                    <p className="font-medium">{leave.leaveType}</p>
                    <p className="text-muted-foreground">
                      {leave.startDate} → {leave.endDate} ({leave.days} days)
                    </p>
                  </div>
                  <span>{leave.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>

      </Card>
    </div>
  )
}
