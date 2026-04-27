"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signUp } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [naam, setNaam] = useState("")
  const [email, setEmail] = useState("")
  const [wachtwoord, setWachtwoord] = useState("")
  const [bevestig, setBevestig] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (wachtwoord !== bevestig) {
      setError("Wachtwoorden komen niet overeen.")
      return
    }
    if (wachtwoord.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens bevatten.")
      return
    }

    setLoading(true)

    const result = await signUp.email({
      name: naam,
      email,
      password: wachtwoord,
    })

    if (result.error) {
      if (result.error.message?.includes("already")) {
        setError("Dit e-mailadres is al in gebruik.")
      } else {
        setError("Er is een fout opgetreden. Probeer opnieuw.")
      }
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <Card className="bg-white/5 border-white/10 text-white">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Registratie ontvangen!</h2>
          <p className="text-slate-300 text-sm">
            Je account is aangemaakt maar wacht op goedkeuring door een beheerder.
            Je ontvangt een e-mail zodra je account is goedgekeurd.
          </p>
          <Link href="/login">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 mt-2">
              Terug naar inloggen
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader>
        <CardTitle className="text-white">Account aanmaken</CardTitle>
        <CardDescription className="text-slate-400">
          Na registratie wacht je account op goedkeuring door een beheerder
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="naam" className="text-slate-300">Volledige naam</Label>
            <Input
              id="naam"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              placeholder="Jan de Vries"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jij@example.com"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wachtwoord" className="text-slate-300">Wachtwoord</Label>
            <Input
              id="wachtwoord"
              type="password"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              placeholder="Minimaal 8 tekens"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bevestig" className="text-slate-300">Wachtwoord bevestigen</Label>
            <Input
              id="bevestig"
              type="password"
              value={bevestig}
              onChange={(e) => setBevestig(e.target.value)}
              placeholder="Herhaal wachtwoord"
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Registreren
          </Button>
          <p className="text-slate-400 text-sm text-center">
            Al een account?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              Inloggen
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
