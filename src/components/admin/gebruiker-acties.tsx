"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, X, Shield, Ban, ChevronDown } from "lucide-react"

const ROLES = [
  { value: "USER", label: "Lid" },
  { value: "EDITOR", label: "Redacteur" },
  { value: "ADMIN", label: "Beheerder" },
]

interface Props {
  userId: string
  currentStatus: string
  currentRole: string
  viewerRole: string
}

export function GebruikerActies({ userId, currentStatus, currentRole, viewerRole }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showRoles, setShowRoles] = useState(false)

  if (currentRole === "SUPERADMIN") {
    return <span className="text-xs text-slate-400 italic px-2">Beschermd account</span>
  }

  const canChangeRole = currentRole !== "ADMIN" || viewerRole === "SUPERADMIN"

  async function updateUser(data: Record<string, string>) {
    setLoading(true)
    await fetch(`/api/admin/gebruikers/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-1 justify-end flex-wrap">
      {currentStatus === "PENDING" && (
        <>
          <Button
            size="sm"
            className="h-7 text-xs bg-green-600 hover:bg-green-700"
            onClick={() => updateUser({ status: "ACTIVE" })}
            disabled={loading}
          >
            <Check className="w-3 h-3 mr-1" />
            Goedkeuren
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 text-xs"
            onClick={() => updateUser({ status: "REJECTED" })}
            disabled={loading}
          >
            <X className="w-3 h-3 mr-1" />
            Weigeren
          </Button>
        </>
      )}

      {currentStatus === "ACTIVE" && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => updateUser({ status: "BLOCKED" })}
          disabled={loading}
        >
          <Ban className="w-3 h-3 mr-1" />
          Blokkeren
        </Button>
      )}

      {(currentStatus === "REJECTED" || currentStatus === "BLOCKED") && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => updateUser({ status: "ACTIVE" })}
          disabled={loading}
        >
          <Check className="w-3 h-3 mr-1" />
          Activeren
        </Button>
      )}

      {canChangeRole && (
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => setShowRoles(!showRoles)}
          >
            <Shield className="w-3 h-3 mr-1" />
            Rol
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
          {showRoles && (
            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[120px]">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${currentRole === role.value ? "text-blue-600 font-medium" : "text-slate-700"}`}
                  onClick={() => {
                    updateUser({ role: role.value })
                    setShowRoles(false)
                  }}
                >
                  {role.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
