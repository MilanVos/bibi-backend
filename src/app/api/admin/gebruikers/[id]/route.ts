import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = await db.user.findUnique({ where: { id: session.user.id } })
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const target = await db.user.findUnique({ where: { id } })
  if (!target) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 })

  if (target.role === "SUPERADMIN") {
    return NextResponse.json({ error: "Super admin accounts kunnen niet worden gewijzigd" }, { status: 403 })
  }

  const data = await req.json()
  const allowed = ["status", "role"]
  const update: Record<string, string> = {}
  for (const key of allowed) {
    if (data[key]) update[key] = data[key]
  }

  if (update.role && target.role === "ADMIN" && admin.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Alleen een super admin kan de rol van een beheerder wijzigen" }, { status: 403 })
  }

  const updatedUser = await db.user.update({ where: { id }, data: update })

  await db.auditLog.create({
    data: {
      userId: admin.id,
      action: `Gebruiker ${updatedUser.name} bijgewerkt: ${JSON.stringify(update)}`,
      entityType: "User",
      entityId: id,
      metadata: JSON.stringify(update),
    },
  })

  return NextResponse.json(updatedUser)
}
