import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Shield, Layout, MessageSquare } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-900 font-bold text-lg">J</span>
            </div>
            <span className="text-white font-bold text-xl">Jongerenraad</span>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Inloggen
              </Button>
            </Link>
            <Link href="/registreren">
              <Button className="bg-white text-blue-900 hover:bg-white/90">
                Registreren
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">
          Welkom bij de<br />
          <span className="text-blue-300">Jongerenraad</span>
        </h1>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Het beveiligde digitale portaal voor leden van de Jongerenraad.
          Registreer je en krijg toegang na goedkeuring door een beheerder.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/registreren">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90 px-8">
              Word lid
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 px-8">
              Al lid? Inloggen
            </Button>
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {[
            {
              icon: Shield,
              title: "Beveiligd portaal",
              desc: "2FA verplicht voor alle leden. Je account wordt handmatig goedgekeurd door een beheerder.",
            },
            {
              icon: Users,
              title: "Ledenomgeving",
              desc: "Alleen goedgekeurde leden krijgen toegang tot het portaal en de inhoud.",
            },
            {
              icon: Layout,
              title: "Beheer dashboard",
              desc: "Admins beheren modules, pagina's, navigatie en alle site-instellingen.",
            },
            {
              icon: MessageSquare,
              title: "Forum & uploads",
              desc: "Leden kunnen berichten plaatsen, reageren en bestanden delen.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
              <Icon className="w-8 h-8 text-blue-300 mb-3" />
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              <p className="text-blue-100 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-blue-200 text-sm">
        © {new Date().getFullYear()} Jongerenraad. Alle rechten voorbehouden.
      </footer>
    </div>
  )
}
