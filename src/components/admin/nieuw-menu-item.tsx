"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Loader2 } from "lucide-react"

interface Props {
  categoryId: string
  modules: { id: string; name: string }[]
  pages: { id: string; title: string }[]
}

export function NieuwMenuItem({ categoryId, modules, pages }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState("")
  const [linkType, setLinkType] = useState("MODULE")
  const [moduleId, setModuleId] = useState("")
  const [pageId, setPageId] = useState("")
  const [externalUrl, setExternalUrl] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/admin/navigatie/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, label, linkType, moduleId, pageId, externalUrl }),
    })
    setOpen(false)
    setLabel("")
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Plus className="w-3 h-3 mr-1" />
        Item
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-slate-800">Nieuw menu-item</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="bijv. Nieuws" required />
          </div>
          <div className="space-y-2">
            <Label>Type link</Label>
            <select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="MODULE">Module</option>
              <option value="PAGE">Pagina</option>
              <option value="URL">Externe URL</option>
            </select>
          </div>
          {linkType === "MODULE" && (
            <div className="space-y-2">
              <Label>Module</Label>
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Kies module...</option>
                {modules.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}
          {linkType === "PAGE" && (
            <div className="space-y-2">
              <Label>Pagina</Label>
              <select
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Kies pagina...</option>
                {pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
          )}
          {linkType === "URL" && (
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://..." required />
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuleren</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Toevoegen
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
