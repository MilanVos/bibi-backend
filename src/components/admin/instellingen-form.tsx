"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle } from "lucide-react"

interface Props {
  settings: Record<string, string>
}

export function InstellingenForm({ settings }: Props) {
  const router = useRouter()
  const [siteName, setSiteName] = useState(settings.site_name ?? "Jongerenraad")
  const [adminEmail, setAdminEmail] = useState(settings.admin_email ?? "")
  const [twoFactorRequired, setTwoFactorRequired] = useState(settings.two_factor_required === "true")
  const [allowRegistration, setAllowRegistration] = useState(settings.allow_registration === "true")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    await fetch("/api/admin/instellingen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site_name: siteName,
        admin_email: adminEmail,
        two_factor_required: String(twoFactorRequired),
        allow_registration: String(allowRegistration),
      }),
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Sitenaam</Label>
        <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Admin e-mail</Label>
        <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
      </div>

      <div className="space-y-3 pt-2 border-t border-slate-100">
        <p className="text-sm font-medium text-slate-700">Beveiliging</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={twoFactorRequired}
            onChange={(e) => setTwoFactorRequired(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <div>
            <p className="text-sm font-medium text-slate-700">2FA verplicht voor alle leden</p>
            <p className="text-xs text-slate-400">Gebruikers moeten 2FA instellen na goedkeuring</p>
          </div>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={allowRegistration}
            onChange={(e) => setAllowRegistration(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <div>
            <p className="text-sm font-medium text-slate-700">Registratie toestaan</p>
            <p className="text-xs text-slate-400">Nieuwe gebruikers kunnen zich aanmelden</p>
          </div>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Opslaan
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            Opgeslagen!
          </span>
        )}
      </div>
    </form>
  )
}
