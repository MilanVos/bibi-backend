"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface MenuItem {
  id: string
  label: string
  linkType: string
  module?: { name: string } | null
  page?: { title: string } | null
  externalUrl?: string | null
}

export function MenuItemBeheer({ items }: { items: MenuItem[] }) {
  const router = useRouter()

  async function deleteItem(id: string) {
    await fetch(`/api/admin/navigatie/items/${id}`, { method: "DELETE" })
    router.refresh()
  }

  if (items.length === 0) {
    return <p className="text-slate-400 text-sm py-2">Geen items in deze categorie</p>
  }

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const dest = item.linkType === "MODULE" ? item.module?.name
          : item.linkType === "PAGE" ? item.page?.title
          : item.externalUrl
        return (
          <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
            <div>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
              <span className="text-xs text-slate-400 ml-2">→ {dest}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-red-500"
              onClick={() => deleteItem(item.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
