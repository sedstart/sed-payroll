"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

export default function LeaveRequestForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const payload = {
      leaveType: formData.get("leaveType"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      reason: formData.get("reason"),
    }

    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    setLoading(false)

    if (!res.ok) {
      toast({
        title: "Failed",
        description: "Unable to submit leave request",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Leave Requested",
      description: "Your leave request has been submitted",
    })

    e.currentTarget.reset()
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Select name="leaveType" required>
        <SelectTrigger>
          <SelectValue placeholder="Leave Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Casual">Casual</SelectItem>
          <SelectItem value="Sick">Sick</SelectItem>
          <SelectItem value="Paid">Paid</SelectItem>
          <SelectItem value="Unpaid">Unpaid</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input name="startDate" type="date" required />
        <Input name="endDate" type="date" required />
      </div>

      <Textarea name="reason" placeholder="Reason" required />

      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Request Leave"}
      </Button>
    </form>
  )
}
