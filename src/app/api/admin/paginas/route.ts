import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN" && user.role !== "EDITOR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { titel, slug, inhoud, gepubliceerd } = await req.json()

  const existing = await db.page.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: "Deze slug is al in gebruik" }, { status: 409 })

  const page = await db.page.create({
    data: { title: titel, slug, content: inhoud ?? "", published: gepubliceerd ?? false },
  })

  return NextResponse.json(page, { status: 201 })
}
