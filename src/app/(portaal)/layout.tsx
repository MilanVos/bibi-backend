import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { PortaalSidebar } from "@/components/portaal/sidebar"
import { PortaalHeader } from "@/components/portaal/header"

export default async function PortaalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) redirect("/login")
  if (user.status === "PENDING") redirect("/wachten")
  if (user.status === "REJECTED" || user.status === "BLOCKED") redirect("/login")

  if (!user.twoFactorEnabled && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
    redirect("/2fa-setup")
  }

  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      menuItems: {
        where: { visibility: { in: getRoleVisibility(user.role) } },
        orderBy: { sortOrder: "asc" },
        include: { module: true, page: true },
      },
    },
  })

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <PortaalSidebar categories={categories} user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <PortaalHeader user={user} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function getRoleVisibility(role: string): string[] {
  if (role === "ADMIN" || role === "SUPERADMIN") return ["GUEST", "USER", "EDITOR", "ADMIN"]
  if (role === "EDITOR") return ["GUEST", "USER", "EDITOR"]
  return ["GUEST", "USER"]
}
