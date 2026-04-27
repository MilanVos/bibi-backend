import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"

const MAX_SIZE = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) return NextResponse.json({ error: "Geen bestand" }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Bestand te groot (max 10MB)" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  const upload = await db.upload.create({
    data: {
      userId: session.user.id,
      filename: file.name,
      path: "",
      mimetype: file.type,
      size: file.size,
      data: buffer,
      public: true,
    },
  })

  return NextResponse.json({ id: upload.id, filename: upload.filename }, { status: 201 })
}
