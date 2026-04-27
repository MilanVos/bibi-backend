import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/utils"
import { MessageSquare, FileText, Newspaper, Users } from "lucide-react"
import Link from "next/link"

export default async function PortaalDashboard() {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = await db.user.findUnique({ where: { id: session!.user.id } })

  const [forumCount, uploadCount, recentPosts] = await Promise.all([
    db.forumPost.count(),
    db.upload.count({ where: { public: true } }),
    db.forumPost.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welkom terug, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-slate-500 mt-1">Hier is een overzicht van het portaal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Forum berichten", value: forumCount, icon: MessageSquare, color: "text-blue-600" },
          { label: "Bestanden", value: uploadCount, icon: FileText, color: "text-green-600" },
          { label: "Jouw rol", value: user?.role === "ADMIN" ? "Beheerder" : "Lid", icon: Users, color: "text-purple-600" },
          { label: "Status", value: "Actief", icon: FileText, color: "text-orange-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="text-2xl font-bold text-slate-800">{value}</p>
                </div>
                <Icon className={`w-8 h-8 ${color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-slate-800 text-lg">Recente forum berichten</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <p className="text-slate-400 text-sm">Nog geen berichten</p>
            ) : (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <Link key={post.id} href={`/portaal/forum/${post.id}`}>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <MessageSquare className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{post.title}</p>
                        <p className="text-xs text-slate-400">
                          {post.user.name} · {formatDateTime(post.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-slate-800 text-lg">Snel navigeren</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/portaal/forum", label: "Forum", icon: MessageSquare },
                { href: "/portaal/documenten", label: "Documenten", icon: FileText },
                { href: "/portaal/nieuws", label: "Nieuws", icon: Newspaper },
                { href: "/portaal/profiel", label: "Mijn profiel", icon: Users },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
