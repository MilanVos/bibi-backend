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

  const { categoryId, label, linkType, moduleId, pageId, externalUrl } = await req.json()
  const count = await db.menuItem.count({ where: { categoryId } })

  const item = await db.menuItem.create({
    data: {
      categoryId: categoryId || null,
      label,
      linkType,
      moduleId: linkType === "MODULE" ? moduleId : null,
      pageId: linkType === "PAGE" ? pageId : null,
      externalUrl: linkType === "URL" ? externalUrl : null,
      sortOrder: count,
    },
  })

  return NextResponse.json(item, { status: 201 })
}
