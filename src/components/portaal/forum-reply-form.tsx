"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

export function ForumReplyForm({ postId }: { postId: string }) {
  const router = useRouter()
  const [inhoud, setInhoud] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch(`/api/forum/posts/${postId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inhoud }),
    })

    if (res.ok) {
      setInhoud("")
      router.refresh()
    } else {
      setError("Er ging iets mis. Probeer opnieuw.")
    }

    setLoading(false)
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <h3 className="font-medium text-slate-700">Reageren</h3>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
            {error}
          </div>
        )}
        <Textarea
          value={inhoud}
          onChange={(e) => setInhoud(e.target.value)}
          placeholder="Schrijf je reactie..."
          rows={3}
          required
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={loading || !inhoud.trim()}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Reactie plaatsen
          </Button>
        </div>
      </form>
    </Card>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
