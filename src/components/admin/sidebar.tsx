"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Users, Package, FileText,
  Navigation, Settings, ChevronLeft,
} from "lucide-react"

const NAV = [
  { href: "/admin", label: "Overzicht", icon: LayoutDashboard, exact: true },
  { href: "/admin/gebruikers", label: "Gebruikers", icon: Users },
  { href: "/admin/modules", label: "Modules", icon: Package },
  { href: "/admin/paginas", label: "Pagina's", icon: FileText },
  { href: "/admin/navigatie", label: "Navigatie", icon: Navigation },
  { href: "/admin/instellingen", label: "Instellingen", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col flex-shrink-0 h-screen sticky top-0">
      <div className="p-4 border-b border-slate-700">
        <Link href="/portaal" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-3">
          <ChevronLeft className="w-4 h-4" />
          Terug naar portaal
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-bold text-sm">
            A
          </div>
          <span className="font-semibold text-sm">Beheer</span>
        </div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-yellow-500 text-slate-900 font-semibold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
