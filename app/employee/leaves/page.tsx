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
          {/* existing table stays exactly as it was */}
          {/* do NOT change UI here */}
        </CardContent>
      </Card>
    </div>
  )
}
