import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateTime, getInitials } from "@/lib/utils"
import { Shield, User, Calendar } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Actief", color: "text-green-600" },
  PENDING: { label: "Wachtend", color: "text-yellow-600" },
  BLOCKED: { label: "Geblokkeerd", color: "text-red-600" },
}

const ROLE_LABELS: Record<string, string> = {
  USER: "Lid",
  EDITOR: "Redacteur",
  ADMIN: "Beheerder",
  SUPERADMIN: "Super Admin",
}

export default async function ProfielPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = await db.user.findUnique({ where: { id: session!.user.id } })

  if (!user) return null

  const status = STATUS_LABELS[user.status] ?? { label: user.status, color: "text-slate-600" }

  const postCount = await db.forumPost.count({ where: { userId: user.id } })
  const replyCount = await db.forumReply.count({ where: { userId: user.id } })
  const uploadCount = await db.upload.count({ where: { userId: user.id } })

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800">Mijn profiel</h1>

      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-slate-500">{user.email}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{ROLE_LABELS[user.role] ?? user.role}</Badge>
                <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                {user.twoFactorEnabled && (
                  <Badge variant="success" className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    2FA actief
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Lid since {formatDateTime(user.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Forum berichten", value: postCount },
          { label: "Reacties", value: replyCount },
          { label: "Uploads", value: uploadCount },
        ].map(({ label, value }) => (
          <Card key={label} className="bg-white">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-slate-800 text-base">Beveiliging</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-800">Twee-factor authenticatie</p>
                <p className="text-xs text-slate-400">Extra beveiliging voor je account</p>
              </div>
            </div>
            {user.twoFactorEnabled ? (
              <Badge variant="success">Ingeschakeld</Badge>
            ) : (
              <Link href="/2fa-setup">
                <Button size="sm">Instellen</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
