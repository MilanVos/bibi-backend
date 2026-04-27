import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Newspaper } from "lucide-react"

export default async function NieuwsPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  const pages = await db.page.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const isAdmin = session?.user &&
    ((session.user as { role?: string }).role === "ADMIN" ||
      (session.user as { role?: string }).role === "SUPERADMIN")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nieuws</h1>
          <p className="text-slate-500 text-sm mt-1">Laatste berichten en mededelingen</p>
        </div>
        {isAdmin && (
          <a
            href="/admin/paginas"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nieuws beheren
          </a>
        )}
      </div>

      {pages.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="py-16 text-center">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Geen nieuwsberichten beschikbaar</p>
            {isAdmin && (
              <p className="text-slate-400 text-sm mt-2">
                Voeg pagina&apos;s toe via het{" "}
                <a href="/admin/paginas" className="text-blue-600 hover:underline">
                  beheer dashboard
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pages.map((page) => (
            <Card key={page.id} className="bg-white hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-lg text-slate-800">{page.title}</CardTitle>
                  <Badge variant="success" className="flex-shrink-0">Gepubliceerd</Badge>
                </div>
                <p className="text-sm text-slate-400">{formatDate(page.createdAt)}</p>
              </CardHeader>
              {page.content && (
                <CardContent>
                  <div
                    className="text-slate-600 text-sm prose prose-sm max-w-none line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: page.content.slice(0, 300) }}
                  />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
