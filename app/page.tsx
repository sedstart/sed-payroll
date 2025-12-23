// app/page.tsx
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import DashboardPage from "./dashboard/page"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role === "admin") {
    console.log("admin log")
    return <DashboardPage/>
  }

  // employee
  redirect("/employee")
}
