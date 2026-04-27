"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, Newspaper, FileText, MessageSquare,
  Upload, User, Settings, ChevronDown, ChevronRight,
} from "lucide-react"
import { useState } from "react"

const ICON_MAP: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  nieuws: Newspaper,
  documenten: FileText,
  forum: MessageSquare,
  uploads: Upload,
  profiel: User,
  settings: Settings,
  layout: LayoutDashboard,
}

interface MenuItem {
  id: string
  label: string
  icon?: string | null
  linkType: string
  module?: { route: string } | null
  page?: { slug: string } | null
  externalUrl?: string | null
}

interface Category {
  id: string
  name: string
  menuItems: MenuItem[]
}

interface SidebarProps {
  categories: Category[]
  user: { name: string; role: string }
}

function getHref(item: MenuItem): string {
  if (item.linkType === "MODULE" && item.module) return `/portaal${item.module.route}`
  if (item.linkType === "PAGE" && item.page) return `/portaal/pagina/${item.page.slug}`
  if (item.linkType === "URL" && item.externalUrl) return item.externalUrl
  return "#"
}

export function PortaalSidebar({ categories, user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  function toggleCategory(id: string) {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN"

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 h-screen sticky top-0">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">
            J
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight">Jongerenraad</p>
            <p className="text-xs text-slate-400 truncate">{user.name}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <Link
          href="/portaal"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1",
            pathname === "/portaal"
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          )}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          Dashboard
        </Link>

        {categories.map((cat) => {
          const isOpen = !collapsed[cat.id]
          return (
            <div key={cat.id} className="mb-1">
              <button
                onClick={() => toggleCategory(cat.id)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition-colors"
              >
                {cat.name}
                {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              {isOpen && (
                <div className="space-y-0.5">
                  {cat.menuItems.map((item) => {
                    const href = getHref(item)
                    const Icon = ICON_MAP[item.icon || "layout"] || LayoutDashboard
                    const active = pathname === href || pathname.startsWith(href + "/")
                    return (
                      <Link
                        key={item.id}
                        href={href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          active
                            ? "bg-blue-600 text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        <div className="mt-2 border-t border-slate-700 pt-2 space-y-0.5">
          <Link
            href="/portaal/profiel"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === "/portaal/profiel"
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <User className="w-4 h-4 flex-shrink-0" />
            Mijn profiel
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-yellow-400 hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 flex-shrink-0" />
              Beheer dashboard
            </Link>
          )}
        </div>
      </nav>
    </aside>
  )
}
