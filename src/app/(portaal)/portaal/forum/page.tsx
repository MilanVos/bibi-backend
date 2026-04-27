import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils"
import { MessageSquare, Pin } from "lucide-react"
import Link from "next/link"
import { NieuwForumPost } from "@/components/portaal/nieuw-forum-post"
import { ForumVerwijderKnop } from "@/components/portaal/forum-verwijder-knop"

export default async function ForumPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  const viewer = await db.user.findUnique({ where: { id: session!.user.id } })
  const isAdmin = viewer?.role === "ADMIN" || viewer?.role === "SUPERADMIN"

  const posts = await db.forumPost.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    include: {
      user: { select: { name: true, id: true } },
      _count: { select: { replies: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Forum</h1>
          <p className="text-slate-500 text-sm mt-1">{posts.length} berichten</p>
        </div>
        <NieuwForumPost userId={session!.user.id} />
      </div>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <Card className="bg-white">
            <CardContent className="pt-8 pb-8 text-center text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nog geen berichten. Wees de eerste!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Link href={`/portaal/forum/${post.id}`} className="block">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">{post.title}</h3>
                        {post.pinned && (
                          <Badge variant="secondary" className="text-xs">
                            <Pin className="w-3 h-3 mr-1" />
                            Vastgezet
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span>{post.user.name}</span>
                        <span>·</span>
                        <span>{formatDateTime(post.createdAt)}</span>
                        <span>·</span>
                        <span>{post._count.replies} reacties</span>
                      </div>
                    </Link>
                  </div>
                  {(isAdmin || post.user.id === session!.user.id) && (
                    <ForumVerwijderKnop type="post" id={post.id} redirectAfter="/portaal/forum" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
