import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils"
import { GebruikerActies } from "@/components/admin/gebruiker-acties"

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "outline" | "secondary" }> = {
  PENDING: { label: "Wachtend", variant: "warning" },
  ACTIVE: { label: "Actief", variant: "success" },
  REJECTED: { label: "Geweigerd", variant: "destructive" },
  BLOCKED: { label: "Geblokkeerd", variant: "destructive" },
}

const ROLE_LABELS: Record<string, string> = {
  USER: "Lid",
  EDITOR: "Redacteur",
  ADMIN: "Beheerder",
  SUPERADMIN: "Super Admin",
}

export default async function GebruikersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams

  const session = await auth.api.getSession({ headers: await headers() })
  const viewer = await db.user.findUnique({ where: { id: session!.user.id } })
  const viewerRole = viewer?.role ?? "ADMIN"

  const users = await db.user.findMany({
    where: filter === "pending" ? { status: "PENDING" } : undefined,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gebruikers</h1>
          <p className="text-slate-500 text-sm mt-1">
            {filter === "pending" ? "Wachtende accounts" : `${users.length} gebruikers totaal`}
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/gebruikers" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filter ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            Alle
          </a>
          <a href="/admin/gebruikers?filter=pending" className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === "pending" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>
            Wachtend
          </a>
        </div>
      </div>

      <Card className="bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Naam</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">2FA</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Geregistreerd</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => {
                  const statusInfo = STATUS_LABELS[user.status] ?? { label: user.status, variant: "outline" as const }
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800 text-sm">{user.name}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {ROLE_LABELS[user.role] ?? user.role}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={user.twoFactorEnabled ? "success" : "outline"}>
                          {user.twoFactorEnabled ? "Aan" : "Uit"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500">{formatDateTime(user.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        <GebruikerActies
                          userId={user.id}
                          currentStatus={user.status}
                          currentRole={user.role}
                          viewerRole={viewerRole}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                Geen gebruikers gevonden
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
