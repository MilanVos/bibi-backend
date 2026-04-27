"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Loader2 } from "lucide-react"

export function NieuwePagina() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [titel, setTitel] = useState("")
  const [slug, setSlug] = useState("")
  const [inhoud, setInhoud] = useState("")
  const [gepubliceerd, setGepubliceerd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function genSlug(val: string) {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/admin/paginas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titel, slug, inhoud, gepubliceerd }),
    })

    if (res.ok) {
      setOpen(false)
      setTitel("")
      setSlug("")
      setInhoud("")
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Er ging iets mis")
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="w-4 h-4 mr-1" />
        Nieuwe pagina
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Nieuwe pagina</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">{error}</div>
          )}
          <div className="space-y-2">
            <Label>Titel</Label>
            <Input
              value={titel}
              onChange={(e) => {
                setTitel(e.target.value)
                setSlug(genSlug(e.target.value))
              }}
              placeholder="Pagina titel"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Slug (URL)</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="pagina-slug"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Inhoud</Label>
            <Textarea value={inhoud} onChange={(e) => setInhoud(e.target.value)} rows={6} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={gepubliceerd}
              onChange={(e) => setGepubliceerd(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-slate-700">Direct publiceren</span>
          </label>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuleren</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Opslaan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
