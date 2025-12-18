"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { useToast } from "@/hooks/use-toast"
import type { Employee, SalaryStructure } from "@/lib/types"
import { Plus } from "lucide-react"

interface EmployeeFormDialogProps {
  salaryStructures: SalaryStructure[]
  onSuccess: () => void
  employee?: Employee
}

export function EmployeeFormDialog({ salaryStructures, onSuccess, employee }: EmployeeFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      employeeId: formData.get("employeeId"),
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      dateOfJoining: formData.get("dateOfJoining"),
      department: formData.get("department"),
      designation: formData.get("designation"),
      employmentType: formData.get("employmentType"),
      bankAccount: formData.get("bankAccount"),
      ifscCode: formData.get("ifscCode"),
      taxId: formData.get("taxId"),
      salaryStructureId: formData.get("salaryStructureId"),
      isActive: true,
    }

    try {
      const url = employee ? `/api/employees/${employee.id}` : "/api/employees"
      const method = employee ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save employee")

      toast({
        title: employee ? "Employee updated" : "Employee added",
        description: employee
          ? "Employee details have been updated successfully."
          : "New employee has been added successfully.",
      })

      setOpen(false)
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save employee. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {employee ? (
          <Button variant="outline" size="sm" id={`edit-employee-${employee.id}`}>
            Edit
          </Button>
        ) : (
          <Button id="add-employee-btn">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
          <DialogDescription>
            {employee ? "Update employee information below." : "Fill in the details to add a new employee."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID *</Label>
              <Input
                id="employeeId"
                name="employeeId"
                defaultValue={employee?.employeeId}
                required
                placeholder="EMP001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" defaultValue={employee?.name} required placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={employee?.email}
                required
                placeholder="john@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={employee?.phone}
                required
                placeholder="+1-555-0100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfJoining">Date of Joining *</Label>
              <Input
                id="dateOfJoining"
                name="dateOfJoining"
                type="date"
                defaultValue={employee?.dateOfJoining}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                name="department"
                defaultValue={employee?.department}
                required
                placeholder="Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                name="designation"
                defaultValue={employee?.designation}
                required
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type *</Label>
              <Select name="employmentType" defaultValue={employee?.employmentType || "Full-time"}>
                <SelectTrigger id="employmentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account Number *</Label>
              <Input
                id="bankAccount"
                name="bankAccount"
                defaultValue={employee?.bankAccount}
                required
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code *</Label>
              <Input
                id="ifscCode"
                name="ifscCode"
                defaultValue={employee?.ifscCode}
                required
                placeholder="BANK0001234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID *</Label>
              <Input id="taxId" name="taxId" defaultValue={employee?.taxId} required placeholder="TAX123456" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryStructureId">Salary Structure *</Label>
              <Select name="salaryStructureId" defaultValue={employee?.salaryStructureId}>
                <SelectTrigger id="salaryStructureId">
                  <SelectValue placeholder="Select salary structure" />
                </SelectTrigger>
                <SelectContent>
                  {salaryStructures.map((structure) => (
                    <SelectItem key={structure.id} value={structure.id}>
                      {structure.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} id="cancel-employee-form">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} id="submit-employee-form">
              {loading ? "Saving..." : employee ? "Update Employee" : "Add Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
