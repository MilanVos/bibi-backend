import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"

async function isAdmin(sessionUser: { id: string }) {
  const user = await db.user.findUnique({ where: { id: sessionUser.id } })
  return user?.role === "ADMIN" || user?.role === "SUPERADMIN"
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || !(await isAdmin(session.user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { naam } = await req.json()
  const count = await db.category.count()
  const cat = await db.category.create({ data: { name: naam, sortOrder: count } })
  return NextResponse.json(cat, { status: 201 })
}
