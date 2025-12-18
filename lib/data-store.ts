import type {
  Employee,
  SalaryStructure,
  Attendance,
  Leave,
  LeaveBalance,
  Deduction,
  PayrollRun,
  Payslip,
  AuditLog,
} from "./types"

// In-memory data store (will be replaced with Redis/DB later)
class DataStore {
  private employees: Map<string, Employee> = new Map()
  private salaryStructures: Map<string, SalaryStructure> = new Map()
  private attendance: Map<string, Attendance> = new Map()
  private leaves: Map<string, Leave> = new Map()
  private leaveBalances: Map<string, LeaveBalance> = new Map()
  private deductions: Map<string, Deduction> = new Map()
  private payrollRuns: Map<string, PayrollRun> = new Map()
  private payslips: Map<string, Payslip> = new Map()
  private auditLogs: AuditLog[] = []

  constructor() {
    this.seedData()
  }

  private seedData() {
    // Seed Salary Structures
    const salaryStructures: SalaryStructure[] = [
      {
        id: "sal-1",
        name: "Junior Level",
        basicSalary: 30000,
        hra: 12000,
        specialAllowance: 8000,
        bonus: 0,
        variablePay: 0,
        employerPF: 3600,
        insurance: 500,
        effectiveFrom: "2024-01-01",
      },
      {
        id: "sal-2",
        name: "Mid Level",
        basicSalary: 50000,
        hra: 20000,
        specialAllowance: 15000,
        bonus: 5000,
        variablePay: 0,
        employerPF: 6000,
        insurance: 1000,
        effectiveFrom: "2024-01-01",
      },
      {
        id: "sal-3",
        name: "Senior Level",
        basicSalary: 80000,
        hra: 32000,
        specialAllowance: 28000,
        bonus: 10000,
        variablePay: 5000,
        employerPF: 9600,
        insurance: 2000,
        effectiveFrom: "2024-01-01",
      },
    ]
    salaryStructures.forEach((s) => this.salaryStructures.set(s.id, s))

    // Seed Employees
    const employees: Employee[] = [
      {
        id: "emp-1",
        employeeId: "EMP001",
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        phone: "+1-555-0101",
        dateOfJoining: "2022-01-15",
        department: "Engineering",
        designation: "Senior Software Engineer",
        employmentType: "Full-time",
        bankAccount: "1234567890",
        ifscCode: "BANK0001234",
        taxId: "TAX123456",
        salaryStructureId: "sal-3",
        isActive: true,
      },
      {
        id: "emp-2",
        employeeId: "EMP002",
        name: "Michael Chen",
        email: "michael.chen@company.com",
        phone: "+1-555-0102",
        dateOfJoining: "2023-03-20",
        department: "Engineering",
        designation: "Software Engineer",
        employmentType: "Full-time",
        bankAccount: "2345678901",
        ifscCode: "BANK0001234",
        taxId: "TAX234567",
        salaryStructureId: "sal-2",
        isActive: true,
      },
      {
        id: "emp-3",
        employeeId: "EMP003",
        name: "Emily Rodriguez",
        email: "emily.rodriguez@company.com",
        phone: "+1-555-0103",
        dateOfJoining: "2023-06-10",
        department: "Human Resources",
        designation: "HR Manager",
        employmentType: "Full-time",
        bankAccount: "3456789012",
        ifscCode: "BANK0001234",
        taxId: "TAX345678",
        salaryStructureId: "sal-2",
        isActive: true,
      },
      {
        id: "emp-4",
        employeeId: "EMP004",
        name: "James Wilson",
        email: "james.wilson@company.com",
        phone: "+1-555-0104",
        dateOfJoining: "2024-01-05",
        department: "Marketing",
        designation: "Marketing Specialist",
        employmentType: "Full-time",
        bankAccount: "4567890123",
        ifscCode: "BANK0001234",
        taxId: "TAX456789",
        salaryStructureId: "sal-1",
        isActive: true,
      },
      {
        id: "emp-5",
        employeeId: "EMP005",
        name: "Lisa Anderson",
        email: "lisa.anderson@company.com",
        phone: "+1-555-0105",
        dateOfJoining: "2022-08-12",
        department: "Finance",
        designation: "Senior Accountant",
        employmentType: "Full-time",
        bankAccount: "5678901234",
        ifscCode: "BANK0001234",
        taxId: "TAX567890",
        salaryStructureId: "sal-2",
        isActive: true,
      },
      {
        id: "emp-6",
        employeeId: "EMP006",
        name: "David Kim",
        email: "david.kim@company.com",
        phone: "+1-555-0106",
        dateOfJoining: "2024-02-01",
        department: "Engineering",
        designation: "Junior Developer",
        employmentType: "Contract",
        bankAccount: "6789012345",
        ifscCode: "BANK0001234",
        taxId: "TAX678901",
        salaryStructureId: "sal-1",
        isActive: true,
      },
    ]
    employees.forEach((e) => this.employees.set(e.id, e))

    // Seed Leave Balances
    employees.forEach((emp) => {
      this.leaveBalances.set(emp.id, {
        employeeId: emp.id,
        casual: 10,
        sick: 7,
        paid: 15,
      })
    })

    // Seed Attendance for current month
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    employees.forEach((emp) => {
      for (let day = 1; day <= today.getDate(); day++) {
        const date = new Date(currentYear, currentMonth, day)
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          // Skip weekends
          const attId = `att-${emp.id}-${date.toISOString().split("T")[0]}`
          this.attendance.set(attId, {
            id: attId,
            employeeId: emp.id,
            date: date.toISOString().split("T")[0],
            status: Math.random() > 0.1 ? "Present" : Math.random() > 0.5 ? "WFH" : "Absent",
            overtimeHours: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
          })
        }
      }
    })

