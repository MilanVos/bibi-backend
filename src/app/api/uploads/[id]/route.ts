import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const upload = await db.upload.findUnique({ where: { id } })

  if (!upload || !upload.data) {
    return NextResponse.json({ error: "Bestand niet gevonden" }, { status: 404 })
  }

  return new NextResponse(upload.data, {
    headers: {
      "Content-Type": upload.mimetype,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(upload.filename)}"`,
      "Content-Length": String(upload.size),
    },
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const upload = await db.upload.findUnique({ where: { id } })

  if (!upload) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })

  const isAdmin = user.role === "ADMIN" || user.role === "SUPERADMIN"
  const isOwner = upload.userId === session.user.id

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Geen toestemming" }, { status: 403 })
  }

  await db.upload.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
