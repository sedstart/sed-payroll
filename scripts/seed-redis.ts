import "dotenv/config"
import { getRedisClient } from "../lib/redis"
import type { Employee, SalaryStructure, Attendance, Deduction } from "../lib/types"

async function seedRedisData() {
  console.log("[v0] Starting Redis data seeding...")
  console.log("REDIS_URL:", process.env.REDIS_URL);


  try {
    const redis = await getRedisClient()

    // Clear existing data
    console.log("[v0] Clearing existing data...")
    await redis.del("payroll:employees")
    await redis.del("payroll:salary_structures")
    await redis.del("payroll:attendance")
    await redis.del("payroll:leaves")
    await redis.del("payroll:leave_balances")
    await redis.del("payroll:deductions")
    await redis.del("payroll:payroll_runs")
    await redis.del("payroll:payslips")
    await redis.del("payroll:audit_logs")

    // Seed Salary Structures
    console.log("[v0] Seeding salary structures...")
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

    for (const structure of salaryStructures) {
      await redis.hSet("payroll:salary_structures", structure.id, JSON.stringify(structure))
    }

    // Seed Employees
    console.log("[v0] Seeding employees...")
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

    for (const employee of employees) {
      await redis.hSet("payroll:employees", employee.id, JSON.stringify(employee))

      // Initialize leave balance for each employee
      await redis.hSet(
        "payroll:leave_balances",
        employee.id,
        JSON.stringify({
          employeeId: employee.id,
          casual: 10,
          sick: 7,
          paid: 15,
        }),
      )
    }

    // Seed Attendance for current month
    console.log("[v0] Seeding attendance records...")
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    for (const emp of employees) {
      for (let day = 1; day <= today.getDate(); day++) {
        const date = new Date(currentYear, currentMonth, day)
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          // Skip weekends
          const attId = `att-${emp.id}-${date.toISOString().split("T")[0]}`
          const attendance: Attendance = {
            id: attId,
            employeeId: emp.id,
            date: date.toISOString().split("T")[0],
            status: Math.random() > 0.1 ? "Present" : Math.random() > 0.5 ? "WFH" : "Absent",
            overtimeHours: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
          }
          await redis.hSet("payroll:attendance", attId, JSON.stringify(attendance))
        }
      }
    }

    // Seed Deductions
    console.log("[v0] Seeding deductions...")
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

    for (const deduction of deductions) {
      await redis.hSet("payroll:deductions", deduction.id, JSON.stringify(deduction))
    }

    console.log("[v0] ✅ Redis data seeding completed successfully!")
    console.log(`[v0] Seeded ${employees.length} employees`)
    console.log(`[v0] Seeded ${salaryStructures.length} salary structures`)
    console.log(`[v0] Seeded ${deductions.length} deductions`)
    console.log(`[v0] Seeded attendance records for current month`)
  } catch (error) {
    console.error("[v0] ❌ Error seeding Redis data:", error)
    throw error
  }
}

// Run the seed function
seedRedisData()
  .then(() => {
    console.log("[v0] Seeding script finished")
    process.exit(0)
  })
  .catch((error) => {
    console.error("[v0] Seeding script failed:", error)
    process.exit(1)
  })
