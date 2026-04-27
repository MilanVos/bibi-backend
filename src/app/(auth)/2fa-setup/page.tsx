"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { twoFactor } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, Shield, KeyRound } from "lucide-react"

type Step = "password" | "setup" | "backup"

export default function TwoFactorSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("password")
  const [password, setPassword] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [secret, setSecret] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await twoFactor.enable({ password })

    if (result.error || !result.data) {
      setError("Wachtwoord onjuist of er is een fout opgetreden.")
      setLoading(false)
      return
    }

    const data = result.data as { totpURI?: string; backupCodes?: string[] }
    const uri = data.totpURI ?? ""
    setSecret(uri.split("secret=")[1]?.split("&")[0] || "")
    if (data.backupCodes?.length) setBackupCodes(data.backupCodes)

    try {
      const QRCode = (await import("qrcode")).default
      setQrCode(await QRCode.toDataURL(uri))
    } catch {
      setQrCode("")
    }

    setLoading(false)
    setStep("setup")
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setVerifying(true)
    setError("")

    const result = await twoFactor.verifyTotp({ code })

    if (result.error) {
      setError("Ongeldige code. Probeer opnieuw.")
    } else {
      if (backupCodes.length) {
        setStep("backup")
      } else {
        router.push("/portaal")
      }
    }

    setVerifying(false)
  }

  if (step === "backup") {
    return (
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            2FA ingesteld!
          </CardTitle>
          <CardDescription className="text-slate-400">
            Sla deze herstelcodes veilig op. Je hebt ze nodig als je geen toegang hebt tot je authenticator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 bg-slate-900/50 rounded-lg p-4">
            {backupCodes.map((c) => (
              <code key={c} className="text-green-300 text-sm font-mono text-center py-1">
                {c}
              </code>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push("/portaal")}>
            Doorgaan naar portaal
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (step === "setup") {
    return (
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Scan de QR-code
          </CardTitle>
          <CardDescription className="text-slate-400">
            Open Google Authenticator of een vergelijkbare app en scan de code
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleVerify}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              {qrCode ? (
                <div className="bg-white p-3 rounded-lg">
                  <img src={qrCode} alt="QR code" width={192} height={192} />
                </div>
              ) : (
                <div className="bg-slate-800 rounded-lg p-4 text-center">
                  <p className="text-slate-300 text-xs mb-2">Handmatige code:</p>
                  <code className="text-green-300 text-sm font-mono break-all">{secret}</code>
                </div>
              )}
            </div>

            {secret && (
              <div className="bg-slate-900/50 rounded-md p-3 text-center">
                <p className="text-slate-400 text-xs mb-1">Of voer handmatig in:</p>
                <code className="text-blue-300 text-sm font-mono break-all">{secret}</code>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="code" className="text-slate-300">Verificatiecode uit app</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                maxLength={6}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 text-center text-2xl tracking-widest"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={verifying || code.length < 6}>
              {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
              Bevestigen & activeren
            </Button>
          </CardFooter>
        </form>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-blue-400" />
          Twee-factor authenticatie instellen
        </CardTitle>
        <CardDescription className="text-slate-400">
          Voer je wachtwoord in om door te gaan
        </CardDescription>
      </CardHeader>

      <form onSubmit={handlePasswordSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 text-red-300 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">Huidig wachtwoord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading || !password}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Doorgaan
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
