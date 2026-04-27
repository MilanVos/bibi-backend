"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"

interface Props {
  type: "post" | "reply"
  id: string
  redirectAfter?: string
}

export function ForumVerwijderKnop({ type, id, redirectAfter }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }

    setLoading(true)
    const url = type === "post"
      ? `/api/forum/posts/${id}`
      : `/api/forum/replies/${id}`

    const res = await fetch(url, { method: "DELETE" })

    if (res.ok) {
      if (redirectAfter) {
        router.push(redirectAfter)
      } else {
        router.refresh()
      }
    }
    setLoading(false)
    setConfirming(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title={confirming ? "Nogmaals klikken om te bevestigen" : "Verwijderen"}
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
        confirming
          ? "bg-red-600 text-white hover:bg-red-700"
          : "text-red-500 hover:bg-red-50 hover:text-red-700"
      }`}
    >
      {loading
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : <Trash2 className="w-3 h-3" />
      }
      {confirming ? "Bevestigen?" : "Verwijderen"}
    </button>
  )
}
