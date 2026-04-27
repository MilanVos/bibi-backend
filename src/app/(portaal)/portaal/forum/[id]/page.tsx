import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { formatDateTime, getInitials } from "@/lib/utils"
import { ForumReplyForm } from "@/components/portaal/forum-reply-form"
import { ForumVerwijderKnop } from "@/components/portaal/forum-verwijder-knop"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function ForumPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  const viewer = await db.user.findUnique({ where: { id: session!.user.id } })
  const isAdmin = viewer?.role === "ADMIN" || viewer?.role === "SUPERADMIN"

  const post = await db.forumPost.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, id: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, id: true } } },
      },
    },
  })

  if (!post) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/portaal/forum" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Terug naar forum
      </Link>

      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {getInitials(post.user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-800">{post.title}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-slate-400">
                  {post.user.name} · {formatDateTime(post.createdAt)}
                </p>
                {(isAdmin || post.user.id === session!.user.id) && (
                  <ForumVerwijderKnop type="post" id={post.id} redirectAfter="/portaal/forum" />
                )}
              </div>
              <div className="mt-4 text-slate-700 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
          {post.replies.length} Reacties
        </h2>
        {post.replies.map((reply) => (
          <Card key={reply.id} className="bg-white">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-slate-600 text-xs font-semibold flex-shrink-0">
                  {getInitials(reply.user.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">{reply.user.name}</span>
                    <span className="text-xs text-slate-400">{formatDateTime(reply.createdAt)}</span>
                    {(isAdmin || reply.user.id === session!.user.id) && (
                      <ForumVerwijderKnop type="reply" id={reply.id} />
                    )}
                  </div>
                  <p className="text-slate-700 text-sm mt-1 whitespace-pre-wrap">{reply.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ForumReplyForm postId={post.id} />
    </div>
  )
}
