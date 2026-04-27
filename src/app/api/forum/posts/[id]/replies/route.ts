import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { inhoud } = await req.json()
  if (!inhoud) return NextResponse.json({ error: "Inhoud is verplicht" }, { status: 400 })

  const post = await db.forumPost.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: "Bericht niet gevonden" }, { status: 404 })

  const reply = await db.forumReply.create({
    data: { postId: id, userId: session.user.id, content: inhoud },
  })

  return NextResponse.json(reply, { status: 201 })
}
