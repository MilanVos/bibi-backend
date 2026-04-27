import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { titel, inhoud } = await req.json()
  if (!titel || !inhoud) {
    return NextResponse.json({ error: "Titel en inhoud zijn verplicht" }, { status: 400 })
  }

  const post = await db.forumPost.create({
    data: {
      userId: session.user.id,
      title: titel,
      content: inhoud,
    },
  })

  return NextResponse.json(post, { status: 201 })
}
