import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const data: Record<string, string> = await req.json()

  for (const [key, value] of Object.entries(data)) {
    await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  }

  return NextResponse.json({ ok: true })
}
