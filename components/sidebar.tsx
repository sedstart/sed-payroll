"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import {
  Users,
  DollarSign,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Clock,
} from "lucide-react"
import { LogoutButton } from "./logout-button"

type UserRole = "admin" | "employee"

interface MeResponse {
  role: UserRole
  email: string
}

const adminNavigation = [
  { name: "Dashboard", href: "/", icon: BarChart3, id: "nav-dashboard" },
  { name: "Employees", href: "/admin/employees", icon: Users, id: "nav-employees" },
  { name: "Attendance", href: "/admin/attendance", icon: Clock, id: "nav-attendance" },
  { name: "Leaves", href: "/admin/leaves", icon: Calendar, id: "nav-leaves" },
  { name: "Payroll", href: "/admin/payroll", icon: DollarSign, id: "nav-payroll" },
  { name: "Payslips", href: "/admin/payslips", icon: FileText, id: "nav-payslips" },
  { name: "Reports", href: "/admin/reports", icon: BarChart3, id: "nav-reports" },
  { name: "Settings", href: "/admin/settings", icon: Settings, id: "nav-settings" },
]

const employeeNavigation = [
  { name: "Dashboard", href: "/employee", icon: BarChart3, id: "nav-dashboard" },
  { name: "My Attendance", href: "/employee/attendance", icon: Clock, id: "nav-attendance" },
  { name: "My Leaves", href: "/employee/leaves", icon: Calendar, id: "nav-leaves" },
  { name: "My Payslips", href: "/employee/payslips", icon: FileText, id: "nav-payslips" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<MeResponse | null>(null)

  useEffect(() => {
    fetch("/api/auth/me", {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(setUser)
      .catch(() => setUser(null))
  }, [])

  if (!user) {
    // Prevent layout shift; sidebar skeleton can be added later
    console.log("no user detected")
    return null
  }

  const navigation =
    user.role === "admin" ? adminNavigation : employeeNavigation
  
  function isNavActive(pathname: string, href: string) {
    if (href === "/employee") {
      return pathname === "/employee"
    }

    return pathname === href || pathname.startsWith(href + "/")
  }


  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <DollarSign className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold text-foreground">SedPay</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = isNavActive(pathname, item.href)
          return (
            <Link
              key={item.id}
              href={item.href}
              id={item.id}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-sm font-semibold">
              {user.email.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {user.role === "admin" ? "Admin User" : "Employee"}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </div>
  )
}
