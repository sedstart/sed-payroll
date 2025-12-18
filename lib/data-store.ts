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
import { getRedisClient } from "./redis"

class DataStore {
  // Redis keys
  private KEYS = {
    EMPLOYEES: "payroll:employees",
    SALARY_STRUCTURES: "payroll:salary_structures",
    ATTENDANCE: "payroll:attendance",
    LEAVES: "payroll:leaves",
    LEAVE_BALANCES: "payroll:leave_balances",
    DEDUCTIONS: "payroll:deductions",
    PAYROLL_RUNS: "payroll:payroll_runs",
    PAYSLIPS: "payroll:payslips",
    AUDIT_LOGS: "payroll:audit_logs",
  }

  private async getRedis() {
    return await getRedisClient()
  }

  // Helper methods for Redis operations
  private async hGetAll<T>(key: string): Promise<T[]> {
    const redis = await this.getRedis()
    const data = await redis.hGetAll(key)
    return Object.values(data).map((item) => JSON.parse(item))
  }

  private async hGet<T>(key: string, field: string): Promise<T | null> {
    const redis = await this.getRedis()
    const data = await redis.hGet(key, field)
    return data ? JSON.parse(data) : null
  }

  private async hSet(key: string, field: string, value: any): Promise<void> {
    const redis = await this.getRedis()
    await redis.hSet(key, field, JSON.stringify(value))
  }

  private async hDel(key: string, field: string): Promise<void> {
    const redis = await this.getRedis()
    await redis.hDel(key, field)
  }

  private async lPush(key: string, value: any): Promise<void> {
    const redis = await this.getRedis()
    await redis.lPush(key, JSON.stringify(value))
  }

  private async lRange<T>(key: string, start: number, stop: number): Promise<T[]> {
    const redis = await this.getRedis()
    const data = await redis.lRange(key, start, stop)
    return data.map((item) => JSON.parse(item))
  }

  // Employee Methods
  async getEmployees() {
    return await this.hGetAll<Employee>(this.KEYS.EMPLOYEES)
  }

  async getEmployee(id: string) {
    return await this.hGet<Employee>(this.KEYS.EMPLOYEES, id)
  }

  async addEmployee(employee: Employee) {
    await this.hSet(this.KEYS.EMPLOYEES, employee.id, employee)
    // Initialize leave balance
    await this.hSet(this.KEYS.LEAVE_BALANCES, employee.id, {
      employeeId: employee.id,
      casual: 10,
      sick: 7,
      paid: 15,
    })
    return employee
  }

  async updateEmployee(id: string, updates: Partial<Employee>) {
    const employee = await this.getEmployee(id)
    if (employee) {
      const updated = { ...employee, ...updates }
      await this.hSet(this.KEYS.EMPLOYEES, id, updated)
      return updated
    }
    return null
  }

  async deleteEmployee(id: string) {
    await this.hDel(this.KEYS.EMPLOYEES, id)
    return true
  }

  // Salary Structure Methods
  async getSalaryStructures() {
    return await this.hGetAll<SalaryStructure>(this.KEYS.SALARY_STRUCTURES)
  }

  async getSalaryStructure(id: string) {
    return await this.hGet<SalaryStructure>(this.KEYS.SALARY_STRUCTURES, id)
  }

  async addSalaryStructure(structure: SalaryStructure) {
    await this.hSet(this.KEYS.SALARY_STRUCTURES, structure.id, structure)
    return structure
  }

  async updateSalaryStructure(id: string, updates: Partial<SalaryStructure>) {
    const structure = await this.getSalaryStructure(id)
    if (structure) {
      const updated = { ...structure, ...updates }
      await this.hSet(this.KEYS.SALARY_STRUCTURES, id, updated)
      return updated
    }
    return null
  }

  // Attendance Methods
  async getAttendance(employeeId?: string, startDate?: string, endDate?: string) {
    let records = await this.hGetAll<Attendance>(this.KEYS.ATTENDANCE)
    if (employeeId) {
      records = records.filter((a) => a.employeeId === employeeId)
    }
    if (startDate && endDate) {
      records = records.filter((a) => a.date >= startDate && a.date <= endDate)
    }
    return records
  }

