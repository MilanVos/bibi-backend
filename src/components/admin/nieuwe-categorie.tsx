"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Loader2 } from "lucide-react"

export function NieuweCategorie() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [naam, setNaam] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/admin/navigatie/categorieen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam }),
    })
    setOpen(false)
    setNaam("")
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm">
        <Plus className="w-4 h-4 mr-1" />
        Categorie
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-slate-800">Nieuwe categorie</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="space-y-2">
            <Label>Naam</Label>
            <Input value={naam} onChange={(e) => setNaam(e.target.value)} placeholder="bijv. Algemeen" required />
          </div>
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
