"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { LogOut, Bell, Sun, Moon } from "lucide-react"
import { getInitials } from "@/lib/utils"

interface HeaderProps {
  user: {
    name: string
    email: string
    role: string
  }
}

const ROLE_LABELS: Record<string, string> = {
  USER: "Lid",
  EDITOR: "Redacteur",
  ADMIN: "Beheerder",
  SUPERADMIN: "Super Admin",
}

export function PortaalHeader({ user }: HeaderProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  async function handleSignOut() {
    await signOut()
    router.push("/login")
  }

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div />
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-slate-500 dark:text-slate-400"
          title={theme === "dark" ? "Lichte modus" : "Donkere modus"}
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400">
          <Bell className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {getInitials(user.name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-tight">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{ROLE_LABELS[user.role] ?? user.role}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-slate-500 dark:text-slate-400">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
