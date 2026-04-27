import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const actor = await db.user.findUnique({ where: { id: session.user.id } })
  const isAdmin = actor?.role === "ADMIN" || actor?.role === "SUPERADMIN"

  const reply = await db.forumReply.findUnique({ where: { id } })
  if (!reply) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })

  if (!isAdmin && reply.userId !== session.user.id) {
    return NextResponse.json({ error: "Geen toestemming" }, { status: 403 })
  }

  await db.forumReply.delete({ where: { id } })

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "Forum reactie verwijderd",
      entityType: "ForumReply",
      entityId: id,
    },
  })

  return NextResponse.json({ success: true })
}
