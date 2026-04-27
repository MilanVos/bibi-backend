"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2, X } from "lucide-react"

export function NieuwForumPost({ userId }: { userId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [titel, setTitel] = useState("")
  const [inhoud, setInhoud] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/forum/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titel, inhoud }),
    })

    if (res.ok) {
      setOpen(false)
      setTitel("")
      setInhoud("")
      router.refresh()
    } else {
      setError("Er ging iets mis. Probeer opnieuw.")
    }

    setLoading(false)
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Nieuw bericht
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-slate-800">Nieuw forum bericht</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label>Titel</Label>
            <Input
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="Waar gaat je bericht over?"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Inhoud</Label>
            <Textarea
              value={inhoud}
              onChange={(e) => setInhoud(e.target.value)}
              placeholder="Schrijf hier je bericht..."
              rows={6}
              required
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Plaatsen
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