  async addAttendance(attendance: Attendance) {
    await this.hSet(this.KEYS.ATTENDANCE, attendance.id, attendance)
    return attendance
  }

  async updateAttendance(id: string, updates: Partial<Attendance>) {
    const attendance = await this.hGet<Attendance>(this.KEYS.ATTENDANCE, id)
    if (attendance) {
      const updated = { ...attendance, ...updates }
      await this.hSet(this.KEYS.ATTENDANCE, id, updated)
      return updated
    }
    return null
  }

  // Leave Methods
  async getLeaves(employeeId?: string) {
    let leaves = await this.hGetAll<Leave>(this.KEYS.LEAVES)
    if (employeeId) {
      leaves = leaves.filter((l) => l.employeeId === employeeId)
    }
    return leaves
  }

  async getLeaveBalance(employeeId: string) {
    return await this.hGet<LeaveBalance>(this.KEYS.LEAVE_BALANCES, employeeId)
  }

  async addLeave(leave: Leave) {
    await this.hSet(this.KEYS.LEAVES, leave.id, leave)
    return leave
  }

  async updateLeave(id: string, updates: Partial<Leave>) {
    const leave = await this.hGet<Leave>(this.KEYS.LEAVES, id)
    if (leave) {
      const updated = { ...leave, ...updates }
      await this.hSet(this.KEYS.LEAVES, id, updated)

      // Update leave balance if approved
      if (updates.status === "Approved" && leave.status !== "Approved") {
        const balance = await this.getLeaveBalance(leave.employeeId)
        if (balance) {
          const leaveType = leave.leaveType.toLowerCase() as "casual" | "sick" | "paid"
          if (leaveType in balance) {
            balance[leaveType] = Math.max(0, balance[leaveType] - leave.days)
            await this.hSet(this.KEYS.LEAVE_BALANCES, leave.employeeId, balance)
          }
        }
      }

      return updated
    }
    return null
  }

  // Deduction Methods
  async getDeductions() {
    return await this.hGetAll<Deduction>(this.KEYS.DEDUCTIONS)
  }

  async addDeduction(deduction: Deduction) {
    await this.hSet(this.KEYS.DEDUCTIONS, deduction.id, deduction)
    return deduction
  }

  // Payroll Methods
  async getPayrollRuns() {
    return await this.hGetAll<PayrollRun>(this.KEYS.PAYROLL_RUNS)
  }

  async addPayrollRun(payrollRun: PayrollRun) {
    await this.hSet(this.KEYS.PAYROLL_RUNS, payrollRun.id, payrollRun)
    return payrollRun
  }

  async updatePayrollRun(id: string, updates: Partial<PayrollRun>) {
    const run = await this.hGet<PayrollRun>(this.KEYS.PAYROLL_RUNS, id)
    if (run) {
      const updated = { ...run, ...updates }
      await this.hSet(this.KEYS.PAYROLL_RUNS, id, updated)
      return updated
    }
    return null
  }

  // Payslip Methods
  async getPayslips(employeeId?: string, payrollRunId?: string) {
    let payslips = await this.hGetAll<Payslip>(this.KEYS.PAYSLIPS)
    if (employeeId) {
      payslips = payslips.filter((p) => p.employeeId === employeeId)
    }
    if (payrollRunId) {
      payslips = payslips.filter((p) => p.payrollRunId === payrollRunId)
    }
    return payslips
  }

  async addPayslip(payslip: Payslip) {
    await this.hSet(this.KEYS.PAYSLIPS, payslip.id, payslip)
    return payslip
  }

  // Audit Log Methods
  async addAuditLog(log: AuditLog) {
    await this.lPush(this.KEYS.AUDIT_LOGS, log)
  }

  async getAuditLogs(limit = 50) {
    const logs = await this.lRange<AuditLog>(this.KEYS.AUDIT_LOGS, 0, limit - 1)
    return logs
  }
}

export const dataStore = new DataStore()
