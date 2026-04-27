"use client"

import Link from "next/link"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"

export default function WachtenPage() {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push("/login")
  }

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardContent className="pt-8 pb-8 text-center space-y-4">
        <Clock className="w-16 h-16 text-yellow-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Account in afwachting</h2>
        <p className="text-slate-300 text-sm leading-relaxed">
          Je account wacht op goedkeuring door een beheerder van de Jongerenraad.
          Je ontvangt een e-mail zodra je toegang hebt gekregen.
        </p>
        <Button
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
          onClick={handleSignOut}
        >
          Uitloggen
        </Button>
      </CardContent>
    </Card>
  )
}