    // Seed Deductions
    const deductions: Deduction[] = [
      {
        id: "ded-1",
        name: "Income Tax",
        type: "percentage",
        value: 10,
        applicableToAll: true,
      },
      {
        id: "ded-2",
        name: "Provident Fund",
        type: "percentage",
        value: 12,
        applicableToAll: true,
      },
      {
        id: "ded-3",
        name: "Health Insurance",
        type: "fixed",
        value: 500,
        applicableToAll: true,
      },
    ]
    deductions.forEach((d) => this.deductions.set(d.id, d))
  }

  // Employee Methods
  getEmployees() {
    return Array.from(this.employees.values())
  }

  getEmployee(id: string) {
    return this.employees.get(id)
  }

  addEmployee(employee: Employee) {
    this.employees.set(employee.id, employee)
    this.leaveBalances.set(employee.id, {
      employeeId: employee.id,
      casual: 10,
      sick: 7,
      paid: 15,
    })
    return employee
  }

  updateEmployee(id: string, updates: Partial<Employee>) {
    const employee = this.employees.get(id)
    if (employee) {
      const updated = { ...employee, ...updates }
      this.employees.set(id, updated)
      return updated
    }
    return null
  }

  deleteEmployee(id: string) {
    return this.employees.delete(id)
  }

  // Salary Structure Methods
  getSalaryStructures() {
    return Array.from(this.salaryStructures.values())
  }

  getSalaryStructure(id: string) {
    return this.salaryStructures.get(id)
  }

  addSalaryStructure(structure: SalaryStructure) {
    this.salaryStructures.set(structure.id, structure)
    return structure
  }

  updateSalaryStructure(id: string, updates: Partial<SalaryStructure>) {
    const structure = this.salaryStructures.get(id)
    if (structure) {
      const updated = { ...structure, ...updates }
      this.salaryStructures.set(id, updated)
      return updated
    }
    return null
  }

  // Attendance Methods
  getAttendance(employeeId?: string, startDate?: string, endDate?: string) {
    let records = Array.from(this.attendance.values())
    if (employeeId) {
      records = records.filter((a) => a.employeeId === employeeId)
    }
    if (startDate && endDate) {
      records = records.filter((a) => a.date >= startDate && a.date <= endDate)
    }
    return records
  }

  addAttendance(attendance: Attendance) {
    this.attendance.set(attendance.id, attendance)
    return attendance
  }

  updateAttendance(id: string, updates: Partial<Attendance>) {
    const attendance = this.attendance.get(id)
    if (attendance) {
      const updated = { ...attendance, ...updates }
      this.attendance.set(id, updated)
      return updated
    }
    return null
  }

  // Leave Methods
  getLeaves(employeeId?: string) {
    let leaves = Array.from(this.leaves.values())
    if (employeeId) {
      leaves = leaves.filter((l) => l.employeeId === employeeId)
    }
    return leaves
  }

  getLeaveBalance(employeeId: string) {
    return this.leaveBalances.get(employeeId)
  }

  addLeave(leave: Leave) {
    this.leaves.set(leave.id, leave)
    return leave
  }

  updateLeave(id: string, updates: Partial<Leave>) {
    const leave = this.leaves.get(id)
    if (leave) {
      const updated = { ...leave, ...updates }
      this.leaves.set(id, updated)

      // Update leave balance if approved
      if (updates.status === "Approved" && leave.status !== "Approved") {
        const balance = this.leaveBalances.get(leave.employeeId)
        if (balance) {
          const leaveType = leave.leaveType.toLowerCase() as "casual" | "sick" | "paid"
          if (leaveType in balance) {
            balance[leaveType] = Math.max(0, balance[leaveType] - leave.days)
            this.leaveBalances.set(leave.employeeId, balance)
          }
        }
      }

      return updated
    }
    return null
  }

  // Deduction Methods
  getDeductions() {
    return Array.from(this.deductions.values())
  }

  // Payroll Methods
  getPayrollRuns() {
    return Array.from(this.payrollRuns.values())
  }

  addPayrollRun(payrollRun: PayrollRun) {
    this.payrollRuns.set(payrollRun.id, payrollRun)
    return payrollRun
  }

  updatePayrollRun(id: string, updates: Partial<PayrollRun>) {
    const run = this.payrollRuns.get(id)
    if (run) {
      const updated = { ...run, ...updates }
      this.payrollRuns.set(id, updated)
      return updated
    }
    return null
  }

  // Payslip Methods
  getPayslips(employeeId?: string, payrollRunId?: string) {
    let payslips = Array.from(this.payslips.values())
    if (employeeId) {
      payslips = payslips.filter((p) => p.employeeId === employeeId)
    }
    if (payrollRunId) {
      payslips = payslips.filter((p) => p.payrollRunId === payrollRunId)
    }
    return payslips
  }

  addPayslip(payslip: Payslip) {
    this.payslips.set(payslip.id, payslip)
    return payslip
  }

  // Audit Log Methods
  addAuditLog(log: AuditLog) {
    this.auditLogs.push(log)
  }

  getAuditLogs(limit = 50) {
    return this.auditLogs.slice(-limit).reverse()
  }
}

export const dataStore = new DataStore()
