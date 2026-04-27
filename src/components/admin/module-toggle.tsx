"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function ModuleToggle({ moduleId, enabled }: { moduleId: string; enabled: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await fetch(`/api/admin/modules/${moduleId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        enabled ? "bg-blue-600" : "bg-slate-200"
      } ${loading ? "opacity-50" : ""}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}
