import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils"
import { NieuwePagina } from "@/components/admin/nieuwe-pagina"
import Link from "next/link"
import { Edit } from "lucide-react"

export default async function PaginasPage() {
  const pages = await db.page.findMany({ orderBy: { createdAt: "desc" } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pagina&apos;s</h1>
          <p className="text-slate-500 text-sm mt-1">{pages.length} pagina&apos;s</p>
        </div>
        <NieuwePagina />
      </div>

      <Card className="bg-white">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Titel</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Slug</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Aangemaakt</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800 text-sm">{page.title}</td>
                  <td className="py-3 px-4 text-slate-500 text-sm font-mono">/{page.slug}</td>
                  <td className="py-3 px-4">
                    <Badge variant={page.published ? "success" : "secondary"}>
                      {page.published ? "Gepubliceerd" : "Concept"}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-sm">{formatDateTime(page.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/admin/paginas/${page.id}`}>
                      <button className="p-1.5 rounded hover:bg-slate-100 transition-colors">
                        <Edit className="w-4 h-4 text-slate-500" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Nog geen pagina&apos;s aangemaakt
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
