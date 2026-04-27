import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, FileText } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils"

export default async function AdminPage() {
  const [pendingUsers, totalUsers, modules, pages, recentLogs] = await Promise.all([
    db.user.count({ where: { status: "PENDING" } }),
    db.user.count(),
    db.module.count({ where: { enabled: true } }),
    db.page.count({ where: { published: true } }),
    db.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Overzicht</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Beheer van het Jongerenraad portaal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Wachtende accounts", value: pendingUsers, icon: Users, color: "text-yellow-600", href: "/admin/gebruikers?filter=pending", alert: pendingUsers > 0 },
          { label: "Totaal gebruikers", value: totalUsers, icon: Users, color: "text-blue-600", href: "/admin/gebruikers" },
          { label: "Actieve modules", value: modules, icon: Package, color: "text-green-600", href: "/admin/modules" },
          { label: "Gepubliceerde pagina's", value: pages, icon: FileText, color: "text-purple-600", href: "/admin/paginas" },
        ].map(({ label, value, icon: Icon, color, href, alert }) => (
          <Link key={label} href={href ?? "#"}>
            <Card className={`bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow ${alert ? "border-yellow-300 dark:border-yellow-600" : ""}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
                      {alert && value > 0 && (
                        <Badge variant="warning" className="text-xs">Actie vereist</Badge>
                      )}
                    </div>
                  </div>
                  <Icon className={`w-8 h-8 ${color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-100 text-lg flex items-center justify-between">
              Wachtende gebruikers
              {pendingUsers > 0 && <Badge variant="warning">{pendingUsers}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PendingUsersList />
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-100 text-lg">Recente activiteit</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-slate-400 text-sm">Geen activiteit</p>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-200">{log.action}</p>
                      <p className="text-xs text-slate-400">
                        {log.user?.name ?? "Systeem"} · {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function PendingUsersList() {
  const users = await db.user.findMany({
    where: { status: "PENDING" },
    take: 5,
    orderBy: { createdAt: "asc" },
  })

  if (users.length === 0) {
    return <p className="text-slate-400 text-sm">Geen wachtende gebruikers</p>
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email} · {formatDateTime(user.createdAt)}</p>
          </div>
          <Link href="/admin/gebruikers?filter=pending">
            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
              Beoordelen
            </Badge>
          </Link>
        </div>
      ))}
      {users.length >= 5 && (
        <Link href="/admin/gebruikers?filter=pending" className="text-blue-600 text-sm hover:underline">
          Alle wachtende gebruikers bekijken →
        </Link>
      )}
    </div>
  )
}
