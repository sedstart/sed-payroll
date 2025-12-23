// app/admin/layout.tsx
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) redirect("/login")
  if (user.role !== "admin") redirect("/")

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
