import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import type { Payslip } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { payrollRunId } = body

    const employees = (await dataStore.getEmployees()).filter((e) => e.isActive)
    const deductions = await dataStore.getDeductions()
    const payslips: Payslip[] = []

    for (const employee of employees) {
      const salaryStructure = await dataStore.getSalaryStructure(employee.salaryStructureId)
      if (!salaryStructure) continue

      // Calculate working days and present days
      const attendance = await dataStore.getAttendance(employee.id)
      const workingDays = attendance.length
      const presentDays = attendance.filter((a) => a.status === "Present" || a.status === "WFH").length
      const leaveDays = workingDays - presentDays

      // Calculate salary components
      const basicSalary = (salaryStructure.basicSalary / workingDays) * presentDays
      const hra = (salaryStructure.hra / workingDays) * presentDays
      const specialAllowance = (salaryStructure.specialAllowance / workingDays) * presentDays
      const bonus = salaryStructure.bonus
      const variablePay = salaryStructure.variablePay

      const grossSalary = basicSalary + hra + specialAllowance + bonus + variablePay

      // Calculate deductions
      const incomeTax = grossSalary * 0.1
      const providentFund = basicSalary * 0.12
      const insurance = 500
      const loanDeduction = 0

      const totalDeductions = incomeTax + providentFund + insurance + loanDeduction
      const netSalary = grossSalary - totalDeductions

      const payslip: Payslip = {
        id: `payslip-${employee.id}-${Date.now()}`,
        employeeId: employee.id,
        payrollRunId,
        period: new Date().toISOString().slice(0, 7),
        basicSalary,
        hra,
        specialAllowance,
        bonus,
        variablePay,
        grossSalary,
        incomeTax,
        providentFund,
        insurance,
        loanDeduction,
        totalDeductions,
        netSalary,
        workingDays,
        presentDays,
        leaveDays,
      }

      await dataStore.addPayslip(payslip)
      payslips.push(payslip)
    }

    // Update payroll run status
    await dataStore.updatePayrollRun(payrollRunId, {
      status: "Processed",
      processedDate: new Date().toISOString(),
      processedBy: "admin",
    })

    await dataStore.addAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "admin",
      action: "PROCESS",
      entity: "payroll_run",
      entityId: payrollRunId,
      changes: { payslipsGenerated: payslips.length },
    })

    return NextResponse.json({ success: true, payslips })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process payroll" }, { status: 500 })
  }
}
