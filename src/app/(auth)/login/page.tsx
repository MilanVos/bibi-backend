"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn, twoFactor } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn.email({
      email,
      password,
    })

    if (result.data && (result.data as { twoFactorRedirect?: boolean }).twoFactorRedirect) {
      setNeedsTwoFactor(true)
    } else if (result.error) {
      if (result.error.message?.includes("PENDING") || result.error.message?.includes("pending")) {
        setError("Je account wacht nog op goedkeuring door een beheerder.")
      } else if (result.error.message?.includes("REJECTED")) {
        setError("Je account is geweigerd. Neem contact op met een beheerder.")
      } else {
        setError("Ongeldig e-mailadres of wachtwoord.")
      }
    } else {
      router.push("/portaal")
    }
    setLoading(false)
  }

  async function handleTwoFactor(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await twoFactor.verifyTotp({
      code: twoFactorCode,
    })

    if (result.error) {
      setError("Ongeldige verificatiecode. Probeer opnieuw.")
    } else {
      router.push("/portaal")
    }
    setLoading(false)
  }

  return (
    <Card className="bg-white/5 dark:bg-white/5 bg-white border-white/10 dark:border-white/10 border-slate-200 text-white dark:text-white text-slate-800">
      <CardHeader>
        <CardTitle className="text-white dark:text-white text-slate-800">
          {needsTwoFactor ? "Twee-factor verificatie" : "Inloggen"}
        </CardTitle>
        <CardDescription className="text-slate-400 dark:text-slate-400 text-slate-500">
          {needsTwoFactor
            ? "Voer de code uit je authenticator-app in"
            : "Voer je gegevens in om in te loggen"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={needsTwoFactor ? handleTwoFactor : handleLogin}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {!needsTwoFactor ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 dark:text-slate-300 text-slate-700">E-mailadres</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jij@example.com"
                  required
                  className="bg-white/10 dark:bg-white/10 bg-slate-50 border-white/20 dark:border-white/20 border-slate-300 text-white dark:text-white text-slate-800 placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 dark:text-slate-300 text-slate-700">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/10 dark:bg-white/10 bg-slate-50 border-white/20 dark:border-white/20 border-slate-300 text-white dark:text-white text-slate-800 placeholder:text-slate-500"
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="code" className="text-slate-300 dark:text-slate-300 text-slate-700">Verificatiecode</Label>
              <Input
                id="code"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                className="bg-white/10 dark:bg-white/10 bg-slate-50 border-white/20 dark:border-white/20 border-slate-300 text-white dark:text-white text-slate-800 placeholder:text-slate-500 text-center text-2xl tracking-widest"
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {needsTwoFactor ? "Verifiëren" : "Inloggen"}
          </Button>
          {!needsTwoFactor && (
            <p className="text-slate-400 dark:text-slate-400 text-slate-500 text-sm text-center">
              Nog geen account?{" "}
              <Link href="/registreren" className="text-blue-400 hover:underline">
                Registreren
              </Link>
            </p>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
