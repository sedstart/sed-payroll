"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function LogoutButton() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      })

      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("[v0] Logout error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during logout",
      })
    }
  }

  return (
    <Button
      id="logout-btn"
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  )
}
